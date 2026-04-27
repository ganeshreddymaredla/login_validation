// script.js
// Frontend logic: validation, API calls, UI interactions

// ─────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────
const API_BASE = 'http://localhost:3000/api';

// ─────────────────────────────────────────────
// Tab Switching
// ─────────────────────────────────────────────
function switchTab(tab) {
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTab     = document.getElementById('loginTab');
  const registerTab  = document.getElementById('registerTab');

  hideBanner();
  clearAllErrors();

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
  } else {
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
  }
}

// ─────────────────────────────────────────────
// Show / Hide Password Toggle
// ─────────────────────────────────────────────
function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon  = btn.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.replace('fa-eye', 'fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.replace('fa-eye-slash', 'fa-eye');
  }
}

// ─────────────────────────────────────────────
// Validation Helpers
// ─────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const passwordRules = {
  length:  (pw) => pw.length >= 8,
  upper:   (pw) => /[A-Z]/.test(pw),
  number:  (pw) => /[0-9]/.test(pw),
  special: (pw) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw)
};

// Show error under a field
function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
  // Mark input as invalid
  const inputId = id.replace('Error', '');
  const input = document.getElementById(inputId);
  if (input) { input.classList.add('invalid'); input.classList.remove('valid'); }
}

// Clear error under a field
function clearError(id) {
  const el = document.getElementById(id);
  if (el) el.textContent = '';
  const inputId = id.replace('Error', '');
  const input = document.getElementById(inputId);
  if (input) input.classList.remove('invalid');
}

// Clear all field errors
function clearAllErrors() {
  ['loginEmailError','loginPasswordError',
   'regNameError','regEmailError','regPasswordError','regConfirmError']
    .forEach(clearError);
  ['loginEmail','loginPassword','regName','regEmail','regPassword','regConfirm']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove('invalid', 'valid'); }
    });
}

// Mark input as valid (green border)
function markValid(inputId) {
  const input = document.getElementById(inputId);
  if (input) { input.classList.remove('invalid'); input.classList.add('valid'); }
}

// ─────────────────────────────────────────────
// Password Strength Meter
// ─────────────────────────────────────────────
function updateStrengthMeter(password) {
  const meter  = document.getElementById('strengthMeter');
  const fill   = document.getElementById('strengthFill');
  const label  = document.getElementById('strengthLabel');
  const rules  = document.getElementById('pwRules');

  if (!password) {
    meter.classList.remove('visible');
    rules.classList.remove('visible');
    return;
  }

  meter.classList.add('visible');
  rules.classList.add('visible');

  // Count how many rules pass
  const passed = Object.values(passwordRules).filter(fn => fn(password)).length;

  // Update individual rule items
  updateRule('rule-length',  passwordRules.length(password));
  updateRule('rule-upper',   passwordRules.upper(password));
  updateRule('rule-number',  passwordRules.number(password));
  updateRule('rule-special', passwordRules.special(password));

  // Strength levels: 1=Weak, 2=Fair, 3=Good, 4=Strong
  const levels = [
    { pct: '25%', color: '#ef4444', text: 'Weak' },
    { pct: '50%', color: '#f59e0b', text: 'Fair' },
    { pct: '75%', color: '#3b82f6', text: 'Good' },
    { pct: '100%', color: '#22c55e', text: 'Strong' }
  ];

  const level = levels[passed - 1] || levels[0];
  fill.style.width      = passed > 0 ? level.pct : '0%';
  fill.style.background = level.color;
  label.textContent     = passed > 0 ? level.text : '';
  label.style.color     = level.color;
}

function updateRule(ruleId, passed) {
  const li   = document.getElementById(ruleId);
  const icon = li.querySelector('i');
  if (passed) {
    li.classList.add('passed');
    icon.className = 'fas fa-circle-check';
  } else {
    li.classList.remove('passed');
    icon.className = 'fas fa-circle-xmark';
  }
}

