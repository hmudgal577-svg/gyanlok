// Global state variables
let currentAdmin = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLoginForm();
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
    const res = await fetch('/api/admin/me');
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
  currentAdmin = null;
}

function showDashboard() {
  document.getElementById('login-container').hidden = true;
  document.getElementById('dashboard-container').hidden = false;
  document.getElementById('admin-email-display').textContent = currentAdmin.email;
  
  // Load initial statistics and overview data
  loadOverviewStats();
  loadMentorRequests();
  loadSubmissions();
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      errorBox.textContent = 'Please fill in all fields.';
      errorBox.hidden = false;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        currentAdmin = data.user;
        showDashboard();
        form.reset();
      } else {
        errorBox.textContent = data.error || 'Login failed. Please try again.';
        errorBox.hidden = false;
      }
    } catch (err) {
      console.error(err);
      errorBox.textContent = 'Network error. Please check your connection.';
      errorBox.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log In';
    }
  });

  // Logout button trigger
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/admin/logout', { method: 'POST' });
        if (res.ok) {
          showLogin();
        }
      } catch (err) {
        console.error('Logout failed:', err);
      }
    });
  }
}

// ----------------------------------------------------
// Navigation / Sidebar menu toggles
// ----------------------------------------------------

function initSidebarMenu() {
  const menuButtons = document.querySelectorAll('.menu-item');
  const panelSections = document.querySelectorAll('.panel-section');
  const panelTitle = document.getElementById('panel-title');

  menuButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      
      // Update active menu link
      menuButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update panels display
      panelSections.forEach(panel => {
        panel.classList.toggle('active', panel.id === target);
      });

      // Update main panel title text
      panelTitle.textContent = btn.innerText.trim();

      // Refresh corresponding data on tab click
      if (target === 'panel-overview') {
        loadOverviewStats();
      } else if (target === 'panel-mentor') {
        loadMentorRequests();
      } else if (target === 'panel-submissions') {
        loadSubmissions();
      }
    });
  });
}

// ----------------------------------------------------
// Data Loading Operations
// ----------------------------------------------------

async function loadOverviewStats() {
  try {
    const [requestsRes, submissionsRes, notificationsRes] = await Promise.all([
      fetch('/api/admin/mentor-requests'),
      fetch('/api/admin/submissions'),
      fetch('/api/admin/notifications')
    ]);

    if (requestsRes.ok && submissionsRes.ok && notificationsRes.ok) {
      const requests = await requestsRes.json();
      const submissions = await submissionsRes.json();
      const notifications = await notificationsRes.json();

      // Set metric counters
      document.getElementById('stat-requests').textContent = requests.length;
      document.getElementById('stat-submissions').textContent = submissions.length;
      document.getElementById('stat-alerts').textContent = notifications.length;

      // Update sidebar notification badges
      const mentorBadge = document.getElementById('badge-mentor');
      if (requests.length > 0) {
        mentorBadge.textContent = requests.length;
        mentorBadge.hidden = false;
      } else {
        mentorBadge.hidden = true;
      }

      const submissionBadge = document.getElementById('badge-submissions');
      const pendingSubmissions = submissions.filter(s => s.status === 'Pending').length;
      if (pendingSubmissions > 0) {
        submissionBadge.textContent = pendingSubmissions;
        submissionBadge.hidden = false;
      } else {
        submissionBadge.hidden = true;
      }

      // Populate recent requests inside dashboard overview list
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

  // Display top 5 recent requests
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
    const res = await fetch('/api/admin/mentor-requests');
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
    const res = await fetch('/api/admin/submissions');
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
        <td><span style="text-transform: capitalize;">${escapeHTML(sub.resource_type)}</span></td>
        <td>
          <a href="${sub.file_path}" target="_blank" class="action-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${escapeHTML(sub.file_name)}
          </a>
        </td>
        <td>${new Date(sub.created_at).toLocaleString()}</td>
        <td>
          <span class="status-pill ${sub.status.toLowerCase()}">${escapeHTML(sub.status)}</span>
        </td>
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
  // Test Sheet Upload Form
  const testForm = document.getElementById('upload-test-form');
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
        const res = await fetch('/api/admin/upload-test-sheet', {
          method: 'POST',
          body: formData
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
        console.error(err);
        testStatus.className = 'form-status error';
        testStatus.textContent = 'Network connection failed.';
      } finally {
        testSubmit.disabled = false;
      }
    });
  }

  // Chapter Resource Upload Form
  const chForm = document.getElementById('upload-chapter-form');
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
        const res = await fetch('/api/admin/upload-chapter-resource', {
          method: 'POST',
          body: formData
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
        console.error(err);
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
