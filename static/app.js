"use strict";
/* ==========================================================================
   Botshield AI - Premium Interactive Frontend Logic (TypeScript version)
   ========================================================================== */
// Global Variables
let selectedFile = null;
let processedFileId = null;
let currentChart = null;
// ============================================================================
// 3D WebGL Three.js Particle Wave Background
// ============================================================================
(function init3DBackground() {
    const container = document.getElementById('three-canvas-container');
    if (!container)
        return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 70;
    camera.position.y = 25;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    // Particle layout
    const SEPARATOR = 4;
    const AMOUNTX = 60;
    const AMOUNTY = 60;
    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);
    let i = 0, j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            positions[i] = ix * SEPARATOR - ((AMOUNTX * SEPARATOR) / 2); // x
            positions[i + 1] = 0; // y
            positions[i + 2] = iy * SEPARATOR - ((AMOUNTY * SEPARATOR) / 2); // z
            scales[j] = 1;
            i += 3;
            j++;
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    // Custom textured circular particle style
    const material = new THREE.PointsMaterial({
        color: 0x6366f1,
        size: 0.95,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    // Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    // Point Light (Purple Glow)
    const pointLight = new THREE.PointLight(0x8b5cf6, 2, 100);
    pointLight.position.set(0, 15, 10);
    scene.add(pointLight);
    // Mouse interactivity
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    document.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.04;
        mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.04;
    });
    let count = 0;
    function animate() {
        requestAnimationFrame(animate);
        count += 0.012;
        const posArr = geometry.attributes.position.array;
        let index = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                // Wave heights dynamic offset math
                posArr[index + 1] = (Math.sin((ix + count) * 0.35) * 5.5) +
                    (Math.sin((iy + count) * 0.45) * 5.5);
                index += 3;
            }
        }
        geometry.attributes.position.needsUpdate = true;
        // Smooth camera damp rotation based on mouse pos
        mouse.x += (mouse.targetX - mouse.x) * 0.04;
        mouse.y += (mouse.targetY - mouse.y) * 0.04;
        camera.position.x = mouse.x;
        camera.position.y = 25 - mouse.y;
        camera.lookAt(new THREE.Vector3(0, -2, 0));
        // Slow spin
        particles.rotation.y = count * 0.03;
        renderer.render(scene, camera);
    }
    // Handles window resizing
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    animate();
})();
// ============================================================================
// 3D Card Tilt Effect
// ============================================================================
function initTiltCards() {
    document.querySelectorAll('.tilt-card').forEach((el) => {
        const card = el;
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
            setTimeout(() => { card.style.transition = ''; }, 600);
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });
}
document.addEventListener('DOMContentLoaded', () => initTiltCards());
// ============================================================================
// Tab Switching
// ============================================================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const tabBtn = document.getElementById(`tab-${tabName}`);
    const contentSec = document.getElementById(`content-${tabName}`);
    if (tabBtn)
        tabBtn.classList.add('active');
    if (contentSec)
        contentSec.classList.add('active');
    // Slide indicator tab pill
    const indicator = document.getElementById('tab-indicator');
    if (indicator) {
        if (tabName === 'batch') {
            indicator.classList.add('right');
        }
        else {
            indicator.classList.remove('right');
        }
    }
    // Refresh 3D tilt effects
    setTimeout(() => {
        document.querySelectorAll('.tab-content.active .tilt-card').forEach((el) => {
            const card = el;
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }, 100);
}
// ============================================================================
// Single Review logic
// ============================================================================
const reviewTextarea = document.getElementById('review-input');
const charCounter = document.getElementById('char-counter');
if (reviewTextarea && charCounter) {
    reviewTextarea.addEventListener('input', (e) => {
        const target = e.target;
        const count = target.value.length;
        charCounter.textContent = `${count.toLocaleString()} character${count !== 1 ? 's' : ''}`;
    });
}
function clearSingleInput() {
    if (reviewTextarea && charCounter) {
        reviewTextarea.value = '';
        charCounter.textContent = '0 characters';
    }
    hideSingleResult();
}
function hideSingleResult() {
    const resultCard = document.getElementById('single-result');
    if (resultCard)
        resultCard.classList.add('hidden');
    const placeholder = document.getElementById('single-placeholder');
    if (placeholder)
        placeholder.classList.remove('hidden');
}
async function analyzeSingleReview() {
    if (!reviewTextarea)
        return;
    const reviewText = reviewTextarea.value.trim();
    if (!reviewText) {
        showToast('Please enter some review text to analyze.', 'warning');
        return;
    }
    const btn = document.getElementById('btn-analyze-single');
    if (!btn)
        return;
    const btnText = btn.querySelector('.btn-text');
    const btnIcon = btn.querySelector('.btn-icon');
    const loader = btn.querySelector('.loader');
    const scanOverlay = document.getElementById('scan-overlay');
    // Show Loading
    btn.disabled = true;
    btnText.textContent = "Analyzing...";
    btnIcon.classList.add('hidden');
    loader.classList.remove('hidden');
    hideSingleResult();
    const placeholder = document.getElementById('single-placeholder');
    if (placeholder)
        placeholder.classList.add('hidden');
    if (scanOverlay) {
        scanOverlay.classList.remove('hidden');
        lucide.createIcons();
    }
    try {
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ review: reviewText })
        });
        const data = await response.json();
        // Artificial delay for futuristic visualization
        await new Promise(r => setTimeout(r, 800));
        if (scanOverlay)
            scanOverlay.classList.add('hidden');
        if (response.ok) {
            displaySingleResult(data);
        }
        else {
            showToast(data.error || 'An error occurred during analysis.', 'error');
        }
    }
    catch (err) {
        console.error(err);
        if (scanOverlay)
            scanOverlay.classList.add('hidden');
        showToast('Failed to connect to backend server.', 'error');
    }
    finally {
        btn.disabled = false;
        btnText.textContent = "Analyze Review";
        btnIcon.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}
