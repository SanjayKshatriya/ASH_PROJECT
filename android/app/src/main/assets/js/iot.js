// ============================================================
// AgroSmartHub 3.0 — IoT Live Sensor Monitoring
// Realtime: Supabase channel → iot_readings table
// Fallback: Client-side simulation (setInterval)
// ============================================================

let iotInterval = null;
let iotRealtimeChannel = null; // Supabase Realtime channel

function renderIoTMonitor(container) {
  updateTopbar('IoT Sensor Monitor', 'Real-time farm environment data');

  container.innerHTML = `
    <!-- Live Indicator -->
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:8px;padding:6px 14px;background:rgba(22,163,74,0.1);border:1px solid rgba(22,163,74,0.25);border-radius:var(--radius-full)">
        <span style="width:8px;height:8px;border-radius:50%;background:var(--green-400);animation:sensor-blink 1s infinite"></span>
        <span id="iotLiveLabel" style="font-size:.78rem;font-weight:700;color:var(--green-400)">LIVE — Updates every 3s</span>
      </div>
      <div style="font-size:.75rem;color:var(--text-muted)">Device: <strong>IoT-Gateway-001</strong> · Farm: ${currentUser.farmName || "Ramu's Green Agro Farm"}</div>
      <div style="margin-left:auto;display:flex;gap:8px">
        <button onclick="exportSensorData()" style="padding:6px 14px;background:rgba(22,163,74,0.1);border:1px solid var(--border);border-radius:var(--radius-full);color:var(--green-400);font-size:.75rem;font-weight:600;cursor:pointer;font-family:Outfit,sans-serif">📥 Export</button>
        <button onclick="resetAlerts()" style="padding:6px 14px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-full);color:var(--red-400);font-size:.75rem;font-weight:600;cursor:pointer;font-family:Outfit,sans-serif">🔕 Clear Alerts</button>
      </div>
    </div>

    <!-- Alert Bar -->
    <div id="iotAlertBar" style="display:none;margin-bottom:16px;padding:12px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:var(--radius-md)">
      <div style="display:flex;align-items:center;gap:8px;font-size:.85rem;font-weight:700;color:var(--red-400)">
        🚨 <span id="iotAlertText">Alert detected</span>
      </div>
    </div>

    <!-- Sensor Grid -->
    <div class="iot-grid" id="iotSensorGrid"></div>

    <!-- Trend Charts -->
    <div class="chart-grid" style="margin-top:24px">
      <div class="chart-card">
        <div class="chart-card-title">🌡️ Temperature & Humidity (Last 24h)</div>
        <canvas id="iotTempChart" height="180"></canvas>
      </div>
      <div class="chart-card">
        <div class="chart-card-title">🌱 Soil Moisture & pH Trend</div>
        <canvas id="iotSoilChart" height="180"></canvas>
      </div>
    </div>

    <!-- Data Table -->
    <div class="glass-card" style="padding:20px;margin-top:24px">
      <h3 style="font-size:.875rem;font-weight:700;margin-bottom:16px">📊 Live Sensor Readings</h3>
      <div class="admin-table-wrap">
        <table class="admin-table" id="iotDataTable">
          <thead>
            <tr><th>Sensor</th><th>Current Value</th><th>Min (24h)</th><th>Max (24h)</th><th>Status</th><th>Last Update</th></tr>
          </thead>
          <tbody id="iotTableBody"></tbody>
        </table>
      </div>
    </div>
  `;

  // Initial render
  updateSensorGrid();
  renderIoTCharts();

  // ── Try Supabase Realtime first, fallback to simulation ─
  subscribeIoTRealtime();
}

/**
 * Subscribe to Supabase Realtime iot_readings channel.
 * When a new reading arrives, update the matching sensor card.
 * Falls back to setInterval simulation if unavailable.
 */
