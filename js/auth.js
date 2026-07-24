// ============================================================
// AgroSmartHub 3.0 — Authentication & Landing JS
// ============================================================

// Fallback in case data.js hasn't loaded yet
if (typeof randomInt === 'undefined') {
  window.randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
}

const BACKEND_URL = 'http://localhost:5000';

let selectedRole = 'farmer';
let currentRegStep = 1;
let otpSent = false;

// ─── OPEN / CLOSE AUTH ───
function openAuth(mode) {
  const overlay = document.getElementById('authOverlay');
  overlay.classList.add('open');
  if (mode === 'login') {
    showLoginForm();
  } else if (mode === 'register' || mode === 'register-buyer') {
    showRegisterForm();
    if (mode === 'register-buyer') selectRole('buyer');
  }
}
function closeAuth() {
  document.getElementById('authOverlay').classList.remove('open');
}

// ─── SWITCH FORMS ───
function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}
function showRegisterForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
  generateFarmerId();
}
function switchToRegister() { showRegisterForm(); }
function switchToLogin() { showLoginForm(); }

// ─── ROLE SELECTION ───
function selectRole(role) {
  selectedRole = role;
  document.querySelectorAll('.role-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.role === role);
  });
  const farmStep2 = document.getElementById('step2');
  if (role !== 'farmer') {
    farmStep2.style.opacity = '0.4';
  } else {
    farmStep2.style.opacity = '1';
  }
}

// ─── TAB SWITCHER ───
function switchLoginTab(tab) {
  document.querySelectorAll('.auth-tab-btn').forEach((b, i) => {
    b.classList.toggle('active', (i === 0 && tab === 'email') || (i === 1 && tab === 'otp'));
  });
  document.getElementById('emailLoginTab').style.display = tab === 'email' ? 'block' : 'none';
  document.getElementById('otpLoginTab').style.display = tab === 'otp' ? 'block' : 'none';
}

// ─── GENERATE FARMER ID ───
function generateFarmerId() {
  const id = `F-${new Date().getFullYear()}${String(randomInt(1000,9999))}`;
  const el = document.getElementById('regFarmerId');
  if (el) el.value = id;
}

// ─── REGISTRATION STEPS ───
function nextRegStep(step) {
  if (step > currentRegStep) {
    // Validate current step
    if (currentRegStep === 1) {
      const name = document.getElementById('regName')?.value;
      const email = document.getElementById('regEmail')?.value;
      const mobile = document.getElementById('regMobile')?.value;
      const pw = document.getElementById('regPassword')?.value;
      if (!name || !email || !mobile || !pw) {
        showToast('Please fill all required fields', 'error');
        return;
      }
      if (pw.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
      }
    }
  }
  document.getElementById(`regPanel${currentRegStep}`).style.display = 'none';
  document.getElementById(`regPanel${step}`).style.display = 'block';

  // Skip farm info for non-farmers
  if (step === 2 && selectedRole !== 'farmer') {
    nextRegStep(3);
    return;
  }

  // Update step indicators
  for (let i = 1; i <= 3; i++) {
    const el = document.getElementById(`step${i}`);
    if (!el) continue;
    el.classList.toggle('active', i === step);
    el.classList.toggle('done', i < step);
  }
  currentRegStep = step;
}

// ─── OTP HANDLING ───
function handleOTP() {
  const mobile = document.getElementById('otpMobile')?.value;
  if (!mobile) { showToast('Enter mobile number', 'error'); return; }
  if (!otpSent) {
    // Simulate OTP send
    otpSent = true;
    document.getElementById('otpFieldWrap').style.display = 'block';
    document.getElementById('otpBtn').textContent = 'Verify OTP';
    showToast('OTP sent to ' + mobile + ' (Demo: 123456)', 'success');
    // Auto-fill demo OTP
    setTimeout(() => {
      document.querySelectorAll('.otp-box').forEach((box, i) => {
        box.value = '123456'[i] || '';
      });
    }, 500);
    setupOTPBoxes();
  } else {
    const otp = Array.from(document.querySelectorAll('.otp-box')).map(b => b.value).join('');
    if (otp === '123456') {
      loginSuccess(ASH.users.farmer);
    } else {
      showToast('Invalid OTP. Use 123456 for demo.', 'error');
    }
  }
}

function setupOTPBoxes() {
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      if (box.value && i < boxes.length - 1) boxes[i+1].focus();
    });
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i-1].focus();
    });
  });
}

