// ============================================================
// AgroSmartHub 3.0 — Main App Router & Dashboard Renderer
// ============================================================

let currentUser = null;
let currentPage = 'dashboard';
let sidebarCollapsed = false;

// ─── BOOT ───
window.addEventListener('DOMContentLoaded', () => {
  currentUser = Session.get('user');
  if (!currentUser) {
    // Redirect to landing if not logged in
    showToast('Please sign in to continue', 'error');
    setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    return;
  }
  bootApp();
});

function bootApp() {
  const loading = document.getElementById('appLoading');
  const shell = document.getElementById('appShell');
  const msgs = [
    'Connecting to Supabase…',
    'Initializing AI modules…',
    'Loading IoT sensors…',
    'Fetching market data…',
    'Setting up dashboard…'
  ];
  let i = 0;
  const txtEl = document.getElementById('loadingText');
  const interval = setInterval(() => {
    if (i < msgs.length) { if (txtEl) txtEl.textContent = msgs[i++]; }
  }, 380);
  setTimeout(() => {
    clearInterval(interval);
    if (loading) loading.style.display = 'none';
    if (shell)   shell.style.display = 'flex';
    renderSidebar();
    renderTopbar();
    navigateTo('dashboard');
    initSidebarToggle();
    // Trigger Supabase real-time & post-boot setup
    if (typeof window._afterBoot === 'function') window._afterBoot();
  }, 2200);
}

// ─── SIDEBAR ───
function renderSidebar() {
  const role = currentUser.role;
  const nav = ASH.navConfig[role] || ASH.navConfig.farmer;

  // User Info
  const userEl = document.getElementById('sidebarUser');
  if (userEl) {
    userEl.innerHTML = `
      <div class="user-avatar-sm" style="background:${currentUser.avatarColor||'#16a34a'}">${currentUser.avatar}</div>
      <div class="user-info-sm">
        <div class="user-name-sm">${currentUser.name}</div>
        <span class="user-role-sm">${capitalize(currentUser.role)}</span>
      </div>
    `;
  }

  // Navigation
  const navEl = document.getElementById('sidebarNav');
  if (!navEl) return;
  let html = '';
  nav.forEach(section => {
    html += `<div class="nav-section"><div class="nav-section-title">${section.section}</div>`;
    section.items.forEach(item => {
      const badge = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
      html += `
        <button class="nav-link-item" id="nav-${item.id}" onclick="navigateTo('${item.id}')">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-text">${item.label}</span>
          ${badge}
        </button>`;
    });
    html += `</div>`;
  });
  navEl.innerHTML = html;
}

function initSidebarToggle() {
  const btn = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;
  btn.addEventListener('click', () => {
    sidebarCollapsed = !sidebarCollapsed;
    sidebar.classList.toggle('collapsed', sidebarCollapsed);
    btn.textContent = sidebarCollapsed ? '▶' : '◀';
    document.querySelectorAll('.nav-text, .sidebar-version, .user-info-sm, .nav-section-title').forEach(el => {
      el.style.display = sidebarCollapsed ? 'none' : '';
    });
  });
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const open = sidebar.classList.contains('mobile-open');
  sidebar.classList.toggle('mobile-open', !open);
  if (overlay) overlay.style.display = open ? 'none' : 'block';
}

// ─── TOPBAR ───
function renderTopbar() {
  const avatar = document.getElementById('topbarAvatar');
  if (avatar) {
    avatar.textContent = currentUser.avatar;
    avatar.style.background = `linear-gradient(135deg, ${currentUser.avatarColor||'#16a34a'}, #0d9488)`;
  }
}

function updateTopbar(title, sub = '') {
  const t = document.getElementById('topbarTitle');
  const s = document.getElementById('topbarSub');
  if (t) t.textContent = title;
  if (s) s.textContent = sub ? `· ${sub}` : '';
}

// ─── ROUTER ───
function navigateTo(page) {
  currentPage = page;

  // Update active nav
  document.querySelectorAll('.nav-link-item').forEach(el => {
    el.classList.toggle('active', el.id === `nav-${page}`);
  });

  // Close mobile sidebar
  document.getElementById('sidebar')?.classList.remove('mobile-open');
  const ov = document.getElementById('sidebarOverlay');
  if (ov) ov.style.display = 'none';

  // Render page
  const content = document.getElementById('pageContent');
  if (!content) return;
  content.innerHTML = '';

  switch(page) {
    case 'dashboard': renderDashboard(content); break;
    case 'ai-detection': renderAIDetection(content); break;
    case 'iot-monitor': renderIoTMonitor(content); break;
    case 'advisor': renderAdvisor(content); break;
    case 'my-products': renderMyProducts(content); break;
    case 'marketplace': renderMarketplace(content); break;
    case 'certificates': renderCertificates(content); break;
    case 'orders': renderOrders(content); break;
    case 'revenue': renderRevenue(content); break;
    case 'market-prices': renderMarketPrices(content); break;
    case 'supply-chain': renderSupplyChain(content); break;
    case 'community': renderCommunity(content); break;
    case 'notifications': renderNotifications(content); break;
    case 'analytics': renderAnalytics(content); break;
    case 'manage-farmers': renderManageFarmers(content); break;
    case 'manage-buyers': renderManageBuyers(content); break;
    case 'approve-certs': renderApproveCerts(content); break;
    case 'manage-orders': renderOrders(content); break;
    case 'profile': renderProfile(content); break;
    case 'verify-cert': renderVerifyCert(content); break;
    case 'consultations': renderConsultations(content); break;
    case 'reports': renderReports(content); break;
    default: renderDashboard(content);
  }
}

