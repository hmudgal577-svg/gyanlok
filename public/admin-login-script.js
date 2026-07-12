// Backend URL (Render)
const API_BASE = 'https://gyanlok-backend.onrender.com';

let otpTimerInterval = null;
let currentOtpEmail = '';

document.addEventListener('DOMContentLoaded', () => {
  initOtpLoginFlow();
});

function initOtpLoginFlow() {
  const sendOtpForm   = document.getElementById('send-otp-form');
  const verifyOtpForm = document.getElementById('verify-otp-form');
  const resendBtn     = document.getElementById('resend-otp-btn');

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
          showAdminToast('✅ Login successful! Redirecting...');
          setTimeout(() => {
            window.location.href = '/admin-dashboard.html';
          }, 800);
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
