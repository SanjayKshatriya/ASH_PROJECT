// ============================================================
// AgroSmartHub 3.0 — Authentication & Landing JS
// ============================================================

// Fallback in case data.js hasn't loaded yet
if (typeof randomInt === 'undefined') {
  window.randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
}

const BACKEND_URL = window.location.protocol === 'file:' ? 'http://localhost:5000' : `${window.location.protocol}//${window.location.hostname}:5000`;

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
  const resetEl = document.getElementById('resetPasswordForm');
  if (resetEl) resetEl.style.display = 'none';
}
function showRegisterForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
  const resetEl = document.getElementById('resetPasswordForm');
  if (resetEl) resetEl.style.display = 'none';
  generateFarmerId();
}
function showResetPasswordForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'none';
  const resetEl = document.getElementById('resetPasswordForm');
  if (resetEl) resetEl.style.display = 'block';
  openAuth('reset-password');
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

// ─── OTP HANDLING (REAL BACKEND OTP) ───
async function handleOTP() {
  const mobile = document.getElementById('otpMobile')?.value?.trim();
  if (!mobile) { showToast('Enter mobile number', 'error'); return; }
  
  if (!otpSent) {
    showToast('Sending OTP...', 'info');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        otpSent = true;
        document.getElementById('otpFieldWrap').style.display = 'block';
        document.getElementById('otpBtn').textContent = 'Verify OTP';
        showToast(data.message || `OTP sent to ${mobile}`, 'success');
        setupOTPBoxes();
      } else {
        showToast(data.error || 'Failed to send OTP.', 'error');
      }
    } catch (err) {
      showToast('Cannot reach server to send OTP.', 'error');
    }
  } else {
    const otp = Array.from(document.querySelectorAll('.otp-box')).map(b => b.value).join('');
    if (otp.length < 6) {
      showToast('Please enter full 6-digit OTP', 'error');
      return;
    }
    showToast('Verifying OTP...', 'info');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('ash_token', data.token);
        loginSuccess({ id: 'OTP-' + Date.now(), name: 'User (' + mobile + ')', mobile, role: 'farmer' });
      } else {
        showToast(data.error || 'Invalid OTP.', 'error');
      }
    } catch (err) {
      showToast('OTP verification failed.', 'error');
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

// ─── LOGIN ─── (Real authentication: Express Backend → Direct Supabase)
async function handleLogin() {
  const email = document.getElementById('loginEmail')?.value?.trim();
  const pw = document.getElementById('loginPassword')?.value;
  const btnText = document.getElementById('loginBtnText');
  const spinner = document.getElementById('loginSpinner');
  if (!email || !pw) { showToast('Enter email and password', 'error'); return; }

  if (btnText) btnText.style.display = 'none';
  if (spinner) spinner.style.display = 'block';

  try {
    // ── Step 1: Try Express backend ──────────────────────────
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
        loginSuccess(data.user);
        return;
      }
      if (res.status === 401 || res.status === 400) {
        showToast(data.error || 'Invalid email or password.', 'error');
        return;
      }
    } catch (backendErr) {
      console.warn('Backend unreachable, trying direct Supabase login...');
    }

    // ── Step 2: Direct Supabase browser client ───────────────
    await window.supabaseClientReady;
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
          id:    sbData.user.id,
          email: sbData.user.email,
          name:  meta.name  || 'User',
          role:  meta.role  || 'farmer',
          state: meta.state || '',
          mobile: meta.mobile || ''
        };
        showToast('Signed in via Supabase ✅', 'success');
        loginSuccess(user);
        return;
      }
    }

    showToast('Login failed. Unable to authenticate credentials.', 'error');

  } finally {
    if (btnText) btnText.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

// ─── DYNAMIC USER FORMATTER ───
function formatUserObj(userData) {
  const name = userData.name || 'User';
  const parts = name.split(' ').filter(Boolean);
  const avatar = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  const roleColors = { farmer: '#16a34a', buyer: '#0d9488', expert: '#2563eb', admin: '#7c3aed', delivery: '#ea580c' };
  
  return {
    id: userData.id || 'U-' + Date.now(),
    email: userData.email || '',
    name: name,
    role: userData.role || 'farmer',
    mobile: userData.mobile || '',
    state: userData.state || '',
    avatar: avatar,
    avatarColor: roleColors[userData.role] || '#16a34a',
    verified: true,
    certCount: userData.certCount || 0,
    totalSales: userData.totalSales || 0,
    farmName: userData.farmName || (userData.role === 'farmer' ? `${name}'s Farm` : '')
  };
}

// ─── LOGIN SUCCESS ───
function loginSuccess(user) {
  const formattedUser = formatUserObj(user);
  Session.set('user', formattedUser);
  closeAuth();
  showToast(`Welcome, ${formattedUser.name}! 🌾`, 'success');
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
      if (data.requiresEmailVerification || !data.token) {
        showToast(data.message || 'Account created! Please check your email inbox to verify your account before logging in. 📧', 'info', 6000);
        setTimeout(() => { showLoginForm(); }, 2000);
        return;
      }

      if (data.token) localStorage.setItem('ash_token', data.token);
      showToast('Account created successfully! Welcome to AgroSmartHub 🌱', 'success');

      const user = {
        ...data.user,
        farmName: document.getElementById('regFarmName')?.value || 'My Farm',
        certCount: 0,
        totalSales: 0
      };

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
    showToast('Enter your email address in the Login box first, then click Forgot Password.', 'warning');
    return;
  }

  const redirectUrl = window.location.origin + window.location.pathname + '#reset-password';
  showToast('Sending reset link...', 'info');

  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirectTo: redirectUrl }),
      signal: AbortSignal.timeout(4000)
    });
    const data = await res.json();
    if (res.ok && data.success) {
      if (data.resetLink) {
        showToast('Password reset link generated! Opening password reset...', 'success');
        setTimeout(() => {
          window.location.href = data.resetLink;
        }, 1200);
        return;
      }
      showToast(`Password reset link sent to ${email} 📧 Check your inbox!`, 'success');
      return;
    }
    if (data.error) {
      showToast(data.error, 'error');
      return;
    }
  } catch (_) {
    // Backend unreachable — try Supabase directly
  }

  await window.supabaseClientReady;
  if (window.supabaseClient) {
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast(`Password reset link sent to ${email} 📧 Check your inbox!`, 'success');
  } else {
    showToast('Unable to send reset email. Check backend/Supabase settings.', 'error');
  }
}