// ─────────────────────────────────────────────
// Banner Messages
// ─────────────────────────────────────────────
function showBanner(message, type = 'error') {
  const banner = document.getElementById('messageBanner');
  const text   = document.getElementById('bannerText');
  const icon   = banner.querySelector('.banner-icon');

  text.textContent = message;
  banner.className = `message-banner ${type}`;
  icon.className   = `banner-icon fas ${type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`;
  banner.classList.remove('hidden');

  // Auto-hide success banners after 4 seconds
  if (type === 'success') {
    setTimeout(hideBanner, 4000);
  }
}

function hideBanner() {
  document.getElementById('messageBanner').classList.add('hidden');
}

// ─────────────────────────────────────────────
// Button Loading State
// ─────────────────────────────────────────────
function setLoading(btnId, loading) {
  const btn     = document.getElementById(btnId);
  const text    = btn.querySelector('.btn-text');
  const spinner = btn.querySelector('.btn-spinner');
  btn.disabled  = loading;
  text.classList.toggle('hidden', loading);
  spinner.classList.toggle('hidden', !loading);
}

// ─────────────────────────────────────────────
// LOGIN FORM — Validation & Submit
// ─────────────────────────────────────────────
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideBanner();
  clearAllErrors();

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const remember = document.getElementById('rememberMe').checked;

  let valid = true;

  // Client-side validation
  if (!email) {
    showError('loginEmailError', 'Email is required.'); valid = false;
  } else if (!isValidEmail(email)) {
    showError('loginEmailError', 'Enter a valid email address.'); valid = false;
  } else {
    markValid('loginEmail');
  }

  if (!password) {
    showError('loginPasswordError', 'Password is required.'); valid = false;
  } else {
    markValid('loginPassword');
  }

  if (!valid) return;

  // Send to backend
  setLoading('loginBtn', true);
  try {
    const res  = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, rememberMe: remember })
    });
    const data = await res.json();

    if (data.success) {
      // Store token
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('authToken', data.token);
      storage.setItem('authUser',  JSON.stringify(data.user));

      // Show login success splash, then navigate to dashboard
      showLoginSuccess(data.token, data.user);
    } else {
      showBanner(data.message, 'error');
    }
  } catch (err) {
    showBanner('Cannot connect to server. Make sure the backend is running.', 'error');
  } finally {
    setLoading('loginBtn', false);
  }
});

// ─────────────────────────────────────────────
// REGISTER FORM — Validation & Submit
// ─────────────────────────────────────────────
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  hideBanner();
  clearAllErrors();

  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;

  let valid = true;

  // Name
  if (!name) {
    showError('regNameError', 'Name is required.'); valid = false;
  } else if (name.length < 2) {
    showError('regNameError', 'Name must be at least 2 characters.'); valid = false;
  } else {
    markValid('regName');
  }

  // Email
  if (!email) {
    showError('regEmailError', 'Email is required.'); valid = false;
  } else if (!isValidEmail(email)) {
    showError('regEmailError', 'Enter a valid email address.'); valid = false;
  } else {
    markValid('regEmail');
  }

  // Password rules
  if (!password) {
    showError('regPasswordError', 'Password is required.'); valid = false;
  } else {
    const failedRules = [];
    if (!passwordRules.length(password))  failedRules.push('8+ characters');
    if (!passwordRules.upper(password))   failedRules.push('1 uppercase letter');
    if (!passwordRules.number(password))  failedRules.push('1 number');
    if (!passwordRules.special(password)) failedRules.push('1 special character');

    if (failedRules.length > 0) {
      showError('regPasswordError', `Needs: ${failedRules.join(', ')}.`);
      valid = false;
    } else {
      markValid('regPassword');
    }
  }

  // Confirm password
  if (!confirm) {
    showError('regConfirmError', 'Please confirm your password.'); valid = false;
  } else if (password !== confirm) {
    showError('regConfirmError', 'Passwords do not match.'); valid = false;
  } else {
    markValid('regConfirm');
  }

  if (!valid) return;

  // Send to backend
  setLoading('registerBtn', true);
  try {
    const res  = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword: confirm })
    });
    const data = await res.json();

    if (data.success) {
      // Reset form
      document.getElementById('registerForm').reset();
      updateStrengthMeter('');
      // Show the registration success page
      showRegisterSuccess(name, email);
    } else {
      showBanner(data.message, 'error');
    }
  } catch (err) {
    showBanner('Cannot connect to server. Make sure the backend is running.', 'error');
  } finally {
    setLoading('registerBtn', false);
  }
});

