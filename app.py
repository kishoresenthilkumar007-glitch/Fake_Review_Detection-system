import os
import re
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.linear_model import LogisticRegression
from flask import Flask, request, jsonify, render_template, send_from_directory
import joblib

app = Flask(__name__)

# Ensure NLTK packages are downloaded
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text)          # remove punctuation/numbers
    words = text.split()
    words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]
    return ' '.join(words)

MODEL_PATH = 'model.joblib'
TFIDF_PATH = 'tfidf.joblib'

best_model = None
tfidf = None

def train_and_save_model():
    global best_model, tfidf
    print("Training model...")
    df = pd.read_csv('deceptive-opinion.csv')
    df['clean_text'] = df['text'].apply(clean_text)
    
    tfidf = TfidfVectorizer(max_features=5000, ngram_range=(1,2))
    X = tfidf.fit_transform(df['clean_text'])
    y = df['deceptive']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    params = {'C': [0.1, 1, 10]}
    grid = GridSearchCV(LogisticRegression(max_iter=1000), params, cv=5, scoring='f1_macro')
    grid.fit(X_train, y_train)
    
    best_model = grid.best_estimator_
    
    # Save model and vectorizer
    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(tfidf, TFIDF_PATH)
    print("Model trained and saved successfully.")

def load_model():
    global best_model, tfidf
    if os.path.exists(MODEL_PATH) and os.path.exists(TFIDF_PATH):
        print("Loading saved model...")
        best_model = joblib.load(MODEL_PATH)
        tfidf = joblib.load(TFIDF_PATH)
    else:
        train_and_save_model()

# Load model at startup
load_model()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if not data or 'review' not in data:
        return jsonify({'error': 'No review text provided'}), 400
    
    review_text = data['review']
    cleaned = clean_text(review_text)
    vectorized = tfidf.transform([cleaned])
    
    prediction = best_model.predict(vectorized)[0]
    probs = best_model.predict_proba(vectorized)[0]
    classes = best_model.classes_
    
    # Find probability for predicted class
    pred_idx = list(classes).index(prediction)
    confidence = float(probs[pred_idx])
    
    # Map probabilities to a clean dictionary
    prob_dict = {classes[i]: float(probs[i]) for i in range(len(classes))}
    
    return jsonify({
        'review': review_text,
        'prediction': prediction,
        'confidence': confidence,
        'probabilities': prob_dict
    })

@app.route('/scan_columns', methods=['POST'])
def scan_columns():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in ['.csv', '.xlsx', '.xls']:
        return jsonify({'error': 'Unsupported file format.'}), 400
        
    try:
        if ext == '.csv':
            df = pd.read_csv(file, nrows=2)
        else:
            df = pd.read_excel(file, nrows=2)
            
        columns = [str(col) for col in df.columns]
        
        # Detect text columns
        possible_cols = ['review', 'text', 'content', 'body', 'message', 'review_text', 'reviews']
        detected_col = columns[0]
        for col in columns:
            if col.lower() in possible_cols:
                detected_col = col
                break
                
        return jsonify({
            'columns': columns,
            'detected_column': detected_col
        })
    except Exception as e:
        return jsonify({'error': f'Failed to scan columns: {str(e)}'}), 400

# In-memory storage for processed file results so the client can download it
PROCESSED_FOLDER = 'processed_files'
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

@app.route('/predict_batch', methods=['POST'])
def predict_batch():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in ['.csv', '.xlsx', '.xls']:
        return jsonify({'error': 'Unsupported file format. Please upload CSV or Excel.'}), 400
        
    try:
        if ext == '.csv':
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
    except Exception as e:
        return jsonify({'error': f'Failed to parse file: {str(e)}'}), 400
        
    # Get column mapping from form data if provided
    text_column = request.form.get('text_column')
    
    # Auto-detect column if not specified
    if not text_column:
        possible_cols = ['review', 'text', 'content', 'body', 'message', 'review_text', 'reviews']
        found_col = None
        for col in df.columns:
            if str(col).lower() in possible_cols:
                found_col = col
                break
        if found_col:
            text_column = found_col
        else:
            # Fallback to the first column with string type or simply the first column
            text_column = df.columns[0]
            
    if text_column not in df.columns:
        return jsonify({'error': f'Column "{text_column}" not found in file.'}), 400
        
    # Perform predictions
    predictions = []
    confidences = []
    
    # Clean and predict in batch
    cleaned_reviews = df[text_column].fillna("").apply(clean_text).tolist()
    if not cleaned_reviews:
         return jsonify({'error': 'File has no data rows.'}), 400
         
    vectorized = tfidf.transform(cleaned_reviews)
    preds = best_model.predict(vectorized)
    probs = best_model.predict_proba(vectorized)
    classes = list(best_model.classes_)
    
    for idx, pred in enumerate(preds):
        predictions.append(pred)
        pred_idx = classes.index(pred)
        confidences.append(float(probs[idx][pred_idx]))
        
    # Add predictions back to dataframe
    df['prediction'] = predictions
    df['confidence'] = confidences
    
    # Generate a unique task key to save the processed dataframe
    import uuid
    file_id = str(uuid.uuid4())
    processed_filepath = os.path.join(PROCESSED_FOLDER, f"{file_id}{ext}")
    
    if ext == '.csv':
        df.to_csv(processed_filepath, index=False)
    else:
        df.to_excel(processed_filepath, index=False)
        
    # Calculate stats
    total = len(df)
    deceptive_count = sum(df['prediction'] == 'deceptive')
    truthful_count = sum(df['prediction'] == 'truthful')
    
    # Prepare preview (limit to first 100 rows to keep response light)
    preview_df = df.head(100)
    preview_data = []
    for idx, row in preview_df.iterrows():
        preview_data.append({
            'index': idx + 1,
            'text': str(row[text_column])[:150] + ('...' if len(str(row[text_column])) > 150 else ''),
            'prediction': row['prediction'],
            'confidence': float(row['confidence'])
        })
        
    return jsonify({
        'file_id': file_id,
        'filename': filename,
        'columns': list(df.columns),
        'detected_text_column': text_column,
        'total_rows': total,
        'deceptive_count': int(deceptive_count),
        'truthful_count': int(truthful_count),
        'results_preview': preview_data
    })

@app.route('/download_results/<file_id>', methods=['GET'])
def download_results(file_id):
    # Find files in PROCESSED_FOLDER matching the file_id prefix
    matched_files = [f for f in os.listdir(PROCESSED_FOLDER) if f.startswith(file_id)]
    if not matched_files:
        return jsonify({'error': 'Processed file not found or expired.'}), 404
        
    filename = matched_files[0]
    return send_from_directory(PROCESSED_FOLDER, filename, as_attachment=True, download_name=f"predicted_{filename}")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
