# Fake Hotel Review Detection System

A modern Flask-based web application and machine learning system that detects whether hotel reviews are **truthful** or **deceptive**. 

The model is trained on the *Deceptive Opinion Spam Corpus* using a **Logistic Regression** classifier with an optimized **TF-IDF vectorizer**.

---

## 🚀 Features

- **Single Review Analyzer**: Enter a review manually to instantly verify its authenticity and check the confidence percentage.
- **Batch Processing**: Upload a CSV or Excel file containing multiple reviews, auto-detect columns, analyze them in batch, view statistics in real-time, and download the results.
- **Modern User Interface**: Premium, responsive dashboard built with a harmonized dark/glassmorphic color palette, interactive cards, micro-animations, and styled data visualizations.

---

## 🛠️ Tech Stack

- **Backend**: Python (Flask)
- **Frontend**: HTML5, Vanilla CSS, TypeScript / JavaScript
- **Machine Learning**: Scikit-learn, Pandas, NLTK, Joblib
- **Data Visualizations**: Seaborn, Matplotlib (for training notebooks)

---

## 📦 Getting Started

### Prerequisites

- Python 3.8 or higher
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kishoresenthilkumar007-glitch/Fake_Review_Detection-system.git
   cd Fake_Review_Detection-system
   ```

2. **Set up a Virtual Environment:**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize and Train the Model (Optional):**
   The application will automatically train the model on its first run if the saved model file (`model.joblib` & `tfidf.joblib`) is not found. To train it manually or view the analysis, run:
   ```bash
   python fake_review_detection.py
   ```

---

## 🏃 Running the Web App

Start the Flask development server:
```bash
python app.py
```
Open your browser and navigate to `http://127.0.0.1:5000` to interact with the application.

---

## 📂 Project Structure

- `app.py`: Flask application server. Handles single predictions, batch file uploads, and serving results.
- `fake_review_detection.py`: Training pipeline script (data preprocessing, hyperparameter tuning with Grid Search, and model evaluation).
- `deceptive-opinion.csv`: Gold standard dataset of 1600 reviews.
- `requirements.txt`: Python package dependencies.
- `static/`: Contains stylesheet (`style.css`), TypeScript code (`app.ts`), and compiled JavaScript (`app.js`).
- `templates/`: HTML templates for Flask (`index.html`).
- `model.joblib` / `tfidf.joblib`: Pre-trained classifier and TF-IDF vectorizer.