// ─── HANDLE RESET PASSWORD ───
async function handleResetPassword() {
  const newPw = document.getElementById('resetNewPassword')?.value;
  const confirmPw = document.getElementById('resetConfirmPassword')?.value;
  const btnText = document.getElementById('resetBtnText');
  const spinner = document.getElementById('resetSpinner');

  if (!newPw || newPw.length < 6) {
    showToast('Password must be at least 6 characters long', 'error');
    return;
  }
  if (newPw !== confirmPw) {
    showToast('Passwords do not match', 'error');
    return;
  }

  if (btnText) btnText.style.display = 'none';
  if (spinner) spinner.style.display = 'block';

  try {
    let updated = false;

    // Try via Supabase JS client session
    await window.supabaseClientReady;
    if (window.supabaseClient) {
      const { error } = await window.supabaseClient.auth.updateUser({ password: newPw });
      if (!error) {
        updated = true;
      }
    }

    if (!updated) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newPw, token: accessToken }),
        signal: AbortSignal.timeout(5000)
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        updated = true;
      } else {
        throw new Error(resData.error || 'Failed to update password');
      }
    }

    if (updated) {
      showToast('Password updated successfully! 🎉 Log in with your new password.', 'success');
      if (window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname);
      }
      setTimeout(() => {
        showLoginForm();
      }, 1500);
    }
  } catch (err) {
    showToast(err.message || 'Error resetting password. Link may have expired.', 'error');
  } finally {
    if (btnText) btnText.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

// ─── CHECK RESET LINK IN URL ───
function checkPasswordResetHash() {
  const hash = window.location.hash;
  if (hash.includes('type=recovery') || hash.includes('reset-password') || hash.includes('access_token')) {
    setTimeout(() => {
      showResetPasswordForm();
    }, 600);
  }
}

window.addEventListener('DOMContentLoaded', checkPasswordResetHash);
window.addEventListener('hashchange', checkPasswordResetHash);

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
      showToast('Using location: Coimbatore', 'success');
    });
  } else {
    showToast('Geolocation not supported. Using default location.', 'warning');
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