// ─── DASHBOARD (Farmer) ───
function renderDashboard(container) {
  const role = currentUser.role;
  updateTopbar('Dashboard', `Good ${getGreeting()}, ${currentUser.name.split(' ')[0]}!`);

  if (role === 'admin') { renderAdminDashboard(container); return; }
  if (role === 'buyer') { renderBuyerDashboard(container); return; }
  if (role === 'expert') { renderExpertDashboard(container); return; }

  // Farmer Dashboard
  container.innerHTML = `
    <!-- Weather + Quick Actions -->
    <div class="weather-widget glass-card" style="margin-bottom:24px" id="weatherWidget">
      <div class="weather-big-icon" id="weatherIcon">⛅</div>
      <div class="weather-main">
        <div class="weather-big-temp" id="weatherTemp">--°C</div>
        <div class="weather-condition" id="weatherCond">Loading…</div>
        <div class="weather-location">📍 ${currentUser.district || 'Coimbatore'}, ${currentUser.state}</div>
      </div>
      <div class="weather-details-grid">
        <div class="weather-detail-item"><div class="weather-detail-label">Humidity</div><div class="weather-detail-value" id="wHumidity">--</div></div>
        <div class="weather-detail-item"><div class="weather-detail-label">Wind</div><div class="weather-detail-value" id="wWind">--</div></div>
        <div class="weather-detail-item"><div class="weather-detail-label">Rainfall</div><div class="weather-detail-value" id="wRain">--</div></div>
        <div class="weather-detail-item"><div class="weather-detail-label">UV Index</div><div class="weather-detail-value" id="wUV">--</div></div>
      </div>
    </div>

    <!-- Metrics -->
    <div class="dashboard-grid" id="metricsGrid"></div>

    <!-- Quick Actions -->
    <div class="glass-card" style="margin-bottom:24px;padding:20px">
      <h3 style="font-size:.875rem;font-weight:700;margin-bottom:16px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.08em">Quick Actions</h3>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        ${[
          {icon:'🔬',label:'Scan Crop',page:'ai-detection'},
          {icon:'📡',label:'IoT Monitor',page:'iot-monitor'},
          {icon:'🏅',label:'New Certificate',page:'certificates'},
          {icon:'🛒',label:'List Product',page:'my-products'},
          {icon:'📈',label:'Market Prices',page:'market-prices'},
          {icon:'🤖',label:'AI Advisor',page:'advisor'}
        ].map(a => `
          <button onclick="navigateTo('${a.page}')" style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(22,163,74,0.1);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--green-400);font-family:Outfit,sans-serif;font-size:.8rem;font-weight:600;cursor:pointer;transition:var(--transition)" onmouseover="this.style.background='rgba(22,163,74,0.2)'" onmouseout="this.style.background='rgba(22,163,74,0.1)'">
            <span>${a.icon}</span><span>${a.label}</span>
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Charts Row -->
    <div class="chart-grid" style="margin-bottom:24px">
      <div class="chart-card">
        <div class="chart-card-title">Revenue (Last 7 Days) <span style="font-size:.7rem;font-weight:500;color:var(--text-muted)">₹</span></div>
        <canvas id="revenueChart" class="chart-canvas" height="180"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-card-title">Crop Health Trend</div>
        <canvas id="healthChart" class="chart-canvas" height="180"></canvas>
      </div>
    </div>

    <!-- Recent Notifications -->
    <div class="glass-card" style="margin-bottom:24px;padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="font-size:.9rem;font-weight:700">Recent Notifications</h3>
        <button onclick="navigateTo('notifications')" style="font-size:.75rem;color:var(--green-400);background:none;border:none;cursor:pointer;font-family:Outfit,sans-serif">View All →</button>
      </div>
      <div id="dashNotifs"></div>
    </div>

    <!-- Market Prices Preview -->
    <div class="glass-card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="font-size:.9rem;font-weight:700">📈 Today's Market Prices</h3>
        <button onclick="navigateTo('market-prices')" style="font-size:.75rem;color:var(--green-400);background:none;border:none;cursor:pointer;font-family:Outfit,sans-serif">View All →</button>
      </div>
      <table class="price-table">
        <thead><tr><th>Crop</th><th>Price</th><th>Change</th><th>Market</th></tr></thead>
        <tbody>
          ${ASH.marketPrices.slice(0,5).map(p => `
            <tr>
              <td>${p.emoji} ${p.crop}</td>
              <td style="font-weight:700">₹${p.price.toLocaleString()}</td>
              <td class="${p.change>=0?'price-up-td':'price-down-td'}">${p.change>=0?'▲':'▼'} ${Math.abs(p.change)}%</td>
              <td style="color:var(--text-muted);font-size:.75rem">${p.market}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Simulate weather
  simulateWeather();
  renderDashboardMetrics();
  renderDashNotifs();
  renderRevenueChart();
  renderHealthTrendChart();
}

function renderDashboardMetrics() {
  const grid = document.getElementById('metricsGrid');
  if (!grid) return;
  const metrics = [
    { icon: '💰', label: 'Total Revenue', value: fmtCurrency(currentUser.totalSales || 284500), change: '+18%', changeType: 'up', color: '#16a34a', sub: 'This season' },
    { icon: '📦', label: 'Orders Received', value: '23', change: '+3 today', changeType: 'up', color: '#0d9488', sub: '5 pending' },
    { icon: '🏅', label: 'Certificates', value: String(currentUser.certCount || 18), change: 'All verified', changeType: 'neu', color: '#f59e0b', sub: 'AI + Expert approved' },
    { icon: '🌾', label: 'Active Crops', value: '3', change: 'Healthy', changeType: 'up', color: '#22c55e', sub: 'Tomato, Maize, Onion' },
    { icon: '⭐', label: 'Farmer Rating', value: String(currentUser.rating || 4.8) + '/5', change: '+0.2 this month', changeType: 'up', color: '#f97316', sub: '47 reviews' },
    { icon: '🌡️', label: 'Avg Soil Health', value: '82%', change: '+4%', changeType: 'up', color: '#06b6d4', sub: 'IoT reading' }
  ];
  grid.innerHTML = metrics.map(m => `
    <div class="metric-card" style="--card-color:${m.color}">
      <div class="metric-header">
        <span class="metric-icon">${m.icon}</span>
        <span class="metric-change change-${m.changeType}">${m.change}</span>
      </div>
      <div class="metric-value">${m.value}</div>
      <div class="metric-label">${m.label}</div>
      <div class="metric-sub">${m.sub}</div>
    </div>
  `).join('');
}

function renderDashNotifs() {
  const el = document.getElementById('dashNotifs');
  if (!el) return;
  el.innerHTML = ASH.notifications.slice(0,3).map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" style="margin-bottom:8px">
      <div class="notif-icon">${n.icon}</div>
      <div class="notif-body">
        <div class="notif-title">${n.title}</div>
        <div class="notif-desc">${n.desc}</div>
        <div class="notif-time">${n.time}</div>
      </div>
      ${n.unread ? '<div class="notif-dot"></div>' : ''}
    </div>
  `).join('');
}