async function subscribeIoTRealtime() {
  await window.supabaseClientReady;

  if (!window.supabaseClient) {
    console.log('ℹ️  Supabase client not available — using simulated IoT data');
    startSimulatedIoT();
    return;
  }

  // Clean up existing channel
  if (iotRealtimeChannel) {
    window.supabaseClient.removeChannel(iotRealtimeChannel);
    iotRealtimeChannel = null;
  }

  try {
    iotRealtimeChannel = window.supabaseClient
      .channel('iot_readings_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'iot_readings' },
        (payload) => {
          const row = payload.new;
          // Find matching sensor by type label and update value
          const sensor = ASH.sensors.find(s =>
            s.label.toLowerCase() === (row.sensor_type || '').toLowerCase()
          );
          if (sensor && row.value != null) {
            sensor.value = parseFloat(row.value);
            updateSensorGrid();
            updateIoTTable();
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Supabase Realtime IoT channel subscribed');
          const label = document.getElementById('iotLiveLabel');
          if (label) label.textContent = 'LIVE — Supabase Realtime';
          // Still run simulation to generate readings in the DB
          startSimulatedIoT(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('⚠️  Supabase Realtime IoT channel error — falling back to simulation');
          startSimulatedIoT();
        }
      });
  } catch (err) {
    console.warn('Supabase Realtime subscribe error:', err.message, '— using simulation');
    startSimulatedIoT();
  }
}

/**
 * Push a simulated sensor reading to Supabase iot_readings table.
 * This triggers the Realtime channel for all connected clients.
 */
async function pushSensorReadingToSupabase(sensor) {
  if (!window.supabaseClient) return;
  try {
    await window.supabaseClient.from('iot_readings').insert({
      sensor_type: sensor.label,
      value: sensor.value,
      unit: sensor.unit,
    });
  } catch (_) {
    // Silently fail if table doesn't exist yet
  }
}

/**
 * Start the client-side simulation loop.
 * If pushToDb=true, also inserts rows into Supabase to trigger Realtime.
 */
function startSimulatedIoT(pushToDb = false) {
  if (iotInterval) clearInterval(iotInterval);
  iotInterval = setInterval(async () => {
    updateSensorValues();
    updateSensorGrid();
    updateIoTTable();
    if (pushToDb && window.supabaseClient) {
      // Push one random sensor reading to trigger realtime for other clients
      const sensor = ASH.sensors[Math.floor(Math.random() * ASH.sensors.length)];
      await pushSensorReadingToSupabase(sensor);
    }
  }, 3000);
}

function updateSensorValues() {
  ASH.sensors.forEach(s => {
    const delta = (Math.random() - 0.5) * ((s.max - s.min) * 0.04);
    s.value = Math.max(s.min, Math.min(s.max, s.value + delta));
    s.value = parseFloat(s.value.toFixed(s.unit === 'pH' ? 1 : s.unit === 'lux' ? 0 : 1));
  });
}

function getSensorStatus(s) {
  if (s.value < s.normal[0]) return 'low';
  if (s.value > s.normal[1]) return 'high';
  return 'ok';
}

function getSensorStatusLabel(status) {
  const map = { ok: { text: '✅ Normal', color: 'var(--green-400)' }, high: { text: '🔴 High', color: 'var(--red-400)' }, low: { text: '🟡 Low', color: 'var(--amber-400)' } };
  return map[status] || map.ok;
}

function updateSensorGrid() {
  const grid = document.getElementById('iotSensorGrid');
  if (!grid) { if(iotInterval) clearInterval(iotInterval); return; }

  let alerts = [];

  grid.innerHTML = ASH.sensors.map(s => {
    const status = getSensorStatus(s);
    const pct = ((s.value - s.min) / (s.max - s.min)) * 100;
    const barClass = status === 'high' ? 'danger' : status === 'low' ? 'warn' : '';
    const cardClass = status === 'high' ? 'alert-high' : status === 'low' ? 'alert-low' : '';
    const displayVal = s.unit === 'lux' ? `${(s.value/1000).toFixed(1)}K` : s.value;

    if (status !== 'ok') alerts.push(`${s.emoji} ${s.label}: ${displayVal}${s.unit} (${status.toUpperCase()})`);

    return `
      <div class="sensor-card ${cardClass}" title="${s.label}: ${displayVal}${s.unit}">
        <div class="sensor-pulse ${status !== 'ok' ? 'alert' : ''}"></div>
        <div class="sensor-emoji">${s.emoji}</div>
        <div class="sensor-value" style="color:${status==='high'?'var(--red-400)':status==='low'?'var(--amber-400)':'var(--text-primary)'}">${displayVal}${s.unit}</div>
        <div class="sensor-name">${s.label}</div>
        <div class="sensor-bar-wrap">
          <div class="sensor-bar-fill ${barClass}" style="width:${Math.min(pct,100)}%"></div>
        </div>
      </div>
    `;
  }).join('');

  // Alert bar
  const alertBar = document.getElementById('iotAlertBar');
  const alertText = document.getElementById('iotAlertText');
  if (alertBar && alertText) {
    if (alerts.length) {
      alertBar.style.display = 'block';
      alertText.textContent = `⚠️ ${alerts.length} sensor alert(s): ${alerts[0]}${alerts.length > 1 ? ` (+${alerts.length-1} more)` : ''}`;
    } else {
      alertBar.style.display = 'none';
    }
  }

  // Also update table
  updateIoTTable();
}

function updateIoTTable() {
  const tbody = document.getElementById('iotTableBody');
  if (!tbody) { if(iotInterval) clearInterval(iotInterval); return; }
  tbody.innerHTML = ASH.sensors.map(s => {
    const status = getSensorStatus(s);
    const sl = getSensorStatusLabel(status);
    const displayVal = s.unit === 'lux' ? `${(s.value/1000).toFixed(1)}K lux` : `${s.value} ${s.unit}`;
    const minVal = parseFloat((s.normal[0]).toFixed(1));
    const maxVal = parseFloat((s.normal[1]).toFixed(1));
    return `<tr>
      <td>${s.emoji} ${s.label}</td>
      <td style="font-weight:700;color:${status==='high'?'var(--red-400)':status==='low'?'var(--amber-400)':'var(--text-primary)'}">${displayVal}</td>
      <td style="color:var(--text-muted)">${minVal} ${s.unit}</td>
      <td style="color:var(--text-muted)">${maxVal} ${s.unit}</td>
      <td style="color:${sl.color};font-weight:600">${sl.text}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.7rem;color:var(--text-dim)">${new Date().toLocaleTimeString()}</td>
    </tr>`;
  }).join('');
}

function resetAlerts() {
  const alertBar = document.getElementById('iotAlertBar');
  if (alertBar) alertBar.style.display = 'none';
  showToast('Alerts cleared', 'info');
}

function exportSensorData() {
  const rows = ['Sensor,Value,Unit,Status,Time'];
  ASH.sensors.forEach(s => {
    rows.push(`"${s.label}",${s.value},${s.unit},${getSensorStatus(s)},${new Date().toISOString()}`);
  });
  const csv = rows.join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `iot-sensors-${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
  showToast('Sensor data exported!', 'success');
}

// Override navigateTo to stop IoT interval and Realtime channel
const _origNavigateTo = window.navigateTo;
window.navigateTo = function(page) {
  if (page !== 'iot-monitor') {
    if (iotInterval) { clearInterval(iotInterval); iotInterval = null; }
    if (iotRealtimeChannel && window.supabaseClient) {
      window.supabaseClient.removeChannel(iotRealtimeChannel);
      iotRealtimeChannel = null;
    }
  }
  _origNavigateTo(page);
};


function renderIoTCharts() {
  setTimeout(() => {
    const labels = Array.from({length:24}, (_,i) => `${23-i}h ago`).reverse();
    const tempData = Array.from({length:24}, () => randomBetween(22, 34));
    const humData = Array.from({length:24}, () => randomBetween(50, 90));
    const moistData = Array.from({length:24}, () => randomBetween(30, 70));
    const phData = Array.from({length:24}, () => randomBetween(5.8, 7.2));

    const tempCtx = document.getElementById('iotTempChart');
    const soilCtx = document.getElementById('iotSoilChart');

    const chartDefaults = {
      responsive: true,
      plugins: { legend: { labels: { color: '#bbf7d0', font: {family:'Outfit',size:11} } } },
      scales: {
        x: { ticks: { color: '#6b7280', font: {size:9}, maxTicksLimit: 8 }, grid: { color: 'rgba(34,197,94,0.06)' } },
        y: { ticks: { color: '#6b7280', font: {size:9} }, grid: { color: 'rgba(34,197,94,0.06)' } }
      }
    };

    if (tempCtx) {
      new Chart(tempCtx, {
        type: 'line', data: {
          labels,
          datasets: [
            { label: 'Temp (°C)', data: tempData, borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,0.08)', tension: 0.4, pointRadius: 0, fill: true },
            { label: 'Humidity (%)', data: humData, borderColor: '#06b6d4', backgroundColor: 'rgba(6,182,212,0.08)', tension: 0.4, pointRadius: 0, fill: true }
          ]
        },
        options: { ...chartDefaults, maintainAspectRatio: false }
      });
    }
    if (soilCtx) {
      new Chart(soilCtx, {
        type: 'line', data: {
          labels,
          datasets: [
            { label: 'Soil Moisture (%)', data: moistData, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', tension: 0.4, pointRadius: 0, fill: true },
            { label: 'Soil pH', data: phData, borderColor: '#a78bfa', backgroundColor: 'rgba(167,139,250,0.08)', tension: 0.4, pointRadius: 0, fill: true, yAxisID: 'y2' }
          ]
        },
        options: {
          ...chartDefaults, maintainAspectRatio: false,
          scales: {
            ...chartDefaults.scales,
            y2: { position:'right', ticks: { color:'#6b7280', font:{size:9} }, grid: { display:false }, suggestedMin: 5, suggestedMax: 9 }
          }
        }
      });
    }
  }, 200);
}
