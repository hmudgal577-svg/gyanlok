// Backend URL (Render)
const API_BASE = 'https://gyanlok-backend.onrender.com';

// Global state variables
let currentAdmin = null;
let otpTimerInterval = null;
let currentOtpEmail = '';

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initOtpLoginFlow();
  initSidebarMenu();
  initUploadForms();
  updateDate();
});

// Update the header date display
function updateDate() {
  const dateEl = document.getElementById('date-display');
  if (dateEl) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString('en-US', options);
  }
}

// ----------------------------------------------------
// Authentication logic
// ----------------------------------------------------

async function checkAuth() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/me`, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      currentAdmin = data.user;
      showDashboard();
    } else {
      showLogin();
    }
  } catch (err) {
    console.error('Auth check failed:', err);
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-container').hidden = false;
  document.getElementById('dashboard-container').hidden = true;
  // Reset to step 1
  document.getElementById('step-email').hidden = false;
  document.getElementById('step-otp').hidden = true;
  currentAdmin = null;
  clearOtpTimer();
}

function showDashboard() {
  document.getElementById('login-container').hidden = true;
  document.getElementById('dashboard-container').hidden = false;
  document.getElementById('admin-email-display').textContent = currentAdmin.email;
  clearOtpTimer();
  loadOverviewStats();
  loadMentorRequests();
  loadSubmissions();
}

// ----------------------------------------------------
// OTP Login Flow (2-step)
// ----------------------------------------------------

function initOtpLoginFlow() {
  const sendOtpForm   = document.getElementById('send-otp-form');
  const verifyOtpForm = document.getElementById('verify-otp-form');
  const resendBtn     = document.getElementById('resend-otp-btn');
  const logoutBtn     = document.getElementById('logout-btn');

  // ── STEP 1: Send OTP ──
  if (sendOtpForm) {
    sendOtpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('otp-send-error');
      const btn    = document.getElementById('send-otp-btn');
      const email  = document.getElementById('admin-email-input').value.trim();

      errBox.hidden = true;
      btn.disabled = true;
      btn.textContent = 'Sending OTP...';

      try {
        const res  = await fetch(`${API_BASE}/api/admin/send-otp`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email }),
        });
        const data = await res.json();

        if (res.ok) {
          currentOtpEmail = email;
          document.getElementById('otp-target-email').textContent = email;
          document.getElementById('step-email').hidden = true;
          document.getElementById('step-otp').hidden   = false;
          document.getElementById('otp-input').value   = '';
          document.getElementById('otp-input').focus();
          startOtpTimer(5 * 60); // 5 minutes
          showAdminToast('📧 OTP sent! Check your Gmail.');
        } else {
          errBox.textContent = data.error || 'Failed to send OTP.';
          errBox.hidden = false;
        }
      } catch (err) {
        errBox.textContent = 'Network error. Check your connection.';
        errBox.hidden = false;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send OTP to Gmail';
      }
    });
  }

  // ── STEP 2: Verify OTP ──
  if (verifyOtpForm) {
    verifyOtpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errBox = document.getElementById('otp-verify-error');
      const btn    = document.getElementById('verify-otp-btn');
      const otp    = document.getElementById('otp-input').value.trim();

      errBox.hidden = true;
      btn.disabled = true;
      btn.textContent = 'Verifying...';

      try {
        const res  = await fetch(`${API_BASE}/api/admin/verify-otp`, {
          method:      'POST',
          headers:     { 'Content-Type': 'application/json' },
          credentials: 'include',
          body:        JSON.stringify({ email: currentOtpEmail, otp }),
        });
        const data = await res.json();

        if (res.ok) {
          currentAdmin = data.user;
          showAdminToast('✅ Login successful! Welcome.');
          showDashboard();
        } else {
          errBox.textContent = data.error || 'Invalid OTP.';
          errBox.hidden = false;
          // Shake animation
          document.getElementById('otp-input').classList.add('shake');
          setTimeout(() => document.getElementById('otp-input').classList.remove('shake'), 500);
        }
      } catch (err) {
        errBox.textContent = 'Network error. Please try again.';
        errBox.hidden = false;
      } finally {
        btn.disabled = false;
        btn.textContent = 'Verify OTP & Login';
      }
    });
  }

  // ── Resend / Back ──
  if (resendBtn) {
    resendBtn.addEventListener('click', () => {
      clearOtpTimer();
      document.getElementById('step-otp').hidden   = true;
      document.getElementById('step-email').hidden = false;
      document.getElementById('otp-verify-error').hidden = true;
    });
  }

  // ── Logout ──
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch(`${API_BASE}/api/admin/logout`, { method: 'POST', credentials: 'include' });
      } catch (err) {}
      showLogin();
      showAdminToast('Logged out successfully.');
    });
  }
}

// ── OTP Countdown Timer ──
function startOtpTimer(seconds) {
  clearOtpTimer();
  let remaining = seconds;
  const el = document.getElementById('timer-count');
  if (!el) return;

  function tick() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    el.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    if (remaining <= 0) {
      clearOtpTimer();
      el.textContent = 'Expired';
      el.style.color = 'red';
      document.getElementById('verify-otp-btn').disabled = true;
      document.getElementById('otp-verify-error').textContent = 'OTP expired. Please request a new one.';
      document.getElementById('otp-verify-error').hidden = false;
    }
    remaining--;
  }
  tick();
  otpTimerInterval = setInterval(tick, 1000);
}

function clearOtpTimer() {
  if (otpTimerInterval) {
    clearInterval(otpTimerInterval);
    otpTimerInterval = null;
  }
  const el = document.getElementById('timer-count');
  if (el) { el.textContent = '5:00'; el.style.color = ''; }
}

// ----------------------------------------------------
// Navigation / Sidebar menu toggles
// ----------------------------------------------------

function initSidebarMenu() {
  const menuButtons  = document.querySelectorAll('.menu-item');
  const panelSections = document.querySelectorAll('.panel-section');
  const panelTitle   = document.getElementById('panel-title');

  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      menuButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      panelSections.forEach(panel => {
        panel.classList.toggle('active', panel.id === target);
      });
      panelTitle.textContent = btn.innerText.trim();
      if (target === 'panel-overview')     loadOverviewStats();
      else if (target === 'panel-mentor')  loadMentorRequests();
      else if (target === 'panel-submissions') loadSubmissions();
    });
  });
}

// ----------------------------------------------------
// Data Loading Operations
// ----------------------------------------------------

async function loadOverviewStats() {
  try {
    const [requestsRes, submissionsRes, notificationsRes] = await Promise.all([
      fetch(`${API_BASE}/api/admin/mentor-requests`,  { credentials: 'include' }),
      fetch(`${API_BASE}/api/admin/submissions`,       { credentials: 'include' }),
      fetch(`${API_BASE}/api/admin/notifications`,     { credentials: 'include' }),
    ]);

    if (requestsRes.ok && submissionsRes.ok && notificationsRes.ok) {
      const requests      = await requestsRes.json();
      const submissions   = await submissionsRes.json();
      const notifications = await notificationsRes.json();

      document.getElementById('stat-requests').textContent    = requests.length;
      document.getElementById('stat-submissions').textContent = submissions.length;
      document.getElementById('stat-alerts').textContent      = notifications.length;

      const mentorBadge = document.getElementById('badge-mentor');
      if (requests.length > 0) { mentorBadge.textContent = requests.length; mentorBadge.hidden = false; }
      else { mentorBadge.hidden = true; }

      const submissionBadge = document.getElementById('badge-submissions');
      const pending = submissions.filter(s => s.status === 'Pending').length;
      if (pending > 0) { submissionBadge.textContent = pending; submissionBadge.hidden = false; }
      else { submissionBadge.hidden = true; }

      populateRecentRequests(requests);
    }
  } catch (err) {
    console.error('Failed to load dashboard statistics:', err);
  }
}

function populateRecentRequests(requests) {
  const container = document.getElementById('recent-requests-body');
  if (!container) return;
  if (requests.length === 0) {
    container.innerHTML = `<tr><td colspan="4" class="no-data">No recent requests.</td></tr>`;
    return;
  }
  const recent = requests.slice(0, 5);
  container.innerHTML = recent.map(req => `
    <tr>
      <td><strong>${escapeHTML(req.name)}</strong><br/><span style="font-size:0.75rem;color:var(--text-muted)">${escapeHTML(req.email_or_phone)}</span></td>
      <td>Class ${escapeHTML(req.student_class)}</td>
      <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHTML(req.message)}">${escapeHTML(req.message)}</td>
      <td>${new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
    </tr>
  `).join('');
}

async function loadMentorRequests() {
  const container = document.getElementById('mentor-requests-table-body');
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/mentor-requests`, { credentials: 'include' });
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.length === 0) {
      container.innerHTML = `<tr><td colspan="5" class="no-data">No mentor requests found.</td></tr>`;
      return;
    }
    container.innerHTML = data.map(req => `
      <tr>
        <td><strong>${escapeHTML(req.name)}</strong></td>
        <td>${escapeHTML(req.email_or_phone)}</td>
        <td>Class ${escapeHTML(req.student_class)}</td>
        <td style="white-space:pre-wrap;max-width:400px;">${escapeHTML(req.message)}</td>
        <td>${new Date(req.created_at).toLocaleString()}</td>
      </tr>
    `).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="5" class="no-data" style="color:red">Failed to load requests.</td></tr>`;
  }
}

async function loadSubmissions() {
  const container = document.getElementById('submissions-table-body');
  if (!container) return;
  try {
    const res = await fetch(`${API_BASE}/api/admin/submissions`, { credentials: 'include' });
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (data.length === 0) {
      container.innerHTML = `<tr><td colspan="6" class="no-data">No student submissions found.</td></tr>`;
      return;
    }
    container.innerHTML = data.map(sub => `
      <tr>
        <td><strong>${escapeHTML(sub.student_name)}</strong></td>
        <td>${escapeHTML(sub.resource_title)}<br/><span style="font-size:0.75rem;color:var(--text-muted)">ID: ${escapeHTML(sub.resource_id)}</span></td>
        <td><span style="text-transform:capitalize;">${escapeHTML(sub.resource_type)}</span></td>
        <td>
          <a href="${sub.file_path}" target="_blank" class="action-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${escapeHTML(sub.file_name)}
          </a>
        </td>
        <td>${new Date(sub.created_at).toLocaleString()}</td>
        <td><span class="status-pill ${sub.status.toLowerCase()}">${escapeHTML(sub.status)}</span></td>
      </tr>
    `).join('');
  } catch (err) {
    container.innerHTML = `<tr><td colspan="6" class="no-data" style="color:red">Failed to load student submissions.</td></tr>`;
  }
}

// ----------------------------------------------------
// Resource Form Submissions
// ----------------------------------------------------

function initUploadForms() {
  const testForm   = document.getElementById('upload-test-form');
  const testSubmit = document.getElementById('test-submit-btn');
  const testStatus = document.getElementById('test-form-status');

  if (testForm) {
    testForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      testStatus.className = 'form-status';
      testStatus.textContent = 'Uploading...';
      testSubmit.disabled = true;
      const formData = new FormData(testForm);
      try {
        const res = await fetch(`${API_BASE}/api/admin/upload-test-sheet`, {
          method: 'POST', credentials: 'include', body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          testStatus.className = 'form-status success';
          testStatus.textContent = '✓ Test sheet added successfully!';
          testForm.reset();
        } else {
          testStatus.className = 'form-status error';
          testStatus.textContent = data.error || 'Failed to upload test sheet.';
        }
      } catch (err) {
        testStatus.className = 'form-status error';
        testStatus.textContent = 'Network connection failed.';
      } finally {
        testSubmit.disabled = false;
      }
    });
  }

  const chForm   = document.getElementById('upload-chapter-form');
  const chSubmit = document.getElementById('ch-submit-btn');
  const chStatus = document.getElementById('ch-form-status');

  if (chForm) {
    chForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      chStatus.className = 'form-status';
      chStatus.textContent = 'Uploading...';
      chSubmit.disabled = true;
      const formData = new FormData(chForm);
      try {
        const res = await fetch(`${API_BASE}/api/admin/upload-chapter-resource`, {
          method: 'POST', credentials: 'include', body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          chStatus.className = 'form-status success';
          chStatus.textContent = '✓ Material added successfully!';
          chForm.reset();
        } else {
          chStatus.className = 'form-status error';
          chStatus.textContent = data.error || 'Failed to add chapter resource.';
        }
      } catch (err) {
        chStatus.className = 'form-status error';
        chStatus.textContent = 'Network connection failed.';
      } finally {
        chSubmit.disabled = false;
      }
    });
  }
}

// Helper sanitization for HTML rendering
function escapeHTML(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Toast notification
function showAdminToast(message) {
  const old = document.getElementById('admin-toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.id = 'admin-toast';
  Object.assign(toast.style, {
    position: 'fixed', bottom: '2rem', left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: '#1A2740', color: 'white',
    padding: '.7rem 1.4rem', borderRadius: '100px',
    fontSize: '.86rem', fontWeight: '500',
    boxShadow: '0 8px 24px rgba(0,0,0,.22)', zIndex: '9999',
    opacity: '0', transition: 'opacity .3s ease, transform .3s ease',
  });
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}
