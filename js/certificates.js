// ============================================================
// AgroSmartHub 3.0 — Quality Certificate Generation
// ============================================================

function renderCertificates(container) {
  updateTopbar('Quality Certificates', 'Generate & manage AI-verified certificates');

  const aiResult = Session.get('lastAIResult');
  const farmer = currentUser;

  // Default cert data
  const certData = {
    certId: genCertId(farmer.state, farmer.primaryCrop || 'Tomato'),
    farmerName: farmer.name,
    farmerId: farmer.id,
    farmName: farmer.farmName || "Ramu's Green Agro Farm",
    cropName: farmer.primaryCrop || 'Tomato',
    cropVariety: 'Hybrid F1',
    harvestDate: new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}),
    grade: aiResult ? (aiResult.severity === 'healthy' ? 'A+' : aiResult.severity === 'low' ? 'A' : 'B') : 'A+',
    healthScore: aiResult ? randomInt(aiResult.healthPct[0], aiResult.healthPct[1]) : 96,
    diseaseStatus: aiResult ? aiResult.name : 'No Disease Detected',
    aiConfidence: aiResult ? randomBetween(aiResult.confidence[0], aiResult.confidence[1]).toFixed(1) : '97.4',
    temperature: '28°C – 34°C',
    blockchainId: genBlockchainId(),
    issuedDate: new Date().toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}),
    expertName: 'Dr. Suresh Patel',
    expertTitle: 'Senior Agronomist, AgroSmartHub'
  };

  Session.set('currentCert', certData);

  container.innerHTML = `
    <!-- Cert Generation Form -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;align-items:start">
      <div class="glass-card" style="padding:20px">
        <h3 style="font-size:.9rem;font-weight:700;margin-bottom:16px">📋 Certificate Details</h3>
        <div style="display:grid;gap:12px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div><label style="font-size:.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Crop Name</label>
              <select id="certCrop" style="width:100%;margin-top:4px" onchange="updateCert()">
                <option>Tomato</option><option>Paddy</option><option>Wheat</option><option>Onion</option>
                <option>Cotton</option><option>Maize</option><option>Banana</option><option>Broccoli</option>
              </select>
            </div>
            <div><label style="font-size:.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Variety</label>
              <input type="text" id="certVariety" value="${certData.cropVariety}" style="width:100%;margin-top:4px" onchange="updateCert()" />
            </div>
          </div>
          <div><label style="font-size:.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Harvest Date</label>
            <input type="date" id="certHarvestDate" value="${new Date().toISOString().split('T')[0]}" style="width:100%;margin-top:4px" onchange="updateCert()" />
          </div>
          <div><label style="font-size:.7rem;font-weight:700;color:var(--text-muted);text-transform:uppercase">Quality Grade</label>
            <select id="certGrade" style="width:100%;margin-top:4px" onchange="updateCert()">
              <option value="A+" ${certData.grade==='A+'?'selected':''}>A+ (Premium)</option>
              <option value="A" ${certData.grade==='A'?'selected':''}>A (Excellent)</option>
              <option value="B" ${certData.grade==='B'?'selected':''}>B (Good)</option>
              <option value="C">C (Fair)</option>
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:10px;padding:10px;background:rgba(22,163,74,0.06);border-radius:var(--radius-sm);border:1px solid var(--border)">
            <span style="font-size:1.1rem">🤖</span>
            <div>
              <div style="font-size:.75rem;font-weight:700;color:var(--green-400)">AI Analysis: ${certData.diseaseStatus}</div>
              <div style="font-size:.7rem;color:var(--text-muted)">Health: ${certData.healthScore}% · Confidence: ${certData.aiConfidence}%</div>
            </div>
          </div>
          <button class="btn-auth" onclick="generateAndShowCert()" style="margin-top:8px">🏅 Generate Certificate</button>
        </div>
      </div>

      <!-- Previous Certificates -->
      <div class="glass-card" style="padding:20px">
        <h3 style="font-size:.9rem;font-weight:700;margin-bottom:16px">📜 Previous Certificates</h3>
        <div id="prevCertsList">
          ${[
            {id:'CERT-TN-2025-0847', crop:'Tomato', grade:'A+', date:'Jul 5, 2025', status:'certified'},
            {id:'CERT-TN-2025-0821', crop:'Maize', grade:'A', date:'Jun 22, 2025', status:'certified'},
            {id:'CERT-TN-2025-0799', crop:'Onion', grade:'B', date:'Jun 10, 2025', status:'certified'},
            {id:'CERT-TN-2025-0784', crop:'Tomato', grade:'A+', date:'May 30, 2025', status:'certified'}
          ].map(c => `
            <div style="display:flex;align-items:center;gap:12px;padding:10px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px;cursor:pointer;transition:var(--transition)" onmouseover="this.style.borderColor='var(--border-hover)'" onmouseout="this.style.borderColor='var(--border)'">
              <span style="font-size:1.2rem">🏅</span>
              <div style="flex:1">
                <div style="font-size:.8rem;font-weight:700">${c.id}</div>
                <div style="font-size:.7rem;color:var(--text-muted)">🌾 ${c.crop} · ${c.date}</div>
              </div>
              <span style="padding:2px 8px;background:rgba(22,163,74,0.15);color:var(--green-400);border-radius:var(--radius-full);font-size:.7rem;font-weight:700">Grade ${c.grade}</span>
              <span style="padding:2px 8px;background:rgba(22,163,74,0.1);color:var(--green-400);border-radius:var(--radius-full);font-size:.65rem;font-weight:600">✅</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Certificate Preview (hidden until generated) -->
    <div id="certPreviewSection" style="display:none">
      <h3 style="font-size:.9rem;font-weight:700;margin-bottom:16px">🏅 Certificate Preview</h3>
      <div class="cert-container">
        <div class="certificate" id="certificateEl">
          <div class="cert-bg-pattern"></div>
          <div class="cert-header">
            <div class="cert-logo">🌾</div>
            <div class="cert-org-name">AGRISMARTHUB</div>
            <div class="cert-title">Agricultural Quality Certificate</div>
            <div class="cert-subtitle">DIGITAL · BLOCKCHAIN VERIFIED · AI CERTIFIED</div>
          </div>
          <hr class="cert-divider" />
          <div class="cert-body" id="certBody"></div>
          <div class="cert-blockchain" id="certBlockchain"></div>
          <div class="cert-footer" id="certFooter"></div>
        </div>

        <!-- Actions -->
        <div class="cert-actions">
          <button class="btn-cert btn-cert-primary" onclick="downloadCertPDF()">📥 Download PDF</button>
          <button class="btn-cert btn-cert-secondary" onclick="printCert()">🖨️ Print</button>
          <button class="btn-cert btn-cert-secondary" onclick="shareCert()">📤 Share</button>
          <button class="btn-cert btn-cert-secondary" onclick="navigateTo('marketplace')">🛒 List for Sale</button>
        </div>
      </div>
    </div>
  `;
}

function generateAndShowCert() {
  const certData = Session.get('currentCert') || {};

  // Update from form
  const crop = document.getElementById('certCrop')?.value;
  const variety = document.getElementById('certVariety')?.value;
  const harvestDate = document.getElementById('certHarvestDate')?.value;
  const grade = document.getElementById('certGrade')?.value;

  if (crop) certData.cropName = crop;
  if (variety) certData.cropVariety = variety;
  if (harvestDate) certData.harvestDate = new Date(harvestDate).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'});
  if (grade) certData.grade = grade;

  Session.set('currentCert', certData);

  // Render cert body
  const body = document.getElementById('certBody');
  const blockchain = document.getElementById('certBlockchain');
  const footer = document.getElementById('certFooter');

  if (body) {
    body.innerHTML = `
      <div>
        ${[
          {label:'Certificate ID', value: certData.certId},
          {label:'Farmer Name', value: certData.farmerName},
          {label:'Farmer ID', value: certData.farmerId},
          {label:'Farm Name', value: certData.farmName},
          {label:'State', value: currentUser.state || 'Tamil Nadu'},
          {label:'Soil Type', value: currentUser.soilType || 'Black Soil'}
        ].map(f => `
          <div class="cert-field">
            <div class="cert-field-label">${f.label}</div>
            <div class="cert-field-value">${f.value}</div>
          </div>
        `).join('')}
      </div>
      <div>
        ${[
          {label:'Crop Name', value: certData.cropName},
          {label:'Crop Variety', value: certData.cropVariety},
          {label:'Harvest Date', value: certData.harvestDate},
          {label:'AI Health Score', value: certData.healthScore + '%'},
          {label:'Disease Status', value: certData.diseaseStatus},
          {label:'AI Confidence', value: certData.aiConfidence + '%'}
        ].map(f => `
          <div class="cert-field">
            <div class="cert-field-label">${f.label}</div>
            <div class="cert-field-value">${f.value}</div>
          </div>
        `).join('')}
        <div class="cert-field">
          <div class="cert-field-label">Quality Grade</div>
          <div class="cert-grade-badge">⭐ Grade ${certData.grade}</div>
        </div>
        <div class="cert-field" style="margin-top:8px">
          <span class="cert-status-badge cert-status-certified">✅ Certified for Sale</span>
        </div>
      </div>
      <!-- QR Code -->
      <div class="cert-qr-section" style="grid-column:1/-1">
        <div class="cert-qr-wrap" id="certQRWrap"></div>
        <div class="cert-qr-label">Scan to verify authenticity</div>
      </div>
    `;
    // Give extra column span to cert-body
    body.style.gridTemplateColumns = '1fr 1fr';
  }

  if (blockchain) {
    blockchain.innerHTML = `
      <div class="cert-blockchain-icon">⛓️</div>
      <div class="cert-blockchain-text">
        <div class="cert-blockchain-label">Blockchain Verification ID</div>
        <div class="cert-blockchain-id">${certData.blockchainId}</div>
      </div>
      <span class="cert-status-badge cert-status-certified" style="margin-left:auto">Verified</span>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <div class="cert-signature">
        <div class="cert-sig-line"></div>
        <div class="cert-sig-name">${certData.expertName}</div>
        <div style="font-size:.6rem;color:var(--text-dim)">${certData.expertTitle}</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:.7rem;color:var(--text-muted)">Issued on</div>
        <div style="font-size:.85rem;font-weight:700">${certData.issuedDate}</div>
        <div class="cert-id" style="margin-top:4px">${certData.certId}</div>
      </div>
      <div class="cert-signature" style="text-align:right">
        <div class="cert-sig-line" style="margin-left:auto"></div>
        <div class="cert-sig-name">AI Verification System</div>
        <div style="font-size:.6rem;color:var(--text-dim)">AgroSmartHub 3.0</div>
      </div>
    `;
  }

  // Generate QR Code
  setTimeout(() => {
    const qrWrap = document.getElementById('certQRWrap');
    if (qrWrap && typeof QRCode !== 'undefined') {
      QRCode.toCanvas(document.createElement('canvas'),
        `CERT:${certData.certId}|FARMER:${certData.farmerId}|CROP:${certData.cropName}|GRADE:${certData.grade}|HASH:${certData.blockchainId.substring(0,16)}`,
        { width: 100, color: { dark: '#16a34a', light: '#ffffff' } },
        (err, canvas) => {
          if (!err) { qrWrap.innerHTML = ''; qrWrap.appendChild(canvas); }
        }
      );
    } else if (qrWrap) {
      qrWrap.innerHTML = `<div style="width:100px;height:100px;background:#111;display:flex;align-items:center;justify-content:center;font-size:2rem">📱</div>`;
    }
  }, 100);

  // Show certificate section
  const section = document.getElementById('certPreviewSection');
  if (section) {
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  showToast('Certificate generated! 🏅', 'success');
}

function updateCert() { /* live update handled on form change */ }

function downloadCertPDF() {
  const certData = Session.get('currentCert') || {};
  if (typeof window.jspdf !== 'undefined' || typeof jspdf !== 'undefined') {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      // Background
      doc.setFillColor(7, 26, 12);
      doc.rect(0, 0, 210, 297, 'F');

      // Header
      doc.setTextColor(34, 197, 94);
      doc.setFontSize(20); doc.setFont('helvetica', 'bold');
      doc.text('AGRISMARTHUB', 105, 25, {align:'center'});

      doc.setFontSize(14);
      doc.text('Agricultural Quality Certificate', 105, 35, {align:'center'});

      doc.setTextColor(187, 247, 208);
      doc.setFontSize(9);
      doc.text('DIGITAL · BLOCKCHAIN VERIFIED · AI CERTIFIED', 105, 43, {align:'center'});

      // Line
      doc.setDrawColor(22, 163, 74); doc.line(20, 48, 190, 48);

      // Fields
      doc.setFontSize(10); doc.setTextColor(187, 247, 208);
      const fields = [
        ['Certificate ID:', certData.certId || 'N/A'],
        ['Farmer Name:', certData.farmerName || currentUser.name],
        ['Farmer ID:', certData.farmerId || currentUser.id],
        ['Crop:', `${certData.cropName} (${certData.cropVariety})`],
        ['Harvest Date:', certData.harvestDate || '-'],
        ['Quality Grade:', `Grade ${certData.grade}`],
        ['Health Score:', `${certData.healthScore}%`],
        ['Disease Status:', certData.diseaseStatus || 'None'],
        ['AI Confidence:', `${certData.aiConfidence}%`],
        ['Expert:', certData.expertName || 'Dr. Suresh Patel'],
        ['Issued Date:', certData.issuedDate || new Date().toLocaleDateString()],
        ['Status:', 'CERTIFIED FOR SALE ✓']
      ];
      let y = 60;
      fields.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold'); doc.setTextColor(107, 114, 128); doc.text(label, 25, y);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(240, 253, 244); doc.text(value, 85, y);
        y += 12;
      });

      // Blockchain
      doc.setDrawColor(22, 163, 74); doc.line(20, y+2, 190, y+2); y += 10;
      doc.setFont('helvetica', 'bold'); doc.setTextColor(107, 114, 128); doc.text('Blockchain ID:', 25, y);
      y += 8; doc.setFont('courier', 'normal'); doc.setFontSize(7);
      doc.setTextColor(34, 197, 94); doc.text(certData.blockchainId || '', 25, y, {maxWidth:160});

      doc.save(`${certData.certId || 'certificate'}.pdf`);
      showToast('PDF downloaded!', 'success');
    } catch(e) {
      showToast('PDF download: ' + e.message, 'error');
    }
  } else {
    showToast('jsPDF loading… try again in a moment', 'warning');
  }
}

function printCert() {
  const certEl = document.getElementById('certificateEl');
  if (!certEl) return;
  const w = window.open('', '_blank');
  w.document.write(`<html><head><title>Certificate</title>
    <style>body{background:#030a05;color:#f0fdf4;font-family:Outfit,sans-serif;}
    .certificate{border:2px solid #15803d;border-radius:16px;padding:40px;max-width:800px;margin:20px auto;}
    </style></head><body>${certEl.outerHTML}</body></html>`);
  w.document.close();
  setTimeout(() => w.print(), 500);
}

function shareCert() {
  const certData = Session.get('currentCert') || {};
  const url = `${window.location.origin}/app.html?verify=${certData.certId}`;
  if (navigator.share) {
    navigator.share({ title: `Quality Certificate — ${certData.cropName}`, text: `I just got my crop certified by AgroSmartHub! Grade: ${certData.grade}\nVerify: ${url}`, url });
  } else {
    navigator.clipboard?.writeText(url).then(() => showToast('Certificate URL copied to clipboard!', 'success')).catch(() => showToast(`Share URL: ${url}`, 'info'));
  }
}