function displaySingleResult(data) {
    const resultCard = document.getElementById('single-result');
    const badge = document.getElementById('verdict-badge');
    const icon = document.getElementById('verdict-icon');
    const label = document.getElementById('verdict-label');
    const confidenceText = document.getElementById('verdict-confidence-text');
    const probTruthful = document.getElementById('prob-truthful');
    const probDeceptive = document.getElementById('prob-deceptive');
    const quotePreview = document.getElementById('quote-preview');
    const gaugeCircle = document.getElementById('gauge-fill-circle');
    if (!resultCard || !badge || !icon || !label || !confidenceText || !probTruthful || !probDeceptive || !quotePreview || !gaugeCircle) {
        return;
    }
    const prediction = data.prediction.toLowerCase();
    const confidencePct = (data.confidence * 100).toFixed(1);
    resultCard.className = `glass-card result-card ${prediction}`;
    badge.className = `verdict-badge ${prediction}`;
    label.textContent = prediction.toUpperCase();
    if (prediction === 'deceptive') {
        icon.setAttribute('data-lucide', 'alert-triangle');
        gaugeCircle.style.stroke = '#ef4444';
    }
    else {
        icon.setAttribute('data-lucide', 'shield-check');
        gaugeCircle.style.stroke = '#10b981';
    }
    // Circular gauge animation logic
    const circumference = 2 * Math.PI * 50; // Radius = 50
    const offset = circumference - (parseFloat(confidencePct) / 100) * circumference;
    gaugeCircle.style.strokeDashoffset = circumference.toString();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            gaugeCircle.style.strokeDashoffset = offset.toString();
        });
    });
    // Count up anim
    animateNumber(confidenceText, 0, parseFloat(confidencePct), 1200, '%');
    const tProb = (data.probabilities.truthful * 100).toFixed(1);
    const dProb = (data.probabilities.deceptive * 100).toFixed(1);
    probTruthful.textContent = `${tProb}%`;
    probDeceptive.textContent = `${dProb}%`;
    quotePreview.textContent = data.review;
    const placeholder = document.getElementById('single-placeholder');
    if (placeholder)
        placeholder.classList.add('hidden');
    lucide.createIcons();
    resultCard.classList.remove('hidden');
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
}
// ============================================================================
// Counters & Toast Notification Logic
// ============================================================================
function animateNumber(el, start, end, duration, suffix = '') {
    const startTime = performance.now();
    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const current = start + (end - start) * eased;
        el.textContent = current.toFixed(1) + suffix;
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}
function animateIntNumber(el, start, end, duration) {
    const startTime = performance.now();
    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * eased);
        el.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing)
        existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="toast-close">&times;</button>
    `;
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                bottom: 2rem;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: rgba(14, 18, 30, 0.95);
                border: 1px solid rgba(255,255,255,0.1);
                color: #f1f5f9;
                padding: 0.85rem 1.5rem;
                border-radius: 12px;
                font-family: 'Inter', sans-serif;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                z-index: 99999;
                backdrop-filter: blur(20px);
                box-shadow: 0 15px 40px rgba(0,0,0,0.5);
                animation: toastIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
            }
            .toast-warning { border-color: rgba(245, 158, 11, 0.3); }
            .toast-error { border-color: rgba(239, 68, 68, 0.3); }
            .toast-close {
                background: none; border: none; color: #64748b; cursor: pointer;
                font-size: 1.2rem; line-height: 1; padding: 0;
            }
            .toast-close:hover { color: #f1f5f9; }
            @keyframes toastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.95); }
                to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}
// ============================================================================
// Drag & Drop File Batch Upload Logic
// ============================================================================
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
if (dropZone) {
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        }, false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        }, false);
    });
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files.length > 0) {
            processSelectedFile(dt.files[0]);
        }
    });
}
function handleFileSelect(event) {
    const target = event.target;
    const files = target.files;
    if (files && files.length > 0) {
        processSelectedFile(files[0]);
    }
}
async function processSelectedFile(file) {
    var _a;
    const ext = (_a = file.name.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (!ext || !['csv', 'xlsx', 'xls'].includes(ext)) {
        showToast('Unsupported file format. Please upload CSV or Excel files.', 'warning');
        return;
    }
    selectedFile = file;
    const filenameEl = document.getElementById('details-filename');
    const filesizeEl = document.getElementById('details-filesize');
    if (filenameEl)
        filenameEl.textContent = file.name;
    if (filesizeEl)
        filesizeEl.textContent = formatBytes(file.size);
    const batchResults = document.getElementById('batch-results');
    if (batchResults)
        batchResults.classList.add('hidden');
    const placeholder = document.getElementById('batch-placeholder');
    if (placeholder)
        placeholder.classList.remove('hidden');
    await scanFileColumns(file);
}
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
async function scanFileColumns(file) {
    const dropZoneContent = document.querySelector('.upload-content');
    if (!dropZoneContent)
        return;
    const originalHtml = dropZoneContent.innerHTML;
    dropZoneContent.innerHTML = `
        <div class="loader" style="width: 32px; height: 32px; border-width: 3px; border-top-color: #6366f1; margin-bottom: 1rem;"></div>
        <p class="upload-text-primary">Scanning file structure...</p>
    `;
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await fetch('/scan_columns', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            populateColumnDropdown(data.columns, data.detected_column);
            const fileDetails = document.getElementById('file-details');
            if (fileDetails)
                fileDetails.classList.remove('hidden');
            const analyzeBtn = document.getElementById('btn-analyze-batch');
            if (analyzeBtn) {
                analyzeBtn.classList.remove('disabled');
                analyzeBtn.disabled = false;
            }
        }
        else {
            showToast(data.error || 'Failed to scan file columns.', 'error');
            clearSelectedFile();
        }
    }
    catch (err) {
        console.error(err);
        showToast('Connection to backend server failed.', 'error');
        clearSelectedFile();
    }
    finally {
        dropZoneContent.innerHTML = originalHtml;
        lucide.createIcons();
    }
}
function populateColumnDropdown(columns, selectedCol) {
    const select = document.getElementById('column-select');
    if (!select)
        return;
    select.innerHTML = '';
    columns.forEach(col => {
        const option = document.createElement('option');
        option.value = col;
        option.textContent = col;
        if (col === selectedCol) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}
function clearSelectedFile() {
    selectedFile = null;
    processedFileId = null;
    if (fileInput)
        fileInput.value = '';
    const fileDetails = document.getElementById('file-details');
    const batchResults = document.getElementById('batch-results');
    if (fileDetails)
        fileDetails.classList.add('hidden');
    if (batchResults)
        batchResults.classList.add('hidden');
    const placeholder = document.getElementById('batch-placeholder');
    if (placeholder)
        placeholder.classList.remove('hidden');
    const analyzeBtn = document.getElementById('btn-analyze-batch');
    if (analyzeBtn) {
        analyzeBtn.classList.add('disabled');
        analyzeBtn.disabled = true;
    }
}
async function analyzeBatchFile() {
    if (!selectedFile)
        return;
    const btn = document.getElementById('btn-analyze-batch');
    if (!btn)
        return;
    const btnText = btn.querySelector('.btn-text');
    const btnIcon = btn.querySelector('.btn-icon');
    const loader = btn.querySelector('.loader');
    btn.disabled = true;
    btnText.textContent = "Processing Dataset...";
    btnIcon.classList.add('hidden');
    loader.classList.remove('hidden');
    const batchResults = document.getElementById('batch-results');
    if (batchResults)
        batchResults.classList.add('hidden');
    const placeholder = document.getElementById('batch-placeholder');
    if (placeholder)
        placeholder.classList.add('hidden');
    const select = document.getElementById('column-select');
    if (!select)
        return;
    const textColumn = select.value;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('text_column', textColumn);
    try {
        const response = await fetch('/predict_batch', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            displayBatchResults(data);
        }
        else {
            showToast(data.error || 'An error occurred during dataset analysis.', 'error');
        }
    }
    catch (err) {
        console.error(err);
        showToast('Failed to connect to backend server.', 'error');
    }
    finally {
        btn.disabled = false;
        btnText.textContent = "Process Dataset";
        btnIcon.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}
function displayBatchResults(data) {
    processedFileId = data.file_id;
    const totalEl = document.getElementById('stat-total');
    const genuineEl = document.getElementById('stat-genuine');
    const deceptiveEl = document.getElementById('stat-deceptive');
    const genuinePctEl = document.getElementById('stat-genuine-pct');
    const deceptivePctEl = document.getElementById('stat-deceptive-pct');
    if (totalEl)
        animateIntNumber(totalEl, 0, data.total_rows, 1500);
    if (genuineEl)
        animateIntNumber(genuineEl, 0, data.truthful_count, 1500);
    if (deceptiveEl)
        animateIntNumber(deceptiveEl, 0, data.deceptive_count, 1500);
    const genuinePct = ((data.truthful_count / data.total_rows) * 100).toFixed(1);
    const deceptivePct = ((data.deceptive_count / data.total_rows) * 100).toFixed(1);
    if (genuinePctEl)
        genuinePctEl.textContent = `${genuinePct}%`;
    if (deceptivePctEl)
        deceptivePctEl.textContent = `${deceptivePct}%`;
    const tbody = document.getElementById('results-table-body');
    if (!tbody)
        return;
    tbody.innerHTML = '';
    data.results_preview.forEach((row, idx) => {
        const tr = document.createElement('tr');
        tr.className = row.prediction.toLowerCase();
        tr.style.opacity = '0';
        tr.style.transform = 'translateY(8px)';
        tr.style.transition = `opacity 0.3s ease ${idx * 0.015}s, transform 0.3s ease ${idx * 0.015}s`;
        const confidencePct = (row.confidence * 100).toFixed(1);
        tr.innerHTML = `
            <td class="row-index">#${row.index}</td>
            <td class="row-snippet" title="${escapeHtml(row.text)}">${escapeHtml(row.text)}</td>
            <td>
                <span class="badge ${row.prediction.toLowerCase()}">${row.prediction.toUpperCase()}</span>
            </td>
            <td>
                <div class="tbl-conf-container">
                    <div class="tbl-conf-bar-bg">
                        <div class="tbl-conf-bar-fill" style="width: ${confidencePct}%"></div>
                    </div>
                    <span>${confidencePct}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
        // Staggered layout animations triggering
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                tr.style.opacity = '1';
                tr.style.transform = 'translateY(0)';
            });
        });
    });
    renderDistributionChart(data.truthful_count, data.deceptive_count);
    const resultsDashboard = document.getElementById('batch-results');
    const placeholder = document.getElementById('batch-placeholder');
    if (placeholder)
        placeholder.classList.add('hidden');
    if (resultsDashboard) {
        resultsDashboard.classList.remove('hidden');
        lucide.createIcons();
        setTimeout(() => {
            resultsDashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}
// ============================================================================
// Chart Configuration
// ============================================================================
function renderDistributionChart(genuine, deceptive) {
    const canvas = document.getElementById('distributionChart');
    if (!canvas)
        return;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    if (currentChart) {
        currentChart.destroy();
    }
    currentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Genuine', 'Deceptive'],
            datasets: [{
                    data: [genuine, deceptive],
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: '#0e121e',
                    borderWidth: 3,
                    hoverOffset: 8,
                    hoverBorderWidth: 0,
                    borderRadius: 4
                }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1200,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            family: 'Outfit',
                            size: 12,
                            weight: '600'
                        },
                        padding: 18,
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                }
            },
            cutout: '68%'
        }
    });
}
function downloadProcessedResults() {
    if (!processedFileId)
        return;
    window.location.href = `/download_results/${processedFileId}`;
}
// ============================================================================
// ============================================================================
// Page Loader Dismissal
// ============================================================================
window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('loaded');
            document.body.classList.remove('workspace-loading');
            document.body.classList.add('workspace-active');
            setTimeout(() => {
                loader.remove();
            }, 1200);
        }, 1800);
    }
});
// ============================================================================
// Utilities
// ============================================================================
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
// ============================================================================
// Mobile Menu Navigation
// ============================================================================
function toggleMobileMenu() {
    const drawer = document.getElementById('mobile-menu-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const btn = document.getElementById('mobile-menu-toggle');
    if (drawer && overlay) {
        const isOpen = drawer.classList.toggle('open');
        overlay.classList.toggle('open');
        if (btn) {
            btn.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
            lucide.createIcons();
        }
    }
}
function handleMobileNav(tabName) {
    switchTab(tabName);
    document.querySelectorAll('.drawer-nav-item').forEach(item => item.classList.remove('active'));
    const activeItem = document.getElementById(`mobile-nav-${tabName}`);
    if (activeItem)
        activeItem.classList.add('active');
    toggleMobileMenu();
}
// Bind callbacks globally for inline HTML click events
window.toggleMobileMenu = toggleMobileMenu;
window.handleMobileNav = handleMobileNav;
window.switchTab = switchTab;
window.clearSingleInput = clearSingleInput;
window.analyzeSingleReview = analyzeSingleReview;
window.clearSelectedFile = clearSelectedFile;
window.analyzeBatchFile = analyzeBatchFile;
window.downloadProcessedResults = downloadProcessedResults;
