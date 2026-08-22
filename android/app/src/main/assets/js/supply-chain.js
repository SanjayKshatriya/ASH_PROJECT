// ============================================================
// AgroSmartHub 3.0 — Supply Chain Tracker + Charts + Notifications + Community
// ============================================================

// ─── SUPPLY CHAIN ───
function renderSupplyChain(container) {
  updateTopbar('Supply Chain', 'Real-time farm-to-customer tracking');

  container.innerHTML = `
    <div class="supply-chain-panel">
      <!-- Map -->
      <div>
        <div class="glass-card" style="padding:0;overflow:hidden;margin-bottom:16px">
          <div id="supplyMap" style="height:480px"></div>
        </div>
        <div class="glass-card" style="padding:16px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--green-400)"></div><span style="font-size:.78rem;font-weight:600">Active Shipment: Order #ORD-2025071001</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:.78rem">
            <div><div style="color:var(--text-muted);font-size:.65rem;text-transform:uppercase;font-weight:700">Origin</div><div style="font-weight:700;margin-top:2px">🌾 Coimbatore, TN</div></div>
            <div><div style="color:var(--text-muted);font-size:.65rem;text-transform:uppercase;font-weight:700">Destination</div><div style="font-weight:700;margin-top:2px">📍 Bangalore, KA</div></div>
            <div><div style="color:var(--text-muted);font-size:.65rem;text-transform:uppercase;font-weight:700">ETA</div><div style="font-weight:700;margin-top:2px;color:var(--green-400)">Jul 10, 10:00 AM</div></div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div>
        <div class="glass-card" style="padding:20px">
          <h3 style="font-size:.9rem;font-weight:700;margin-bottom:20px">📦 Shipment Timeline</h3>
          <div class="supply-timeline">
            ${ASH.supplyNodes.map(node => `
              <div class="supply-step">
                <div class="supply-dot ${node.status}">
                  ${node.status === 'done' ? '✅' : node.status === 'active' ? node.emoji : '⏳'}
                </div>
                <div class="supply-info">
                  <div class="supply-step-name" style="color:${node.status==='active'?'var(--green-400)':node.status==='done'?'var(--text-primary)':'var(--text-muted)'}">${node.name}</div>
                  <div class="supply-step-detail">${node.location}</div>
                  <div class="supply-step-time">${node.time}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Delivery Partner -->
        <div class="glass-card" style="padding:16px;margin-top:16px">
          <h4 style="font-size:.8rem;font-weight:700;margin-bottom:12px">🚚 Delivery Partner</h4>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#0d9488);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:white">VR</div>
            <div style="flex:1">
              <div style="font-weight:700;font-size:.85rem">Vijay Rangan</div>
              <div style="font-size:.72rem;color:var(--text-muted)">🚛 TN-31 AB 1234 · Rating: ⭐ 4.8</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px">
              <button onclick="showToast('Calling driver...','info')" style="padding:6px 12px;background:rgba(22,163,74,0.15);border:1px solid rgba(22,163,74,0.3);border-radius:var(--radius-full);color:var(--green-400);font-size:.75rem;font-weight:600;cursor:pointer;font-family:Outfit,sans-serif">📞 Call</button>
              <button onclick="showToast('Opening chat...','info')" style="padding:6px 12px;background:rgba(22,163,74,0.08);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-muted);font-size:.75rem;cursor:pointer;font-family:Outfit,sans-serif">💬 Chat</button>
            </div>
          </div>
        </div>

        <!-- Temperature Log -->
        <div class="glass-card" style="padding:16px;margin-top:16px">
          <h4 style="font-size:.8rem;font-weight:700;margin-bottom:8px">🌡️ Temperature Log (Cold Chain)</h4>
          <div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--text-muted);margin-bottom:4px"><span>Storage</span><span>Target: 8-12°C</span></div>
          ${[{time:'6:00 AM',temp:9.2},{time:'9:00 AM',temp:10.1},{time:'12:00 PM',temp:'In transit'},{time:'3:00 PM',temp:'Est. 10°C'}].map(r => `
            <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(34,197,94,0.07);font-size:.78rem">
              <span style="color:var(--text-muted)">${r.time}</span>
              <span style="font-weight:600;color:${typeof r.temp === 'number' && r.temp <= 12 ? 'var(--green-400)' : 'var(--text-muted)'}">${typeof r.temp === 'number' ? r.temp + '°C' : r.temp}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Initialize Leaflet map
  setTimeout(() => {
    initSupplyMap();
  }, 200);
}

function initSupplyMap() {
  const mapEl = document.getElementById('supplyMap');
  if (!mapEl || !window.L) return;

  // Destroy existing map
  if (mapEl._leaflet_id) return;

  const map = L.map('supplyMap').setView([12.2, 77.4], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Custom marker icons
  const doneIcon = L.divIcon({ className: '', html: '<div style="width:28px;height:28px;border-radius:50%;background:#16a34a;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)">✅</div>', iconSize:[28,28], iconAnchor:[14,14] });
  const activeIcon = L.divIcon({ className: '', html: '<div style="width:32px;height:32px;border-radius:50%;background:#f97316;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 2px 12px rgba(249,115,22,0.5);animation:pulse-dot 1s infinite">🚛</div>', iconSize:[32,32], iconAnchor:[16,16] });
  const pendingIcon = L.divIcon({ className: '', html: '<div style="width:24px;height:24px;border-radius:50%;background:#6b7280;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid white">⏳</div>', iconSize:[24,24], iconAnchor:[12,12] });

  const coords = [];
  ASH.supplyNodes.forEach(node => {
    const icon = node.status === 'done' ? doneIcon : node.status === 'active' ? activeIcon : pendingIcon;
    const marker = L.marker([node.lat, node.lng], { icon }).addTo(map);
    marker.bindPopup(`<div style="font-family:Outfit,sans-serif;min-width:200px"><div style="font-weight:700;font-size:13px;margin-bottom:4px">${node.emoji} ${node.name}</div><div style="font-size:11px;color:#666">${node.location}</div><div style="font-size:11px;margin-top:4px">${node.time}</div></div>`);
    coords.push([node.lat, node.lng]);
  });

  // Draw route line
  L.polyline(coords, { color: '#16a34a', weight: 3, dashArray: '8 4', opacity: 0.8 }).addTo(map);
}

// ─── COMMUNITY ───
function renderCommunity(container) {
  updateTopbar('Community', 'Connect with farmers and experts');

  container.innerHTML = `
    <div class="community-grid">
      <!-- Posts -->
      <div>
        <!-- New Post -->
        <div class="glass-card" style="padding:20px;margin-bottom:20px">
          <div style="display:flex;gap:12px">
            <div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,${currentUser.avatarColor||'#16a34a'},#0d9488);display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0">${currentUser.avatar}</div>
            <div style="flex:1">
              <textarea id="newPostText" placeholder="Share your farming experience, ask a question, or post an update…" rows="3" style="width:100%;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius-sm);color:var(--text-primary);padding:10px 14px;font-family:Outfit,sans-serif;font-size:.875rem;resize:none"></textarea>
              <div style="display:flex;gap:8px;margin-top:8px">
                <button onclick="postCommunity()" style="padding:8px 18px;background:linear-gradient(135deg,var(--green-600),var(--teal-600));border:none;border-radius:var(--radius-full);color:white;font-family:Outfit,sans-serif;font-weight:600;font-size:.8rem;cursor:pointer">Post</button>
                <button style="padding:8px 12px;background:rgba(22,163,74,0.08);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-muted);cursor:pointer;font-size:.8rem">📷 Photo</button>
                <button style="padding:8px 12px;background:rgba(22,163,74,0.08);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--text-muted);cursor:pointer;font-size:.8rem">🏷️ Tag Expert</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Posts -->
        <div id="communityPosts">
          ${ASH.communityPosts.map(p => buildPostCard(p)).join('')}
        </div>
      </div>

      <!-- Sidebar -->
      <div>
        <!-- Expert of Day -->
        <div class="glass-card" style="padding:20px;margin-bottom:16px;background:linear-gradient(135deg,rgba(37,99,235,0.1),rgba(13,148,136,0.1));border-color:rgba(37,99,235,0.2)">
          <h3 style="font-size:.85rem;font-weight:700;margin-bottom:12px">🔬 Expert of the Day</h3>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#0d9488);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;font-size:1.1rem">SP</div>
            <div>
              <div style="font-weight:700">Dr. Suresh Patel</div>
              <div style="font-size:.72rem;color:var(--text-muted)">PhD Agriculture · IARI, New Delhi</div>
              <div style="font-size:.7rem;color:var(--green-400);margin-top:2px">⭐ 4.9 · 342 consultations</div>
            </div>
          </div>
          <p style="font-size:.78rem;color:var(--text-secondary);line-height:1.6;margin-bottom:12px">Specialist in Soil Science, Crop Protection & Organic Farming. Available for 1-on-1 consultations.</p>
          <button onclick="showToast('Connecting to Dr. Patel...','info')" style="width:100%;padding:8px;background:rgba(37,99,235,0.2);border:1px solid rgba(37,99,235,0.3);border-radius:var(--radius-sm);color:#93c5fd;font-family:Outfit,sans-serif;font-weight:600;font-size:.8rem;cursor:pointer">💬 Consult Now</button>
        </div>

        <!-- Training Videos -->
        <div class="glass-card" style="padding:20px;margin-bottom:16px">
          <h3 style="font-size:.85rem;font-weight:700;margin-bottom:12px">📹 Training Videos</h3>
          ${[
            {title:'Drip Irrigation Setup Guide',duration:'12:34',views:'8.4K'},
            {title:'Organic Pest Management',duration:'18:22',views:'12.1K'},
            {title:'Soil pH Testing & Correction',duration:'9:45',views:'6.2K'},
            {title:'Using AI Crop Scanner',duration:'5:18',views:'24.8K'}
          ].map(v => `
            <div onclick="showToast('Playing: ${v.title}','info')" style="display:flex;gap:10px;padding:8px;border-radius:var(--radius-sm);cursor:pointer;transition:var(--transition);margin-bottom:8px" onmouseover="this.style.background='rgba(22,163,74,0.06)'" onmouseout="this.style.background=''">
              <div style="width:48px;height:36px;background:var(--surface-3);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">▶️</div>
              <div>
                <div style="font-size:.78rem;font-weight:600;line-height:1.4">${v.title}</div>
                <div style="font-size:.68rem;color:var(--text-muted)">${v.duration} · ${v.views} views</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Trending Tags -->
        <div class="glass-card" style="padding:20px">
          <h3 style="font-size:.85rem;font-weight:700;margin-bottom:12px">🏷️ Trending Topics</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${['#tomato','#paddy','#earlyBlight','#organicFarming','#PMKisan','#droughtManagement','#IoT','#AIFarming','#marketPrices','#nitrogen'].map(tag => `
              <button onclick="showToast('Filtering by ${tag}','info')" style="padding:4px 12px;background:rgba(22,163,74,0.08);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--green-400);font-size:.75rem;cursor:pointer;font-family:Outfit,sans-serif;transition:var(--transition)" onmouseover="this.style.background='rgba(22,163,74,0.2)'" onmouseout="this.style.background='rgba(22,163,74,0.08)'">${tag}</button>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildPostCard(p) {
  return `
    <div class="post-card">
      <div class="post-author">
        <div class="post-avatar" style="background:${p.avatarColor||'#16a34a'}">${p.avatar}</div>
        <div>
          <div class="post-author-name">${p.author}</div>
          <div class="post-author-role">${p.role}</div>
        </div>
        <div class="post-time">${p.time}</div>
      </div>
      <div class="post-content">${p.content}</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        ${(p.tags||[]).map(t => `<span style="font-size:.68rem;padding:2px 8px;background:rgba(22,163,74,0.08);border-radius:var(--radius-full);color:var(--green-400)">#${t}</span>`).join('')}
      </div>
      <div class="post-actions">
        <button class="post-action-btn" onclick="likePost(${p.id},this)">👍 <span>${p.likes}</span></button>
        <button class="post-action-btn">💬 ${p.replies} Replies</button>
        <button class="post-action-btn">📤 Share</button>
        <button class="post-action-btn">🔖 Save</button>
      </div>
    </div>
  `;
}

function likePost(id, btn) {
  const span = btn.querySelector('span');
  if (span) span.textContent = parseInt(span.textContent) + 1;
  btn.style.color = 'var(--green-400)';
}

function postCommunity() {
  const text = document.getElementById('newPostText')?.value.trim();
  if (!text) { showToast('Write something to post!', 'error'); return; }
  const postsEl = document.getElementById('communityPosts');
  if (!postsEl) return;
  const newPost = {
    id: Date.now(), author: currentUser.name, role: capitalize(currentUser.role),
    avatar: currentUser.avatar, avatarColor: currentUser.avatarColor || '#16a34a',
    time: 'Just now', content: text, likes: 0, replies: 0, tags: []
  };
  postsEl.insertAdjacentHTML('afterbegin', buildPostCard(newPost));
  document.getElementById('newPostText').value = '';
  showToast('Post published!', 'success');
}

// ─── NOTIFICATIONS ───
function renderNotifications(container) {
  updateTopbar('Notifications', 'All alerts and updates');
  container.innerHTML = `
    <div style="max-width:720px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
        <div style="display:flex;gap:8px">
          ${['All','AI Alerts','Orders','Weather','Payments'].map((cat,i) => `
            <button onclick="filterNotifs('${cat.toLowerCase()}')" style="padding:6px 14px;background:${i===0?'rgba(22,163,74,0.15)':'var(--surface-2)'};border:1px solid ${i===0?'var(--green-600)':'var(--border)'};border-radius:var(--radius-full);color:${i===0?'var(--green-400)':'var(--text-muted)'};font-size:.78rem;font-weight:600;cursor:pointer;font-family:Outfit,sans-serif;transition:var(--transition)">${cat}</button>
          `).join('')}
        </div>
        <button onclick="markAllRead()" style="font-size:.75rem;color:var(--green-400);background:none;border:none;cursor:pointer;font-family:Outfit,sans-serif">Mark all read ✓</button>
      </div>
      <div class="notifications-list" id="notifList">
        ${ASH.notifications.map(n => `
          <div class="notif-item ${n.unread ? 'unread' : ''}">
            <div class="notif-icon">${n.icon}</div>
            <div class="notif-body">
              <div class="notif-title">${n.title}</div>
              <div class="notif-desc">${n.desc}</div>
              <div class="notif-time">${n.time}</div>
            </div>
            ${n.unread ? '<div class="notif-dot"></div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function filterNotifs(cat) { showToast(`Filtered by: ${cat}`, 'info'); }
function markAllRead() {
  document.querySelectorAll('.notif-item').forEach(el => el.classList.remove('unread'));
  document.querySelectorAll('.notif-dot').forEach(el => el.remove());
  showToast('All notifications marked as read', 'success');
}

// ─── CHARTS ───
const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#bbf7d0', font: {family:'Outfit',size:11}, boxWidth:12 } } },
  scales: {
    x: { ticks: { color:'#6b7280', font:{size:10} }, grid: { color:'rgba(34,197,94,0.06)' } },
    y: { ticks: { color:'#6b7280', font:{size:10} }, grid: { color:'rgba(34,197,94,0.06)' } }
  }
};

function renderRevenueChart() {
  const ctx = document.getElementById('revenueChart');
  if (!ctx || !window.Chart) return;
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  new Chart(ctx, {
    type: 'bar',
    data: { labels: days, datasets: [{ label: 'Revenue (₹)', data: days.map(() => randomInt(5000,25000)), backgroundColor: 'rgba(22,163,74,0.5)', borderColor: '#16a34a', borderWidth: 2, borderRadius: 6 }] },
    options: { ...chartOpts }
  });
}

function renderHealthTrendChart() {
  const ctx = document.getElementById('healthChart');
  if (!ctx || !window.Chart) return;
  const weeks = ['W1','W2','W3','W4','W5','W6'];
  new Chart(ctx, {
    type: 'line',
    data: { labels: weeks, datasets: [{ label: 'Health Score (%)', data: [72,78,82,79,88,94], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', tension: 0.4, fill: true, pointBackgroundColor:'#22c55e', pointRadius:4 }] },
    options: { ...chartOpts, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, suggestedMin:60, suggestedMax:100 } } }
  });
}

function renderMonthlyChart() {
  const ctx = document.getElementById('monthlyRevChart');
  if (!ctx || !window.Chart) return;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
  new Chart(ctx, { type:'bar', data:{ labels:months, datasets:[{label:'Revenue (₹)',data:months.map(()=>randomInt(20000,80000)),backgroundColor:'rgba(22,163,74,0.6)',borderColor:'#16a34a',borderRadius:4}] }, options:{...chartOpts} });
}

function renderCropPieChart() {
  const ctx = document.getElementById('cropRevChart');
  if (!ctx || !window.Chart) return;
  new Chart(ctx, { type:'doughnut', data:{ labels:['Tomato','Maize','Onion','Other'], datasets:[{data:[45,25,20,10],backgroundColor:['#16a34a','#0d9488','#f59e0b','#6b7280'],borderWidth:0}] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#bbf7d0',font:{family:'Outfit',size:11}}}}} });
}

function renderPriceTrendChart() {
  const ctx = document.getElementById('priceTrendChart');
  if (!ctx || !window.Chart) return;
  const days = Array.from({length:30},(_,i)=>`D${i+1}`);
  new Chart(ctx, { type:'line', data:{ labels:days, datasets:[{label:'Tomato (₹/q)',data:days.map(()=>randomBetween(3500,5500)),borderColor:'#f97316',backgroundColor:'rgba(249,115,22,0.08)',tension:0.4,pointRadius:0,fill:true}] }, options:{...chartOpts} });
}

function renderDemandChart() {
  const ctx = document.getElementById('demandChart');
  if (!ctx || !window.Chart) return;
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  new Chart(ctx, { type:'bar', data:{ labels:days, datasets:[{label:'Demand Index',data:days.map(()=>randomInt(60,100)),backgroundColor:'rgba(13,148,136,0.6)',borderColor:'#0d9488',borderRadius:4}] }, options:{...chartOpts} });
}

function renderAdminCharts() {
  const growthCtx = document.getElementById('adminGrowthChart');
  const revCtx = document.getElementById('adminRevChart');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];

  if (growthCtx && window.Chart) {
    new Chart(growthCtx, { type:'line', data:{ labels:months, datasets:[
      {label:'Farmers',data:[38000,40200,42800,44100,46200,48500,50248],borderColor:'#22c55e',tension:0.4,fill:false,pointRadius:3},
      {label:'Buyers',data:[800,920,1050,1100,1180,1240,1284],borderColor:'#06b6d4',tension:0.4,fill:false,pointRadius:3}
    ]}, options:{...chartOpts} });
  }
  if (revCtx && window.Chart) {
    new Chart(revCtx, { type:'doughnut', data:{ labels:['Certificates','Marketplace','Subscriptions','API'], datasets:[{data:[35,45,15,5],backgroundColor:['#16a34a','#0d9488','#f59e0b','#7c3aed'],borderWidth:0}] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#bbf7d0',font:{family:'Outfit',size:11}}}}} });
  }
}

function renderAnalyticsCharts() {
  const diseaseCtx = document.getElementById('diseaseChart');
  const stateCtx = document.getElementById('stateChart');
  const scansCtx = document.getElementById('scansChart');
  const revCtx = document.getElementById('revTrendChart');

  if (diseaseCtx && window.Chart) {
    new Chart(diseaseCtx, { type:'doughnut', data:{ labels:['Healthy','Leaf Blight','Powdery Mildew','Rust','Pests','Other'], datasets:[{data:[58,14,10,8,6,4],backgroundColor:['#16a34a','#f97316','#eab308','#ef4444','#8b5cf6','#6b7280'],borderWidth:0}] }, options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#bbf7d0',font:{family:'Outfit',size:10}}}}} });
  }
  if (stateCtx && window.Chart) {
    const states = ['TN','MH','PB','UP','KA','AP','RJ','MP'];
    new Chart(stateCtx, { type:'bar', data:{ labels:states, datasets:[{label:'Farmers',data:states.map(()=>randomInt(2000,9000)),backgroundColor:'rgba(22,163,74,0.6)',borderRadius:4}] }, options:{...chartOpts} });
  }
  if (scansCtx && window.Chart) {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul'];
    new Chart(scansCtx, { type:'line', data:{ labels:months, datasets:[{label:'AI Scans',data:[180000,220000,280000,310000,380000,420000,490000],borderColor:'#22c55e',backgroundColor:'rgba(34,197,94,0.08)',tension:0.4,fill:true,pointRadius:3}] }, options:{...chartOpts} });
  }
  if (revCtx && window.Chart) {
    const months = ['Feb','Mar','Apr','May','Jun','Jul'];
    new Chart(revCtx, { type:'line', data:{ labels:months, datasets:[{label:'Revenue (₹Cr)',data:[2.1,2.5,2.8,3.2,3.7,4.2],borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,0.08)',tension:0.4,fill:true,pointRadius:4}] }, options:{...chartOpts} });
  }
}