// ─── LOGIN ─── (3-tier: Express backend → Direct Supabase → Demo fallback)
async function handleLogin() {
  const email = document.getElementById('loginEmail')?.value?.trim();
  const pw = document.getElementById('loginPassword')?.value;
  const btnText = document.getElementById('loginBtnText');
  const spinner = document.getElementById('loginSpinner');
  if (!email || !pw) { showToast('Enter email and password', 'error'); return; }

  if (btnText) btnText.style.display = 'none';
  if (spinner) spinner.style.display = 'block';

  try {
    // ── Tier 1: Try Express backend ──────────────────────────
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw }),
        signal: AbortSignal.timeout(5000)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('ash_token', data.token);
        const user = { ...(ASH?.users?.[data.user.role] || {}), ...data.user };
        loginSuccess(user);
        return;
      }
      // Backend responded but auth failed (wrong credentials) — show real error
      if (res.status === 401 || res.status === 400) {
        showToast(data.error || 'Invalid email or password.', 'error');
        return;
      }
    } catch (backendErr) {
      console.warn('Backend unreachable, trying direct Supabase login...');
    }

    // ── Tier 2: Direct Supabase browser client ───────────────
    await window.supabaseClientReady; // wait for init
    if (window.supabaseClient) {
      const { data: sbData, error: sbError } = await window.supabaseClient.auth.signInWithPassword({
        email,
        password: pw
      });
      if (sbError) {
        showToast(sbError.message || 'Invalid email or password.', 'error');
        return;
      }
      if (sbData?.session) {
        localStorage.setItem('ash_token', sbData.session.access_token);
        const meta = sbData.user.user_metadata || {};
        const user = {
          ...(ASH?.users?.[meta.role || 'farmer'] || {}),
          id:    sbData.user.id,
          email: sbData.user.email,
          name:  meta.name  || 'User',
          role:  meta.role  || 'farmer',
          state: meta.state || '',
          mobile: meta.mobile || ''
        };
        showToast('Signed in via Supabase directly ✅', 'success');
        loginSuccess(user);
        return;
      }
    }

    // ── Tier 3: All paths failed ─────────────────────────────
    showToast('Login failed. Backend and Supabase both unreachable.', 'error');

  } finally {
    if (btnText) btnText.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

// ─── DEMO LOGIN ─── (3-tier: Express backend → Direct Supabase → Offline demo)
async function demoLogin(role) {
  const credentials = {
    farmer: { email: 'ramu@farmer.com',          password: 'farmer123' },
    admin:  { email: 'admin@agrismarthub.com',    password: 'admin123'  },
    buyer:  { email: 'priya@buyer.com',           password: 'buyer123'  },
    expert: { email: 'expert@agri.com',           password: 'expert123' }
  };

  const creds = credentials[role];
  if (!creds) {
    const user = ASH.users[role];
    if (user) loginSuccess(user);
    return;
  }

  showToast(`Logging in as ${role}...`, 'info');

  // ── Tier 1: Express backend ──────────────────────────────
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creds.email, password: creds.password }),
      signal: AbortSignal.timeout(4000)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      localStorage.setItem('ash_token', data.token);
      const user = { ...(ASH?.users?.[data.user.role] || {}), ...data.user };
      loginSuccess(user);
      return;
    }
    console.warn('Backend auth failed:', data.error);
  } catch (_) {
    console.warn('Backend unreachable — trying direct Supabase...');
  }

  // ── Tier 2: Direct Supabase browser client ───────────────
  await window.supabaseClientReady;
  if (window.supabaseClient) {
    try {
      const { data: sbData, error: sbError } = await window.supabaseClient.auth.signInWithPassword({
        email: creds.email,
        password: creds.password
      });
      if (!sbError && sbData?.session) {
        localStorage.setItem('ash_token', sbData.session.access_token);
        const meta = sbData.user.user_metadata || {};
        const user = {
          ...(ASH?.users?.[role] || {}),
          id:    sbData.user.id,
          email: sbData.user.email,
          name:  meta.name  || ASH.users[role]?.name  || 'User',
          role:  meta.role  || role,
          state: meta.state || '',
          mobile: meta.mobile || ''
        };
        showToast(`✅ Signed in as ${role} via Supabase`, 'success');
        loginSuccess(user);
        return;
      }
    } catch (_) {}
  }

  // ── Tier 3: Offline demo fallback ────────────────────────
  showToast(`Demo mode: Signed in as ${role} (offline)`, 'success');
  const mockUser = ASH.users[role];
  if (mockUser) loginSuccess(mockUser);
}