// ─────────────────────────────────────────────
// REGISTER SUCCESS PAGE
// ─────────────────────────────────────────────
function showRegisterSuccess(name, email) {
  document.getElementById('authCard').classList.add('hidden');

  document.getElementById('regSuccessName').textContent  = name;
  document.getElementById('regSuccessEmail').textContent = email;
  document.getElementById('regSuccessDate').textContent  = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  document.getElementById('registerSuccessCard').classList.remove('hidden');

  // Countdown 3 → 2 → 1 then go to login
  let count = 3;
  const tick = setInterval(() => {
    count--;
    document.getElementById('regCountdown').textContent = count;
    if (count <= 0) {
      clearInterval(tick);
      goToLogin();
    }
  }, 1000);
}

function goToLogin() {
  document.getElementById('registerSuccessCard').classList.add('hidden');
  document.getElementById('authCard').classList.remove('hidden');
  switchTab('login');
}

// ─────────────────────────────────────────────
// LOGIN SUCCESS SPLASH
// ─────────────────────────────────────────────
function showLoginSuccess(token, user) {
  document.getElementById('authCard').classList.add('hidden');
  document.getElementById('loginSuccessCard').classList.remove('hidden');

  // Countdown 2 → 1 then show dashboard
  let count = 2;
  const tick = setInterval(() => {
    count--;
    document.getElementById('loginCountdown').textContent = count;
    if (count <= 0) {
      clearInterval(tick);
      document.getElementById('loginSuccessCard').classList.add('hidden');
      showDashboard(token, user);
    }
  }, 1000);
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
async function showDashboard(token, user) {
  // Try to fetch fresh data from protected route
  try {
    const res  = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();

    if (data.success) {
      const u = data.user;
      populateDashboard(u.name, u.email, u.id, u.created_at, token);
      return;
    }
  } catch (_) { /* fallback below */ }

  // Fallback to stored user data
  populateDashboard(user.name, user.email, user.id, null, token);
}

function populateDashboard(name, email, id, createdAt, token) {
  document.getElementById('dashAvatar').textContent = name.charAt(0).toUpperCase();
  document.getElementById('dashName').textContent   = name;
  document.getElementById('dashEmail').textContent  = email;
  document.getElementById('dashId').textContent     = `#${id}`;
  document.getElementById('dashSince').textContent  = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '—';

  document.getElementById('dashboardCard').classList.remove('hidden');
}

// ─────────────────────────────────────────────
// Logout
// ─────────────────────────────────────────────
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('authUser');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('authUser');

  // Hide all cards, show auth
  ['dashboardCard', 'loginSuccessCard', 'registerSuccessCard'].forEach(id =>
    document.getElementById(id).classList.add('hidden')
  );
  document.getElementById('authCard').classList.remove('hidden');
  switchTab('login');
}

// ─────────────────────────────────────────────
// Auto-login if token exists on page load
// ─────────────────────────────────────────────
(function checkExistingSession() {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const user  = JSON.parse(localStorage.getItem('authUser') || sessionStorage.getItem('authUser') || 'null');

  if (token && user) {
    // Skip success splash on reload — go straight to dashboard
    document.getElementById('authCard').classList.add('hidden');
    showDashboard(token, user);
  }
})();