// ─── ADMIN DASHBOARD ───
function renderAdminDashboard(container) {
  updateTopbar('Admin Dashboard', 'System Overview');
  const farmers = ASH.allFarmers;
  container.innerHTML = `
    <div class="dashboard-grid" style="margin-bottom:24px">
      ${[
        {icon:'🧑‍🌾',label:'Total Farmers',value:'50,248',change:'+124 today',color:'#16a34a'},
        {icon:'🛒',label:'Total Buyers',value:'1,284',change:'+18 today',color:'#0d9488'},
        {icon:'📦',label:'Active Orders',value:'3,847',change:'↑ 12%',color:'#f59e0b'},
        {icon:'🏅',label:'Certs Issued',value:'18,492',change:'7 pending',color:'#7c3aed'},
        {icon:'💰',label:'Platform Revenue',value:'₹4.2Cr',change:'+22% MoM',color:'#06b6d4'},
        {icon:'🔬',label:'AI Scans Today',value:'2,847',change:'98.4% accuracy',color:'#22c55e'}
      ].map(m => `
        <div class="metric-card" style="--card-color:${m.color}">
          <div class="metric-header"><span class="metric-icon">${m.icon}</span><span class="metric-change change-up">${m.change}</span></div>
          <div class="metric-value">${m.value}</div>
          <div class="metric-label">${m.label}</div>
        </div>
      `).join('')}
    </div>

    <div class="chart-grid" style="margin-bottom:24px">
      <div class="chart-card">
        <div class="chart-card-title">Platform Growth</div>
        <canvas id="adminGrowthChart" height="180"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-card-title">Revenue Distribution</div>
        <canvas id="adminRevChart" height="180"></canvas>
      </div>
    </div>

    <div class="glass-card" style="padding:20px;margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="font-size:.9rem;font-weight:700">🧑‍🌾 Recent Farmers</h3>
        <button onclick="navigateTo('manage-farmers')" style="font-size:.75rem;color:var(--green-400);background:none;border:none;cursor:pointer;font-family:Outfit,sans-serif">Manage All →</button>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>ID</th><th>Name</th><th>State</th><th>Crop</th><th>Certs</th><th>Revenue</th><th>Status</th></tr></thead>
          <tbody>
            ${farmers.map(f => `
              <tr>
                <td><span style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text-muted)">${f.id}</span></td>
                <td style="font-weight:600">${f.name}</td>
                <td>${f.state}</td>
                <td>🌾 ${f.crop}</td>
                <td>🏅 ${f.certs}</td>
                <td style="font-weight:700;color:var(--green-400)">${f.revenue}</td>
                <td><span class="status-badge status-${f.status}">${f.status === 'active' ? '✅ Active' : '⏳ Pending'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="glass-card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="font-size:.9rem;font-weight:700">🏅 Pending Certificate Approvals (${ASH.pendingCerts.length})</h3>
        <button onclick="navigateTo('approve-certs')" style="font-size:.75rem;color:var(--green-400);background:none;border:none;cursor:pointer;font-family:Outfit,sans-serif">View All →</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${ASH.pendingCerts.map(c => `
          <div style="display:flex;align-items:center;gap:16px;padding:12px;background:rgba(22,163,74,0.04);border:1px solid var(--border);border-radius:var(--radius-sm)">
            <span style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text-muted)">${c.id}</span>
            <span style="font-weight:600;flex:1">${c.farmer}</span>
            <span>🌾 ${c.crop}</span>
            <span class="cert-grade-badge" style="font-size:.7rem;padding:2px 8px;background:rgba(22,163,74,0.15);color:var(--green-400);border-radius:var(--radius-full)">Grade ${c.grade}</span>
            <span style="font-size:.8rem;font-weight:700;color:var(--green-400)">${c.score}%</span>
            <button class="btn-xs" onclick="approveCert('${c.id}',this)">✅ Approve</button>
            <button class="btn-xs danger" onclick="rejectCert('${c.id}',this)">❌ Reject</button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  setTimeout(() => {
    renderAdminCharts();
  }, 100);
}

// ─── BUYER DASHBOARD ───
function renderBuyerDashboard(container) {
  updateTopbar('Buyer Dashboard', `Welcome, ${currentUser.name.split(' ')[0]}!`);
  container.innerHTML = `
    <div class="dashboard-grid" style="margin-bottom:24px">
      ${[
        {icon:'📦',label:'Active Orders',value:'4',change:'2 in transit',color:'#16a34a'},
        {icon:'✅',label:'Completed Orders',value:'28',change:'This month',color:'#0d9488'},
        {icon:'💰',label:'Total Spent',value:'₹1.84L',change:'+₹12,400 this week',color:'#f59e0b'},
        {icon:'⭐',label:'Avg Quality Score',value:'94%',change:'Excellent',color:'#7c3aed'}
      ].map(m => `
        <div class="metric-card" style="--card-color:${m.color}">
          <div class="metric-header"><span class="metric-icon">${m.icon}</span><span class="metric-change change-up">${m.change}</span></div>
          <div class="metric-value">${m.value}</div>
          <div class="metric-label">${m.label}</div>
        </div>
      `).join('')}
    </div>
    <div class="glass-card" style="padding:20px;margin-bottom:24px">
      <h3 style="font-size:.9rem;font-weight:700;margin-bottom:16px">🛒 Featured Products</h3>
      <div class="products-grid" id="buyerProducts"></div>
    </div>
  `;
  renderBuyerProducts();
}

function renderBuyerProducts() {
  const grid = document.getElementById('buyerProducts');
  if (!grid) return;
  grid.innerHTML = ASH.products.slice(0,6).map(p => buildProductCard(p)).join('');
}

// ─── EXPERT DASHBOARD ───
function renderExpertDashboard(container) {
  updateTopbar('Expert Dashboard', `Dr. ${currentUser.name.split(' ').pop()}`);
  container.innerHTML = `
    <div class="dashboard-grid" style="margin-bottom:24px">
      ${[
        {icon:'📋',label:'Consultations',value:'342',change:'+8 today',color:'#2563eb'},
        {icon:'🏅',label:'Certs Reviewed',value:'89',change:'7 pending',color:'#16a34a'},
        {icon:'👥',label:'Community Posts',value:'156',change:'12 unanswered',color:'#0d9488'},
        {icon:'⭐',label:'Expert Rating',value:'4.9/5',change:'Excellent',color:'#f59e0b'}
      ].map(m => `
        <div class="metric-card" style="--card-color:${m.color}">
          <div class="metric-header"><span class="metric-icon">${m.icon}</span><span class="metric-change change-up">${m.change}</span></div>
          <div class="metric-value">${m.value}</div>
          <div class="metric-label">${m.label}</div>
        </div>
      `).join('')}
    </div>
    <div class="glass-card" style="padding:20px;margin-bottom:24px">
      <h3 style="font-size:.9rem;font-weight:700;margin-bottom:16px">📋 Pending Certificate Reviews</h3>
      ${ASH.pendingCerts.map(c => `
        <div style="display:flex;align-items:center;gap:16px;padding:12px;background:rgba(22,163,74,0.04);border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:8px">
          <span style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text-muted)">${c.id}</span>
          <span style="font-weight:600;flex:1">${c.farmer} — ${c.crop}</span>
          <span style="font-size:.8rem;font-weight:700;color:var(--green-400)">${c.score}% Health</span>
          <button class="btn-xs" onclick="approveCert('${c.id}',this)">✅ Approve</button>
          <button class="btn-xs danger">❌ Reject</button>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── MANAGE FARMERS ───
function renderManageFarmers(container) {
  updateTopbar('Manage Farmers', 'All registered farmers');
  container.innerHTML = `
    <div class="glass-card" style="padding:20px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3>🧑‍🌾 All Farmers (${ASH.allFarmers.length})</h3>
        <button class="btn-xs">+ Add Farmer</button>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>ID</th><th>Name</th><th>State</th><th>Primary Crop</th><th>Certificates</th><th>Revenue</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${ASH.allFarmers.map(f => `<tr>
              <td style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text-muted)">${f.id}</td>
              <td style="font-weight:600">${f.name}</td><td>${f.state}</td>
              <td>🌾 ${f.crop}</td><td>🏅 ${f.certs}</td>
              <td style="color:var(--green-400);font-weight:700">${f.revenue}</td>
              <td style="color:var(--text-muted);font-size:.75rem">${f.joined}</td>
              <td><span class="status-badge status-${f.status}">${f.status === 'active' ? '✅ Active' : '⏳ Pending'}</span></td>
              <td><button class="btn-xs">View</button> <button class="btn-xs danger" style="margin-left:4px">Block</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderManageBuyers(container) {
  updateTopbar('Manage Buyers', 'All registered buyers');
  container.innerHTML = `
    <div class="glass-card" style="padding:20px">
      <h3 style="margin-bottom:16px">🛒 All Buyers</h3>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>ID</th><th>Name</th><th>Company</th><th>State</th><th>Orders</th><th>Total Spent</th><th>Status</th></tr></thead>
          <tbody>
            <tr><td style="font-family:'JetBrains Mono',monospace;font-size:.7rem">B-001</td><td style="font-weight:600">Priya Krishnaswamy</td><td>FreshMart Organics</td><td>Karnataka</td><td>32</td><td style="color:var(--green-400);font-weight:700">₹1.84L</td><td><span class="status-badge status-active">✅ Active</span></td></tr>
            <tr><td style="font-family:'JetBrains Mono',monospace;font-size:.7rem">B-002</td><td style="font-weight:600">Arun Kumar</td><td>AgriTrade Co.</td><td>Tamil Nadu</td><td>18</td><td style="color:var(--green-400);font-weight:700">₹92K</td><td><span class="status-badge status-active">✅ Active</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderApproveCerts(container) {
  updateTopbar('Certificate Approvals', 'Pending expert review');
  container.innerHTML = `
    <div class="glass-card" style="padding:20px">
      <h3 style="margin-bottom:16px">🏅 Pending Certificates (${ASH.pendingCerts.length})</h3>
      <div style="display:flex;flex-direction:column;gap:12px" id="pendingCertsList">
        ${ASH.pendingCerts.map(c => `
          <div style="display:flex;align-items:center;gap:16px;padding:16px;background:rgba(22,163,74,0.04);border:1px solid var(--border);border-radius:var(--radius-md)">
            <div style="flex:1">
              <div style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text-muted)">${c.id}</div>
              <div style="font-weight:700;margin:4px 0">${c.farmer} — ${c.crop}</div>
              <div style="font-size:.75rem;color:var(--text-muted)">${c.date}</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:1.2rem;font-weight:800;color:var(--green-400)">${c.score}%</div>
              <div style="font-size:.65rem;color:var(--text-muted)">Health Score</div>
            </div>
            <span style="padding:4px 12px;background:rgba(22,163,74,0.15);color:var(--green-400);border-radius:var(--radius-full);font-size:.75rem;font-weight:700">Grade ${c.grade}</span>
            <div style="display:flex;gap:8px">
              <button class="btn-xs" onclick="approveCert('${c.id}',this)">✅ Approve</button>
              <button class="btn-xs danger" onclick="rejectCert('${c.id}',this)">❌ Reject</button>
              <button class="btn-xs" onclick="navigateTo('certificates')">👁 Preview</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ─── ORDERS ───
function renderOrders(container) {
  updateTopbar('Orders', currentUser.role === 'farmer' ? 'Orders received' : 'My orders');
  const orders = [
    { id: 'ORD-2025071001', product: '🍅 Organic Tomatoes (50kg)', buyer: 'Priya Krishnaswamy', date: 'Jul 9, 2025', amount: '₹2,250', status: 'pending' },
    { id: 'ORD-2025070901', product: '🍌 Robusta Banana (30 doz)', buyer: 'Arun Kumar', date: 'Jul 9, 2025', amount: '₹1,200', status: 'active' },
    { id: 'ORD-2025070801', product: '🌽 Sweet Corn (100kg)', buyer: 'Retail Mart', date: 'Jul 8, 2025', amount: '₹2,200', status: 'active' },
    { id: 'ORD-2025070701', product: '🥦 Broccoli (20kg)', buyer: 'Green Foods', date: 'Jul 7, 2025', amount: '₹1,600', status: 'completed' }
  ];
  container.innerHTML = `
    <div class="glass-card" style="padding:20px">
      <h3 style="margin-bottom:16px">📦 Orders (${orders.length})</h3>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead><tr><th>Order ID</th><th>Product</th><th>${currentUser.role === 'farmer' ? 'Buyer' : 'Farmer'}</th><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            ${orders.map(o => `<tr>
              <td style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text-muted)">${o.id}</td>
              <td style="font-weight:600">${o.product}</td>
              <td>${o.buyer}</td>
              <td style="color:var(--text-muted);font-size:.75rem">${o.date}</td>
              <td style="font-weight:700;color:var(--green-400)">${o.amount}</td>
              <td><span class="status-badge status-${o.status}">${o.status === 'pending' ? '⏳ Pending' : o.status === 'active' ? '🚛 In Transit' : '✅ Delivered'}</span></td>
              <td><button class="btn-xs" onclick="navigateTo('supply-chain')">🗺️ Track</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ─── REVENUE ───
function renderRevenue(container) {
  updateTopbar('Revenue Analytics', 'Financial performance');
  container.innerHTML = `
    <div class="dashboard-grid" style="margin-bottom:24px">
      ${[
        {icon:'💰',label:'Total Revenue',value:fmtCurrency(currentUser.totalSales||284500),change:'+22%',color:'#16a34a'},
        {icon:'📅',label:'This Month',value:'₹42,800',change:'+18%',color:'#0d9488'},
        {icon:'📦',label:'Orders Completed',value:'23',change:'+3',color:'#f59e0b'},
        {icon:'⭐',label:'Avg Order Value',value:'₹12,370',change:'+8%',color:'#7c3aed'}
      ].map(m => `
        <div class="metric-card" style="--card-color:${m.color}">
          <div class="metric-header"><span class="metric-icon">${m.icon}</span><span class="metric-change change-up">${m.change}</span></div>
          <div class="metric-value">${m.value}</div>
          <div class="metric-label">${m.label}</div>
        </div>
      `).join('')}
    </div>
    <div class="chart-grid">
      <div class="chart-card"><div class="chart-card-title">Monthly Revenue</div><canvas id="monthlyRevChart" height="200"></canvas></div>
      <div class="chart-card"><div class="chart-card-title">Revenue by Crop</div><canvas id="cropRevChart" height="200"></canvas></div>
    </div>
  `;
  setTimeout(() => { renderMonthlyChart(); renderCropPieChart(); }, 100);
}

// ─── MARKET PRICES ───
function renderMarketPrices(container) {
  updateTopbar('Market Prices', 'Live commodity prices & predictions');
  container.innerHTML = `
    <div class="glass-card" style="padding:20px;margin-bottom:24px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3>📈 Live Market Prices</h3>
        <span style="font-size:.75rem;color:var(--text-muted);font-family:'JetBrains Mono',monospace">Last updated: ${new Date().toLocaleTimeString()}</span>
      </div>
      <table class="price-table">
        <thead><tr><th>Crop</th><th>Price (₹/quintal)</th><th>Change</th><th>Market</th><th>AI Recommendation</th></tr></thead>
        <tbody>
          ${ASH.marketPrices.map(p => `
            <tr>
              <td style="font-weight:600">${p.emoji} ${p.crop}</td>
              <td style="font-size:1rem;font-weight:800">₹${p.price.toLocaleString()}</td>
              <td class="${p.change>=0?'price-up-td':'price-down-td'}" style="font-size:.9rem">${p.change>=0?'▲':'▼'} ${Math.abs(p.change)}%</td>
              <td style="color:var(--text-muted)">${p.market}</td>
              <td style="font-size:.75rem;color:${p.change>=2?'var(--green-400)':p.change<0?'var(--red-400)':'var(--amber-400)'}">${p.change>=2?'🟢 Best time to sell':p.change<0?'🔴 Hold — prices falling':'🟡 Wait 2-3 days'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="chart-grid">
      <div class="chart-card"><div class="chart-card-title">Price Trend — Tomato (30 Days)</div><canvas id="priceTrendChart" height="200"></canvas></div>
      <div class="chart-card"><div class="chart-card-title">Demand Forecast — Next 7 Days</div><canvas id="demandChart" height="200"></canvas></div>
    </div>
  `;
  setTimeout(() => { renderPriceTrendChart(); renderDemandChart(); }, 100);
}

// ─── ADVISOR ───
function renderAdvisor(container) {
  updateTopbar('Smart AI Advisor', 'Personalized crop recommendations');
  container.innerHTML = `
    <div style="max-width:800px">
      <div class="glass-card" style="padding:24px;margin-bottom:24px;background:linear-gradient(135deg,rgba(22,163,74,0.1),rgba(13,148,136,0.1));border-color:rgba(22,163,74,0.25)">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
          <div style="font-size:2.5rem">🤖</div>
          <div>
            <h2 style="font-size:1.1rem;font-weight:800">AI Smart Advisor</h2>
            <p style="font-size:.8rem;color:var(--text-muted)">Powered by Machine Learning • Updated daily based on your farm data</p>
          </div>
        </div>
        <p style="font-size:.875rem;color:var(--text-secondary);line-height:1.7">
          Based on your <strong>Black Soil</strong>, <strong>Drip Irrigation</strong>, and current weather in <strong>${currentUser.state}</strong>, here are today's personalized recommendations:
        </p>
      </div>
      ${ASH.advisorRecs.map(r => `
        <div class="glass-card" style="padding:20px;margin-bottom:16px;border-left:3px solid ${r.priority==='high'?'var(--green-400)':r.priority==='medium'?'var(--amber-400)':'var(--text-muted)'}">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:.85rem;font-weight:700">${r.category}</span>
            <span style="font-size:.65rem;font-weight:700;padding:2px 8px;border-radius:var(--radius-full);background:${r.priority==='high'?'rgba(22,163,74,0.15)':r.priority==='medium'?'rgba(251,191,36,0.15)':'rgba(107,114,128,0.15)'};color:${r.priority==='high'?'var(--green-400)':r.priority==='medium'?'var(--amber-400)':'var(--text-muted)'}">${r.priority.toUpperCase()}</span>
          </div>
          <p style="font-size:.875rem;color:var(--text-secondary);line-height:1.7">${r.rec}</p>
        </div>
      `).join('')}
      <div class="glass-card" style="padding:20px">
        <h3 style="font-size:.9rem;font-weight:700;margin-bottom:12px">💬 Ask AI Anything</h3>
        <div style="display:flex;gap:12px">
          <input type="text" id="advisorInput" placeholder="E.g. What fertilizer is best for tomatoes in black soil?" style="flex:1" />
          <button onclick="askAdvisor()" style="padding:10px 20px;background:linear-gradient(135deg,var(--green-600),var(--teal-600));border:none;border-radius:var(--radius-sm);color:white;font-family:Outfit,sans-serif;font-weight:600;cursor:pointer">Ask 🤖</button>
        </div>
        <div id="advisorResponse" style="margin-top:16px;display:none"></div>
      </div>
    </div>
  `;
}

function askAdvisor() {
  const input = document.getElementById('advisorInput');
  const resp = document.getElementById('advisorResponse');
  if (!input.value.trim()) return;
  resp.style.display = 'block';
  resp.innerHTML = `<div style="color:var(--text-muted);font-size:.8rem">🤖 Analyzing your question…</div>`;
  setTimeout(() => {
    resp.innerHTML = `
      <div style="background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.2);border-radius:var(--radius-md);padding:16px">
        <div style="font-size:.7rem;color:var(--green-400);font-weight:600;margin-bottom:8px">🤖 AI ADVISOR RESPONSE</div>
        <p style="font-size:.875rem;color:var(--text-secondary);line-height:1.7">
          Based on your question about "<em>${input.value}</em>" and your farm profile (Black soil, Drip irrigation, Tamil Nadu climate):<br><br>
          For optimal results, apply <strong>NPK 19:19:19 @ 5kg/acre</strong> as base dose, then switch to <strong>Potassium Nitrate 13:0:45 @ 3kg/acre</strong> during fruiting stage. Ensure soil pH is between 6.0-7.0 for maximum nutrient uptake. With your current drip system, fertigation is recommended for 70% efficiency improvement.
        </p>
        <div style="margin-top:12px;font-size:.75rem;color:var(--text-muted)">Confidence: 94% · Based on 12,400+ similar farm profiles</div>
      </div>
    `;
    input.value = '';
  }, 1800);
}

// ─── CONSULTATIONS (Expert) ───
function renderConsultations(container) {
  updateTopbar('Consultations', 'Farmer consultation requests');
  container.innerHTML = `
    <div class="glass-card" style="padding:20px">
      <h3 style="margin-bottom:16px">📋 Pending Consultations</h3>
      ${[
        {farmer:'Ramu Kumar',crop:'Tomato',issue:'Yellow leaves + early blight suspect',time:'30 min ago',urgent:true},
        {farmer:'Meena Devi',crop:'Cotton',issue:'Bollworm attack — 20% infestation',time:'2 hrs ago',urgent:true},
        {farmer:'Suresh Patil',crop:'Soybean',issue:'Low germination rate — soil pH issue',time:'4 hrs ago',urgent:false},
        {farmer:'Rahul Sharma',crop:'Wheat',issue:'Fertilizer schedule advice needed',time:'8 hrs ago',urgent:false}
      ].map(c => `
        <div style="display:flex;align-items:center;gap:16px;padding:16px;background:rgba(22,163,74,0.04);border:1px solid var(--border);border-radius:var(--radius-md);margin-bottom:12px">
          <div style="font-size:1.5rem">🧑‍🌾</div>
          <div style="flex:1">
            <div style="font-weight:700">${c.farmer} <span style="font-size:.75rem;color:var(--text-muted)">· ${c.crop}</span></div>
            <div style="font-size:.8rem;color:var(--text-secondary);margin-top:4px">${c.issue}</div>
            <div style="font-size:.7rem;color:var(--text-muted);margin-top:4px">${c.time}</div>
          </div>
          ${c.urgent ? '<span style="padding:3px 10px;background:rgba(239,68,68,0.15);color:var(--red-400);border-radius:var(--radius-full);font-size:.7rem;font-weight:700">🔴 URGENT</span>' : ''}
          <button class="btn-xs">💬 Respond</button>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── REPORTS ───
function renderReports(container) {
  updateTopbar('Reports', 'Generate and download reports');
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px">
      ${[
        {icon:'📊',title:'Farmer Growth Report',desc:'Monthly farmer registration and activity trends'},
        {icon:'💰',title:'Revenue Report',desc:'Platform revenue breakdown by region and crop'},
        {icon:'🏅',title:'Certificate Report',desc:'Quality certificates issued, approved, and rejected'},
        {icon:'🌾',title:'Crop Health Report',desc:'AI disease detection statistics and trends'},
        {icon:'📦',title:'Order Analytics',desc:'Orders, fulfillment rate, and delivery performance'},
        {icon:'🔬',title:'AI Accuracy Report',desc:'Model performance, confidence scores, and improvements'}
      ].map(r => `
        <div class="glass-card" style="padding:20px;cursor:pointer" onclick="showToast('Generating ${r.title}...','success')">
          <div style="font-size:2rem;margin-bottom:12px">${r.icon}</div>
          <h3 style="font-size:.95rem;font-weight:700;margin-bottom:8px">${r.title}</h3>
          <p style="font-size:.8rem;color:var(--text-muted);margin-bottom:16px">${r.desc}</p>
          <div style="display:flex;gap:8px">
            <button class="btn-xs">📄 PDF</button>
            <button class="btn-xs">📊 Excel</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── PROFILE ───
function renderProfile(container) {
  updateTopbar('My Profile', 'Account & farm information');
  container.innerHTML = `
    <div style="display:grid;grid-template-columns:320px 1fr;gap:24px;max-width:1000px" id="profileGrid">
      <div>
        <div class="farmer-profile-card">
          <div class="profile-avatar" style="background:linear-gradient(135deg,${currentUser.avatarColor||'#16a34a'},#0d9488)">${currentUser.avatar}</div>
          <div class="profile-name">${currentUser.name}</div>
          <div class="profile-id">${currentUser.id}</div>
          <div class="profile-badges">
            <span class="profile-badge badge-verified">✅ Verified</span>
            ${currentUser.farmingType === 'Organic' ? '<span class="profile-badge badge-organic">🌿 Organic</span>' : ''}
          </div>
          <div class="profile-stats">
            <div><div class="profile-stat-num">${currentUser.certCount||18}</div><div class="profile-stat-label">Certificates</div></div>
            <div><div class="profile-stat-num">${currentUser.rating||4.8}</div><div class="profile-stat-label">Rating</div></div>
            <div><div class="profile-stat-num">₹${fmtNum(currentUser.totalSales||284500)}</div><div class="profile-stat-label">Revenue</div></div>
          </div>
          <div class="profile-qr" id="profileQR">
            <div class="profile-qr-wrap" id="profileQRCode"></div>
          </div>
          <p style="font-size:.65rem;color:var(--text-muted);text-align:center;margin-top:8px">Scan to verify farmer identity</p>
        </div>
      </div>
      <div>
        <div class="glass-card" style="padding:24px;margin-bottom:20px">
          <h3 style="font-size:.9rem;font-weight:700;margin-bottom:16px">Personal Information</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            ${[
              {label:'Full Name',value:currentUser.name},
              {label:'Email',value:currentUser.email},
              {label:'Mobile',value:currentUser.mobile||'+91 9876543210'},
              {label:'State',value:currentUser.state||'Tamil Nadu'},
              {label:'Aadhaar',value:currentUser.aadhaar||'XXXX XXXX 9012'},
              {label:'Role',value:capitalize(currentUser.role)}
            ].map(f => `
              <div>
                <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:4px">${f.label}</div>
                <div style="font-size:.9rem;font-weight:600">${f.value}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ${currentUser.role === 'farmer' ? `
        <div class="glass-card" style="padding:24px">
          <h3 style="font-size:.9rem;font-weight:700;margin-bottom:16px">Farm Information</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            ${[
              {label:'Farm Name',value:currentUser.farmName||"Ramu's Green Agro Farm"},
              {label:'Land Size',value:currentUser.landSize||'12.5 acres'},
              {label:'Soil Type',value:currentUser.soilType||'Black Soil'},
              {label:'Irrigation',value:currentUser.irrigationType||'Drip Irrigation'},
              {label:'Primary Crop',value:currentUser.primaryCrop||'Tomato'},
              {label:'Farming Type',value:currentUser.farmingType||'Organic'},
              {label:'GPS',value:currentUser.gps||'11.0168° N, 76.9558° E'},
              {label:'Water Source',value:'Borewell + Canal'}
            ].map(f => `
              <div>
                <div style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);margin-bottom:4px">${f.label}</div>
                <div style="font-size:.9rem;font-weight:600">${f.value}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  `;
  // Generate QR Code for farmer profile
  setTimeout(() => {
    const qrEl = document.getElementById('profileQRCode');
    if (qrEl && typeof QRCode !== 'undefined') {
      QRCode.toCanvas(document.createElement('canvas'), `FARMER:${currentUser.id}|${currentUser.name}|${currentUser.state}`, {width:100, color:{dark:'#16a34a',light:'#ffffff'}}, (err, canvas) => {
        if (!err && qrEl) { qrEl.innerHTML = ''; qrEl.appendChild(canvas); }
      });
    }
  }, 100);
}

// ─── VERIFY CERT ───
function renderVerifyCert(container) {
  updateTopbar('Verify Certificate', 'Scan QR or enter certificate ID');
  container.innerHTML = `
    <div style="max-width:600px;margin:0 auto">
      <div class="glass-card" style="padding:32px;text-align:center">
        <div style="font-size:3rem;margin-bottom:16px">🔍</div>
        <h2 style="font-size:1.1rem;font-weight:800;margin-bottom:8px">Certificate Verification</h2>
        <p style="font-size:.875rem;color:var(--text-muted);margin-bottom:24px">Enter a certificate ID to verify its authenticity and view details</p>
        <div style="display:flex;gap:12px;margin-bottom:24px">
          <input type="text" id="certVerifyInput" placeholder="Enter Certificate ID e.g. CERT-TN-2025-0847" style="flex:1" />
          <button onclick="verifyCertID()" style="padding:10px 20px;background:linear-gradient(135deg,var(--green-600),var(--teal-600));border:none;border-radius:var(--radius-sm);color:white;font-family:Outfit,sans-serif;font-weight:600;cursor:pointer">Verify</button>
        </div>
        <div id="verifyResult"></div>
      </div>
    </div>
  `;
}

function verifyCertID() {
  const id = document.getElementById('certVerifyInput')?.value.trim();
  const result = document.getElementById('verifyResult');
  if (!id || !result) return;
  result.innerHTML = '<div style="color:var(--text-muted);font-size:.8rem">🔍 Verifying on blockchain…</div>';
  setTimeout(() => {
    result.innerHTML = `
      <div style="background:rgba(22,163,74,0.08);border:1px solid rgba(22,163,74,0.25);border-radius:var(--radius-md);padding:20px;text-align:left">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
          <span style="font-size:1.5rem">✅</span>
          <div><div style="font-weight:800;color:var(--green-400)">VERIFIED — AUTHENTIC CERTIFICATE</div><div style="font-size:.75rem;color:var(--text-muted)">Blockchain confirmed</div></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:.8rem">
          <div><div style="color:var(--text-muted);font-size:.65rem;text-transform:uppercase;font-weight:700">Certificate ID</div><div style="font-family:'JetBrains Mono',monospace;margin-top:2px">${id}</div></div>
          <div><div style="color:var(--text-muted);font-size:.65rem;text-transform:uppercase;font-weight:700">Farmer</div><div style="margin-top:2px;font-weight:700">Ramu Kumar</div></div>
          <div><div style="color:var(--text-muted);font-size:.65rem;text-transform:uppercase;font-weight:700">Crop</div><div style="margin-top:2px">🍅 Organic Tomato</div></div>
          <div><div style="color:var(--text-muted);font-size:.65rem;text-transform:uppercase;font-weight:700">Grade</div><div style="margin-top:2px;color:var(--green-400);font-weight:700">A+ (96%)</div></div>
          <div><div style="color:var(--text-muted);font-size:.65rem;text-transform:uppercase;font-weight:700">Issue Date</div><div style="margin-top:2px">Jul 8, 2025</div></div>
          <div><div style="color:var(--text-muted);font-size:.65rem;text-transform:uppercase;font-weight:700">Status</div><div style="margin-top:2px;color:var(--green-400)">✅ Certified for Sale</div></div>
        </div>
      </div>
    `;
  }, 1500);
}

// ─── ANALYTICS (enhanced version defined in app.html overrides this) ───
// This fallback is kept for compatibility
function _renderAnalyticsFallback(container) {
  updateTopbar('Analytics', 'Platform performance overview');
  container.innerHTML = `<div class="glass-card" style="padding:24px;text-align:center">Loading analytics…</div>`;
}

// ─── CERT ACTIONS ───
function approveCert(id, btn) {
  if (btn) { btn.textContent = '✅ Approved'; btn.disabled = true; btn.style.opacity = '0.6'; }
  showToast(`Certificate ${id} approved!`, 'success');
}
function rejectCert(id, btn) {
  if (btn) { btn.textContent = '❌ Rejected'; btn.disabled = true; btn.style.opacity = '0.6'; }
  showToast(`Certificate ${id} rejected`, 'error');
}

// ─── LOGOUT (overridden by app.html for Supabase signOut) ───
function handleLogout() {
  // Try Supabase sign-out first (handled in app.html's handleLogout)
  if (typeof window.supabaseClient !== 'undefined' && window.supabaseClient?.auth) {
    window.supabaseClient.auth.signOut().catch(() => {});
  }
  Session.del('user');
  localStorage.removeItem('ash_token');
  showToast('Logged out. See you soon! 🌾', 'success');
  setTimeout(() => { window.location.href = 'index.html'; }, 1000);
}

// ─── WEATHER SIMULATION ───
function simulateWeather() {
  const conditions = ['☀️ Sunny', '⛅ Partly Cloudy', '🌤️ Mostly Clear', '🌦️ Light Rain Expected'];
  const icons = ['☀️', '⛅', '🌤️', '🌧️'];
  const ci = randomInt(0, conditions.length - 1);
  const temp = randomBetween(24, 34).toFixed(1);
  if (document.getElementById('weatherTemp')) document.getElementById('weatherTemp').textContent = `${temp}°C`;
  if (document.getElementById('weatherCond')) document.getElementById('weatherCond').textContent = conditions[ci];
  if (document.getElementById('weatherIcon')) document.getElementById('weatherIcon').textContent = icons[ci];
  if (document.getElementById('wHumidity')) document.getElementById('wHumidity').textContent = `${randomInt(55, 85)}%`;
  if (document.getElementById('wWind')) document.getElementById('wWind').textContent = `${randomInt(5, 20)} km/h`;
  if (document.getElementById('wRain')) document.getElementById('wRain').textContent = ci === 3 ? 'High chance' : `${randomInt(0, 15)}mm`;
  if (document.getElementById('wUV')) document.getElementById('wUV').textContent = `${randomInt(4, 9)} (${randomInt(4,9) > 6 ? 'High' : 'Moderate'})`;
}

// ─── HELPERS ───
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function showToast(msg, type = 'success', duration = 3000) {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const container = document.getElementById('toastContainer') || document.body;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; toast.style.transition = '.3s'; }, duration - 300);
  setTimeout(() => toast.remove(), duration);
}
function buildProductCard(p) {
  return `
    <div class="product-card" onclick="showToast('Viewing ${p.name}','info')">
      <div class="product-img-wrap">
        <div class="product-emoji">${p.emoji}</div>
        ${p.certified ? '<span class="product-cert-badge">🏅 AI Certified</span>' : ''}
      </div>
      <div class="product-body">
        <div class="product-name">${p.name}</div>
        <div class="product-farmer">🧑‍🌾 ${p.farmer} · 📍 ${p.location}</div>
        <div class="product-footer">
          <div><span class="product-price">₹${p.price}</span><span class="product-unit">/${p.unit}</span></div>
          <span class="product-grade grade-${p.grade.toLowerCase().replace('+','')}">${p.grade}</span>
        </div>
        <div class="product-stock" style="margin-top:4px">Stock: ${p.quantity} ${p.unit}</div>
        <button class="btn-add-cart" onclick="event.stopPropagation();addToCart('${p.id}')">🛒 Add to Cart</button>
      </div>
    </div>
  `;
}
function addToCart(id) {
  const p = ASH.products.find(x => x.id === id);
  showToast(`${p?.name||'Product'} added to cart!`, 'success');
}
