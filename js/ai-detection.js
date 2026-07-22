// ============================================================
// AgroSmartHub 3.0 — AI Crop Health Detection
// ============================================================

function renderAIDetection(container) {
  updateTopbar('AI Crop Health Detection', 'Upload image for instant analysis');
  container.innerHTML = `
    <div class="ai-panel" id="aiPanel">
      <!-- Upload Zone -->
      <div>
        <div class="ai-upload-zone glass-card" id="aiUploadZone"
             ondragover="aiDragOver(event)" ondragleave="aiDragLeave()" ondrop="aiDrop(event)">
          <div class="ai-upload-icon" id="aiUploadIcon">🌿</div>
          <div class="ai-upload-title">Upload Crop Image</div>
          <div class="ai-upload-desc">Drag & drop or choose from options below.<br/>Supported: JPG, PNG, WEBP (max 10MB)</div>
          <div class="ai-upload-btns">
            <button class="ai-btn" onclick="document.getElementById('cropImageInput').click()">📁 Gallery</button>
            <button class="ai-btn" onclick="openCamera()">📷 Camera</button>
            <button class="ai-btn" onclick="loadDemoImage()">🖼 Use Demo</button>
          </div>
          <input type="file" id="cropImageInput" accept="image/*" style="display:none" onchange="handleImageUpload(this)" />
        </div>
        <img id="aiPreviewImg" class="ai-preview-img" alt="Crop preview" style="margin-top:16px;width:100%;max-height:280px;object-fit:cover;border-radius:var(--radius-lg);border:1px solid var(--border)" />

        <!-- Scanning Animation -->
        <div class="ai-scanning glass-card" id="aiScanning" style="margin-top:16px">
          <div class="scan-animation"></div>
          <h3 style="margin-bottom:8px">Analyzing with YOLOv8 AI…</h3>
          <p style="font-size:.8rem;color:var(--text-muted)" id="scanningStep">Preprocessing image</p>
          <div style="margin-top:16px;background:var(--surface-3);border-radius:99px;height:4px;overflow:hidden">
            <div id="scanBar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--green-600),var(--teal-400));border-radius:99px;transition:width .3s"></div>
          </div>
        </div>

        <!-- Scan History -->
        <div class="glass-card" style="margin-top:16px;padding:16px" id="scanHistory">
          <h3 style="font-size:.85rem;font-weight:700;margin-bottom:12px">Recent Scans</h3>
          <div id="scanHistoryList"></div>
        </div>
      </div>

      <!-- Results Panel -->
      <div>
        <!-- Health Ring + Results -->
        <div class="glass-card" id="aiResultCard" style="padding:24px">
          <div id="aiInitState" style="text-align:center;padding:40px 20px">
            <div style="font-size:3rem;margin-bottom:16px">🔬</div>
            <h3 style="font-size:1rem;font-weight:700;margin-bottom:8px">Ready to Analyze</h3>
            <p style="font-size:.8rem;color:var(--text-muted)">Upload a crop image to get instant AI health analysis with disease detection, confidence scores, and treatment recommendations.</p>
            <div style="margin-top:20px;display:flex;flex-direction:column;gap:8px">
              ${['Detects 12+ diseases & deficiencies','96-99% accuracy with YOLOv8','Treatment & fertilizer recommendations','Yield loss estimation','Auto-generate quality certificate'].map(f => `
                <div style="display:flex;align-items:center;gap:8px;font-size:.78rem;color:var(--text-secondary)">
                  <span style="color:var(--green-400)">✓</span>${f}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="ai-results" id="aiResults">
            <!-- Health Score Ring -->
            <div style="text-align:center;margin-bottom:24px">
              <svg class="health-ring" viewBox="0 0 120 120" width="120" height="120">
                <circle class="ring-track" cx="60" cy="60" r="50" fill="none" stroke="var(--surface-3)" stroke-width="10"/>
                <circle class="ring-fill" id="healthRingFill" cx="60" cy="60" r="50" fill="none" stroke="var(--green-400)" stroke-width="10" stroke-linecap="round" stroke-dasharray="314" stroke-dashoffset="314" style="transition:stroke-dashoffset 1.5s ease"/>
              </svg>
              <div style="margin-top:-70px;margin-bottom:50px">
                <div class="health-ring-inner" id="healthPct">--%</div>
                <div class="health-ring-sub">Health Score</div>
              </div>
            </div>

            <!-- Disease Header -->
            <div class="ai-result-header" id="aiResultHeader">
              <span class="ai-result-emoji" id="aiResultEmoji"></span>
              <div>
                <div class="ai-disease-name" id="aiDiseaseName"></div>
                <div class="ai-confidence" id="aiConfidenceText"></div>
                <div class="ai-severity" id="aiSeverityBadge"></div>
              </div>
            </div>

            <!-- Metrics Grid -->
            <div class="ai-metrics-grid" style="margin-bottom:16px" id="aiMetricsGrid"></div>

            <!-- Recommendations -->
            <div style="margin-bottom:16px" id="aiRecommendations"></div>

            <!-- Generate Certificate Button -->
            <button class="btn-auth" id="genCertBtn" onclick="generateCertFromAI()" style="background:linear-gradient(135deg,#f59e0b,#f97316)">
              🏅 Generate Quality Certificate
            </button>
          </div>
        </div>

        <!-- Quick Detect Buttons -->
        <div class="glass-card" style="margin-top:16px;padding:16px">
          <h3 style="font-size:.85rem;font-weight:700;margin-bottom:12px">🧪 Test AI with Sample Diseases</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${ASH.diseases.map((d,i) => `
              <button onclick="simulateDetection(${i})" style="padding:6px 12px;background:rgba(22,163,74,0.08);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-secondary);font-family:Outfit,sans-serif;font-size:.75rem;font-weight:500;cursor:pointer;transition:var(--transition)" onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">${d.emoji} ${d.name}</button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  renderScanHistory();
}

let lastDetectedDisease = null;

function handleImageUpload(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    showImageAndScan(e.target.result, randomInt(0, ASH.diseases.length - 1));
  };
  reader.readAsDataURL(file);
}

function loadDemoImage() {
  // Use a placeholder SVG as demo image
  const svgData = `<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#0d2b16"/><text x="200" y="140" text-anchor="middle" fill="#22c55e" font-size="60">🍅</text><text x="200" y="200" text-anchor="middle" fill="#bbf7d0" font-size="18">Tomato Crop</text><text x="200" y="225" text-anchor="middle" fill="#6b7280" font-size="12">Demo crop image</text></svg>`;
  const dataUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
  showImageAndScan(dataUrl, randomInt(0, ASH.diseases.length - 1));
}

function openCamera() {
  const input = document.getElementById('cropImageInput');
  if (input) { input.setAttribute('capture', 'environment'); input.click(); }
}

function showImageAndScan(src, diseaseIdx) {
  const preview = document.getElementById('aiPreviewImg');
  if (preview) { preview.src = src; preview.style.display = 'block'; }
  document.getElementById('aiInitState').style.display = 'none';
  document.getElementById('aiResults').style.display = 'none';
  const scanning = document.getElementById('aiScanning');
  scanning.classList.add('visible');
  runScanAnimation(diseaseIdx);
}

function runScanAnimation(diseaseIdx) {
  const steps = ['Preprocessing image', 'Extracting features', 'Running YOLOv8 model', 'Analyzing leaf patterns', 'Detecting diseases', 'Computing confidence scores', 'Generating recommendations…'];
  const bar = document.getElementById('scanBar');
  const stepEl = document.getElementById('scanningStep');
  let i = 0;
  const interval = setInterval(() => {
    if (stepEl) stepEl.textContent = steps[i] || 'Finalizing…';
    if (bar) bar.style.width = `${Math.min((i / steps.length) * 100, 95)}%`;
    i++;
    if (i >= steps.length) {
      clearInterval(interval);
      setTimeout(() => {
        if (bar) bar.style.width = '100%';
        setTimeout(() => showResults(diseaseIdx), 300);
      }, 400);
    }
  }, 350);
}

function showResults(diseaseIdx) {
  const disease = ASH.diseases[diseaseIdx];
  lastDetectedDisease = disease;
  const scanning = document.getElementById('aiScanning');
  scanning.classList.remove('visible');

  const results = document.getElementById('aiResults');
  results.classList.add('visible');

  const confidence = randomBetween(disease.confidence[0], disease.confidence[1]).toFixed(1);
  const healthPct = randomBetween(disease.healthPct[0], disease.healthPct[1]).toFixed(0);

  // Health ring
  const ring = document.getElementById('healthRingFill');
  const pctEl = document.getElementById('healthPct');
  const circum = 314;
  if (ring) ring.style.strokeDashoffset = circum - (healthPct / 100) * circum;
  if (ring) ring.style.stroke = healthPct > 75 ? 'var(--green-400)' : healthPct > 50 ? 'var(--amber-400)' : 'var(--red-400)';
  if (pctEl) pctEl.textContent = `${healthPct}%`;

  // Disease info
  document.getElementById('aiResultEmoji').textContent = disease.emoji;
  document.getElementById('aiDiseaseName').textContent = disease.name;
  document.getElementById('aiConfidenceText').textContent = `AI Confidence: ${confidence}%`;
  const sevBadge = document.getElementById('aiSeverityBadge');
  sevBadge.textContent = capitalize(disease.severity);
  sevBadge.className = `ai-severity sev-${disease.severity}`;

  // Metrics
  const metricsGrid = document.getElementById('aiMetricsGrid');
  metricsGrid.innerHTML = [
    {label:'Affected Area', value: disease.affectedArea},
    {label:'Severity', value: capitalize(disease.severity)},
    {label:'Yield Loss Est.', value: disease.yieldLoss},
    {label:'Recovery Time', value: disease.recovery.split('—')[0]||disease.recovery}
  ].map(m => `<div class="ai-metric"><div class="ai-metric-label">${m.label}</div><div class="ai-metric-value">${m.value}</div></div>`).join('');

  // Recommendations
  const recsEl = document.getElementById('aiRecommendations');
  recsEl.innerHTML = `
    <h4 style="font-size:.8rem;font-weight:700;margin-bottom:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em">Treatment Recommendations</h4>
    ${[
      {icon:'💊', label:'Medicine', value: disease.medicine},
      {icon:'🧪', label:'Fertilizer', value: disease.fertilizer},
      {icon:'💧', label:'Water', value: disease.water},
      {icon:'⚠️', label:'Future Risk', value: disease.risk}
    ].map(r => `
      <div style="display:flex;gap:10px;padding:10px;background:rgba(22,163,74,0.05);border-radius:var(--radius-sm);margin-bottom:8px;border-left:2px solid var(--border)">
        <span style="font-size:1rem">${r.icon}</span>
        <div><div style="font-size:.68rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">${r.label}</div><div style="font-size:.8rem;color:var(--text-secondary);margin-top:2px">${r.value}</div></div>
      </div>
    `).join('')}
  `;

  // Save to history
  saveScanHistory({ disease: disease.name, emoji: disease.emoji, confidence, healthPct, severity: disease.severity });
  renderScanHistory();
  showToast(`Analysis complete: ${disease.name}`, disease.severity === 'healthy' ? 'success' : disease.severity === 'critical' ? 'error' : 'warning');
}

function simulateDetection(idx) {
  // Show the upload zone as active
  document.getElementById('aiInitState').style.display = 'none';
  document.getElementById('aiResults').style.display = 'none';
  const scanning = document.getElementById('aiScanning');
  scanning.classList.add('visible');
  runScanAnimation(idx);
}

// ─── SCAN HISTORY ───
function saveScanHistory(entry) {
  let history = JSON.parse(sessionStorage.getItem('ash_scan_history') || '[]');
  history.unshift({ ...entry, time: new Date().toLocaleTimeString() });
  if (history.length > 5) history = history.slice(0,5);
  sessionStorage.setItem('ash_scan_history', JSON.stringify(history));
}
function getScanHistory() {
  return JSON.parse(sessionStorage.getItem('ash_scan_history') || '[]');
}
function renderScanHistory() {
  const el = document.getElementById('scanHistoryList');
  if (!el) return;
  const history = getScanHistory();
  if (!history.length) {
    el.innerHTML = '<div style="font-size:.75rem;color:var(--text-dim);text-align:center;padding:12px">No scans yet</div>';
    return;
  }
  el.innerHTML = history.map(h => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(22,163,74,0.04);border-radius:var(--radius-sm);margin-bottom:6px;font-size:.78rem">
      <span>${h.emoji}</span>
      <div style="flex:1">
        <div style="font-weight:600">${h.disease}</div>
        <div style="color:var(--text-muted);font-size:.7rem">${h.time} · Health: ${h.healthPct}%</div>
      </div>
      <span class="ai-severity sev-${h.severity}" style="font-size:.65rem;padding:2px 8px">${capitalize(h.severity)}</span>
    </div>
  `).join('');
}

// ─── DRAG & DROP ───
function aiDragOver(e) { e.preventDefault(); document.getElementById('aiUploadZone')?.classList.add('drag-over'); }
function aiDragLeave() { document.getElementById('aiUploadZone')?.classList.remove('drag-over'); }
function aiDrop(e) {
  e.preventDefault();
  document.getElementById('aiUploadZone')?.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (ev) => showImageAndScan(ev.target.result, randomInt(0, ASH.diseases.length - 1));
    reader.readAsDataURL(file);
  }
}

// ─── GENERATE CERT FROM AI ───
function generateCertFromAI() {
  if (lastDetectedDisease) {
    // Store AI result for certificate
    Session.set('lastAIResult', lastDetectedDisease);
  }
  navigateTo('certificates');
}