// ─── LOGIN SUCCESS ───
function loginSuccess(user) {
  Session.set('user', user);
  closeAuth();
  showToast(`Welcome, ${user.name}! 🌾`, 'success');
  setTimeout(() => {
    window.location.href = 'app.html';
  }, 1000);
}

// ─── REGISTER ───
async function handleRegister() {
  const terms = document.getElementById('regTerms')?.checked;
  if (!terms) { showToast('Please accept Terms & Conditions', 'error'); return; }
  
  const name = document.getElementById('regName')?.value?.trim();
  const email = document.getElementById('regEmail')?.value?.trim();
  const mobile = document.getElementById('regMobile')?.value?.trim();
  const password = document.getElementById('regPassword')?.value;
  const state = document.getElementById('regState')?.value;
  
  if (!name || !email || !password) {
    showToast('Please fill in Name, Email, and Password', 'error');
    return;
  }

  const btnText = document.getElementById('regBtnText');
  const spinner = document.getElementById('regSpinner');
  if (btnText) btnText.style.display = 'none';
  if (spinner) spinner.style.display = 'block';
  
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, mobile, password, state, role: selectedRole })
    });
    const data = await res.json();
    
    if (res.ok && data.success) {
      if (data.token) localStorage.setItem('ash_token', data.token);
      
      showToast('Account created successfully! Welcome to AgroSmartHub 🌱', 'success');

      // Build user object for the dashboard
      const user = {
        ...(ASH?.users?.[data.user?.role || 'farmer'] || {}),
        ...data.user,
        farmName: document.getElementById('regFarmName')?.value || 'My Farm',
        certCount: 0,
        totalSales: 0
      };

      // Save session and redirect to dashboard
      if (typeof Session !== 'undefined') Session.set('user', user);
      else localStorage.setItem('ash_user', JSON.stringify(user));

      setTimeout(() => { window.location.href = 'app.html'; }, 1200);

    } else {
      const errorMsg = data.error || (data.errors && data.errors[0]?.msg) || 'Registration failed.';
      showToast(errorMsg, 'error');
    }
  } catch (err) {
    console.error('Register error:', err);
    showToast('Cannot reach server. Make sure backend is running on port 5000.', 'error');
  } finally {
    if (btnText) btnText.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

// ─── FORGOT PASSWORD ───
async function showForgot() {
  const email = document.getElementById('loginEmail')?.value?.trim();
  if (!email) {
    showToast('Enter your email address first, then click Forgot Password.', 'warning');
    return;
  }

  // Try backend first
  try {
    await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: AbortSignal.timeout(3000)
    });
  } catch (_) {
    // Backend not available — try Supabase directly
    await window.supabaseClientReady;
    if (window.supabaseClient) {
      await window.supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/index.html'
      });
    }
  }

  showToast(`Password reset link sent to ${email} 📧`, 'success');
}

// ─── PASSWORD TOGGLE ───
function togglePw(id) {
  const inp = document.getElementById(id);
  if (!inp) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ─── FILE UPLOAD ───
function triggerFileUpload(id) { document.getElementById(id)?.click(); }
function previewFile(input, previewId) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById(previewId);
  if (preview) preview.textContent = `✅ ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
}

// ─── GET LOCATION ───
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const gpsEl = document.getElementById('regGPS');
      if (gpsEl) gpsEl.value = `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`;
      showToast('Location captured!', 'success');
    }, () => {
      const gpsEl = document.getElementById('regGPS');
      if (gpsEl) gpsEl.value = '11.0168° N, 76.9558° E';
      showToast('Using demo location: Coimbatore', 'success');
    });
  } else {
    showToast('Geolocation not supported. Using demo.', 'warning');
    const gpsEl = document.getElementById('regGPS');
    if (gpsEl) gpsEl.value = '11.0168° N, 76.9558° E';
  }
}

// ─── SCROLL HELPER ───
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
}

// ─── TOAST SYSTEM ───
let toastContainer;
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}
function showToast(msg, type = 'success', duration = 3000) {
  const icons = {success:'✅', error:'❌', warning:'⚠️', info:'ℹ️'};
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]||'ℹ️'}</span><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => toast.style.opacity = '0', duration - 300);
  setTimeout(() => toast.remove(), duration);
}
