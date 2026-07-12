const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/**
 * GyanLok Backend — server.js
 * Stack: Express + Supabase (PostgreSQL) + Cloudinary (file storage)
 * Fallback: JSON file storage when DB not available
 */

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit    = require('express-rate-limit');
const multer       = require('multer');
const path         = require('path');
const fs           = require('fs');
const bcrypt       = require('bcryptjs');
const jwt          = require('jsonwebtoken');

require('dotenv').config();

// ─── Cloudinary setup (optional — falls back to local disk) ─────────────────
let cloudinaryStorage = null;
let usingCloudinary   = false;
try {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const cloudinary = require('cloudinary').v2;
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    cloudinaryStorage = new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder:          'gyanlok',
        resource_type:   'auto',
        public_id:       `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
        allowed_formats: ['pdf','png','jpg','jpeg'],
      }),
    });
    usingCloudinary = true;
    console.log('[Storage] Cloudinary connected ✓');
  } else {
    console.log('[Storage] Cloudinary not configured → using local disk uploads/');
  }
} catch (e) {
  console.log('[Storage] Cloudinary module error → using local disk uploads/', e.message);
}

// ─── Try to load PostgreSQL (optional) ─────────────────────────────────────
let db = null;
let usingDb = false;
try {
  if (!process.env.DATABASE_URL) {
    console.log('[DB] DATABASE_URL not set → using JSON file storage');
  } else {
    console.log('[DB] DATABASE_URL found, connecting to PostgreSQL...');
    db = require('./db');
    db.query('SELECT 1').then(() => {
      usingDb = true;
      console.log('[DB] PostgreSQL (Supabase) connected ✓');
    }).catch((err) => {
      usingDb = false;
      console.error('[DB] PostgreSQL connection FAILED:', err.message);
      console.log('[DB] Falling back to JSON file storage');
    });
  }
} catch (e) {
  console.error('[DB] PostgreSQL module error:', e.message);
  console.log('[DB] Falling back to JSON file storage');
}

// ─── JSON File Storage helpers ─────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function readJson(file, defaultVal) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return defaultVal;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (e) { return defaultVal; }
}

function writeJson(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

// ─── Seed or Update admin user based on Env variables ────────────────────────
(async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'ektaverma09.work@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || '99722 47410';

  if (usingDb) {
    try {
      const res = await db.query("SELECT * FROM users WHERE role = 'admin'");
      const hash = await bcrypt.hash(adminPassword, 12);
      if (res.rows.length === 0) {
        await db.query("INSERT INTO users (email, password_hash, role, name) VALUES ($1, $2, 'admin', 'Admin')", [adminEmail, hash]);
        console.log(`[INIT] Admin created in database: ${adminEmail}`);
      } else {
        // Always sync email AND password on every startup
        const currentAdmin = res.rows[0];
        await db.query('UPDATE users SET email = $1, password_hash = $2, updated_at = NOW() WHERE id = $3', [adminEmail, hash, currentAdmin.id]);
        console.log(`[INIT] Admin credentials synced in database: ${adminEmail}`);
      }
    } catch (e) {
      console.error('[INIT-DB-ADMIN]', e);
    }
  } else {
    const users = readJson('users.json', []);
    const hash = await bcrypt.hash(adminPassword, 12);
    const adminIndex = users.findIndex(u => u.role === 'admin');

    if (adminIndex === -1) {
      users.push({
        id: Date.now(),
        email: adminEmail,
        password_hash: hash,
        role: 'admin'
      });
      writeJson('users.json', users);
      console.log(`[INIT] Admin created in JSON storage: ${adminEmail}`);
    } else {
      const currentAdmin = users[adminIndex];
      currentAdmin.email = adminEmail;
      currentAdmin.password_hash = hash;
      writeJson('users.json', users);
      console.log(`[INIT] Admin credentials synchronized with env vars: ${adminEmail}`);
    }
  }
})();

// ─── App setup ──────────────────────────────────────────────────────────────
const app        = express();
app.set('trust proxy', 1); // trust first proxy behind Render / Vercel CDN
const PORT       = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gyanlok_super_secret_jwt_2026!';

// Ensure upload folders exist
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ─── Security Middleware ────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:   ["'self'"],
      scriptSrc:    ["'self'", "'unsafe-inline'"],
      styleSrc:     ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:      ["'self'", "https://fonts.gstatic.com"],
      imgSrc:       ["'self'", "data:", "blob:"],
      connectSrc:   ["'self'"],
    },
  },
}));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static files ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// ─── Rate Limiters ──────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', generalLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again after 15 minutes.' },
});

// ─── Multer (File Upload — Cloudinary or local disk) ───────────────────────
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const unique    = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, unique + '-' + sanitized);
  }
});
const upload = multer({
  storage: usingCloudinary ? cloudinaryStorage : diskStorage,
  fileFilter: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    const ok   = /pdf|png|jpeg|jpg/.test(ext) && /pdf|png|jpeg|jpg|octet-stream/.test(mime);
    if (ok) cb(null, true);
    else    cb(new Error('Only PDF, PNG, and JPG files are allowed.'));
  },
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB (Cloudinary supports up to 100MB)
});

// Helper: get public URL from uploaded file
function getFileUrl(req) {
  if (!req.file) return null;
  if (usingCloudinary) return req.file.path;  // Cloudinary gives full URL in file.path
  return `/uploads/${req.file.filename}`;      // Local disk gives filename
}

// ─── JWT Middleware ──────────────────────────────────────────────────────────
function auth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

// ─── In-memory boards cache ──────────────────────────────────────────────────
let boardsDataCache = null;
function invalidateCache() { boardsDataCache = null; }

// ============================================================
// AUTHENTICATION ENDPOINTS
// ============================================================

// POST /api/admin/login
app.post('/api/admin/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  try {
    let user;
    if (usingDb) {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      user = result.rows[0];
    } else {
      const users = readJson('users.json', []);
      user = users.find(u => u.email === email);
    }

    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({ success: true, user: { email: user.email, role: user.role } });
  } catch (err) {
    console.error('[login]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out.' });
});

// GET /api/admin/me
app.get('/api/admin/me', auth, (req, res) => res.json({ user: req.user }));

// ────────────────────────────────────────────────────────────
// Student Portal Endpoints
// ────────────────────────────────────────────────────────────

// POST /api/student/register
app.post('/api/student/register', async (req, res) => {
  const { name, email, class_num, password } = req.body;
  if (!name || !email || !class_num || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    let newUser;

    if (usingDb) {
      const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) return res.status(400).json({ error: 'Email or phone already registered.' });

      const result = await db.query(
        "INSERT INTO users (name, email, password_hash, role, class_num) VALUES ($1, $2, $3, 'student', $4) RETURNING id, name, email, role, class_num",
        [name, email, hash, parseInt(class_num)]
      );
      newUser = result.rows[0];
    } else {
      const users = readJson('users.json', []);
      if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email or phone already registered.' });

      newUser = { id: Date.now(), name, email, password_hash: hash, role: 'student', class_num: parseInt(class_num) };
      users.push(newUser);
      writeJson('users.json', users);
    }

    const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email, role: 'student', class_num: newUser.class_num }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, user: { name: newUser.name, email: newUser.email, role: 'student', class_num: newUser.class_num } });
  } catch (err) {
    console.error('[student-register]', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// POST /api/student/login
app.post('/api/student/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    let user;
    if (usingDb) {
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      user = result.rows[0];
    } else {
      const users = readJson('users.json', []);
      user = users.find(u => u.email === email);
    }

    if (!user || user.role !== 'student') return res.status(401).json({ error: 'Invalid email/phone or password.' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email/phone or password.' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: 'student', class_num: user.class_num }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ success: true, user: { name: user.name, email: user.email, role: 'student', class_num: user.class_num } });
  } catch (err) {
    console.error('[student-login]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/student/logout
app.post('/api/student/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out.' });
});

// GET /api/student/me
app.get('/api/student/me', auth, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied.' });
  res.json({ user: req.user });
});

// GET /api/student/submissions
app.get('/api/student/submissions', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Access denied.' });
  try {
    if (usingDb) {
      const result = await db.query('SELECT * FROM student_submissions WHERE student_name = $1 ORDER BY created_at DESC', [req.user.name]);
      return res.json({ submissions: result.rows });
    }
    const submissions = readJson('student_submissions.json', []);
    const studentSubs = submissions.filter(s => s.student_name === req.user.name);
    res.json({ submissions: studentSubs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve submissions.' });
  }
});


// ============================================================
// PUBLIC APIs — Educational Content
// ============================================================

// GET /api/resources → Returns BOARDS_DATA JSON (same shape the frontend expects)
app.get('/api/resources', async (req, res) => {
  if (boardsDataCache) return res.json(boardsDataCache);

  if (usingDb) {
    try {
      const responseData = {};
      const boardsRes = await db.query('SELECT * FROM boards');
      for (const board of boardsRes.rows) {
        responseData[board.name] = { classes: [], subjectsByClass: {}, resources: {} };
        const subjectsRes = await db.query('SELECT * FROM subjects WHERE board_id = $1 ORDER BY class_num, name', [board.id]);

        for (const subject of subjectsRes.rows) {
          if (!responseData[board.name].classes.includes(subject.class_num))
            responseData[board.name].classes.push(subject.class_num);
          if (!responseData[board.name].subjectsByClass[subject.class_num])
            responseData[board.name].subjectsByClass[subject.class_num] = [];
          responseData[board.name].subjectsByClass[subject.class_num].push(subject.name);

          const subRes   = await db.query('SELECT type, title, file_url, is_new FROM subject_resources WHERE subject_id = $1', [subject.id]);
          const booksRes = await db.query('SELECT * FROM books WHERE subject_id = $1 ORDER BY name', [subject.id]);

          const booksData = [];
          for (const book of booksRes.rows) {
            const chaptersRes = await db.query('SELECT * FROM chapters WHERE book_id = $1 ORDER BY num', [book.id]);
            booksData.push({
              id: book.id, name: book.name, subtitle: book.subtitle, color: book.color,
              chapters: chaptersRes.rows.map(c => ({ num: c.num, title: c.title, worksheets: c.worksheets }))
            });
          }

          if (!responseData[board.name].resources[subject.class_num])
            responseData[board.name].resources[subject.class_num] = {};

          const entry = { books: booksData };
          subRes.rows.forEach(r => {
            if (r.type === 'Syllabus')        entry.syllabus      = { title: r.title, file_url: r.file_url, isNew: r.is_new };
            else if (r.type === 'Marking Scheme') entry.markingScheme = { title: r.title, file_url: r.file_url };
          });
          responseData[board.name].resources[subject.class_num][subject.name] = entry;
        }
        responseData[board.name].classes.sort((a, b) => a - b);
      }

      boardsDataCache = responseData;
      return res.json(responseData);
    } catch (err) {
      console.error('[api/resources]', err);
    }
  }

  // JSON file fallback — return empty object so frontend uses its own hardcoded data
  return res.json({});
});

// GET /api/test-sheets → Returns TEST_DATA JSON
app.get('/api/test-sheets', async (req, res) => {
  if (usingDb) {
    try {
      const result = await db.query('SELECT * FROM test_sheets ORDER BY created_at DESC');
      const testData = { UTP: { CBSE: {}, ICSE: {} }, Worksheets: { CBSE: {}, ICSE: {} }, MockExam: { CBSE: {}, ICSE: {} } };
      result.rows.forEach(row => {
        const { type, board, class_num, id, title, subject, date_label, pages, file_url, color } = row;
        if (!testData[type]) return;
        if (!testData[type][board]) testData[type][board] = {};
        if (!testData[type][board][class_num]) testData[type][board][class_num] = [];
        testData[type][board][class_num].push({ id: id.toString(), title, subject, date: date_label, pages, file_url, color });
      });
      return res.json(testData);
    } catch (err) {
      console.error('[api/test-sheets]', err);
    }
  }

  // JSON file fallback
  const sheets = readJson('test_sheets.json', []);
  const testData = { UTP: { CBSE: {}, ICSE: {} }, Worksheets: { CBSE: {}, ICSE: {} }, MockExam: { CBSE: {}, ICSE: {} } };
  sheets.forEach(row => {
    const { type, board, class_num, id, title, subject, date_label, pages, file_url, color } = row;
    if (!testData[type]) return;
    if (!testData[type][board]) testData[type][board] = {};
    if (!testData[type][board][class_num]) testData[type][board][class_num] = [];
    testData[type][board][class_num].push({ id: id.toString(), title, subject, date: date_label, pages, file_url, color });
  });
  return res.json(testData);
});


// ============================================================
// FORM SUBMISSIONS (Public)
// ============================================================

// POST /api/mentor-request
app.post('/api/mentor-request', async (req, res) => {
  const { name, email_or_phone, student_class, message } = req.body;
  if (!name || !email_or_phone || !student_class || !message)
    return res.status(400).json({ error: 'All fields are required.' });

  const entry = {
    id: Date.now(), name, email_or_phone, student_class, message,
    status: 'new', created_at: new Date().toISOString()
  };

  try {
    if (usingDb) {
      await db.query(
        'INSERT INTO mentor_requests (name, email_or_phone, student_class, message) VALUES ($1,$2,$3,$4)',
        [name, email_or_phone, student_class, message]
      );
    } else {
      const requests = readJson('mentor_requests.json', []);
      requests.unshift(entry);
      writeJson('mentor_requests.json', requests);
    }
    res.json({ success: true, message: 'Message sent! A mentor will reply within 24 hours.' });
  } catch (err) {
    console.error('[mentor-request]', err);
    res.status(500).json({ error: 'Failed to submit.' });
  }
});

// POST /api/revision-notify
app.post('/api/revision-notify', async (req, res) => {
  const { name, contact, class_num } = req.body;
  if (!name || !contact || !class_num)
    return res.status(400).json({ error: 'All fields required.' });

  const entry = { id: Date.now(), name, contact, class_num, created_at: new Date().toISOString() };

  try {
    if (usingDb) {
      await db.query(
        'INSERT INTO revision_notifications (name, contact, class_num) VALUES ($1,$2,$3)',
        [name, contact, parseInt(class_num)]
      );
    } else {
      const notifications = readJson('revision_notifications.json', []);
      notifications.unshift(entry);
      writeJson('revision_notifications.json', notifications);
    }
    res.json({ success: true, message: "You'll be notified when Revision Classes begin!" });
  } catch (err) {
    console.error('[revision-notify]', err);
    res.status(500).json({ error: 'Failed to register.' });
  }
});

// POST /api/student-submit — Upload answer sheet
app.post('/api/student-submit', upload.single('answer_file'), async (req, res) => {
  const { resource_type, resource_id, resource_title, student_name } = req.body;

  if (!req.file && !req.body.paperId) {
    // Allow JSON-only submissions (when no file, just mark submitted)
  }

  const fileUrl = getFileUrl(req);
  const entry = {
    id: Date.now(),
    resource_type, resource_id, resource_title,
    student_name: student_name || 'Anonymous',
    file_name: req.file?.originalname || 'no-file',
    file_path: fileUrl,
    created_at: new Date().toISOString()
  };

  try {
    if (usingDb) {
      await db.query(
        'INSERT INTO student_submissions (resource_type, resource_id, resource_title, student_name, file_name, file_path) VALUES ($1,$2,$3,$4,$5,$6)',
        [resource_type, resource_id, resource_title, entry.student_name, entry.file_name, fileUrl]
      );
    } else {
      const submissions = readJson('student_submissions.json', []);
      submissions.unshift(entry);
      writeJson('student_submissions.json', submissions);
    }
    res.json({ success: true, message: 'Answer sheet submitted! Feedback in 48 hours.' });
  } catch (err) {
    console.error('[student-submit]', err);
    res.status(500).json({ error: 'Failed to log submission.' });
  }
});


// ============================================================
// ADMIN SECURE OPERATIONS (Protected by JWT)
// ============================================================

// GET /api/admin/mentor-requests
app.get('/api/admin/mentor-requests', auth, async (req, res) => {
  try {
    if (usingDb) {
      const r = await db.query('SELECT * FROM mentor_requests ORDER BY created_at DESC');
      return res.json(r.rows);
    }
    res.json(readJson('mentor_requests.json', []));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed.' }); }
});

// GET /api/admin/submissions
app.get('/api/admin/submissions', auth, async (req, res) => {
  try {
    if (usingDb) {
      const r = await db.query('SELECT * FROM student_submissions ORDER BY created_at DESC');
      return res.json(r.rows);
    }
    res.json(readJson('student_submissions.json', []));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed.' }); }
});

// GET /api/admin/notifications
app.get('/api/admin/notifications', auth, async (req, res) => {
  try {
    if (usingDb) {
      const r = await db.query('SELECT * FROM revision_notifications ORDER BY created_at DESC');
      return res.json(r.rows);
    }
    res.json(readJson('revision_notifications.json', []));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed.' }); }
});

// POST /api/admin/upload-test-sheet
app.post('/api/admin/upload-test-sheet', auth, upload.single('file'), async (req, res) => {
  const { type, board, class_num, title, subject, date_label, pages, color } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Please upload a PDF file.' });
  if (!type || !board || !class_num || !title || !subject)
    return res.status(400).json({ error: 'All required fields must be filled.' });

  const fileUrl = getFileUrl(req);
  const entry = {
    id: Date.now(), type, board, class_num: parseInt(class_num),
    title, subject, date_label: date_label || '', pages: parseInt(pages || 1),
    file_url: fileUrl, color: color || '#3A7BD5',
    created_at: new Date().toISOString()
  };

  try {
    if (usingDb) {
      await db.query(
        'INSERT INTO test_sheets (type, board, class_num, title, subject, date_label, pages, file_url, color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [type, board, entry.class_num, title, subject, entry.date_label, entry.pages, fileUrl, entry.color]
      );
    } else {
      const sheets = readJson('test_sheets.json', []);
      sheets.unshift(entry);
      writeJson('test_sheets.json', sheets);
    }
    res.json({ success: true, message: 'Test sheet uploaded successfully.' });
  } catch (err) {
    console.error('[upload-test-sheet]', err);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

// POST /api/admin/upload-chapter-resource
app.post('/api/admin/upload-chapter-resource', auth, upload.single('file'), async (req, res) => {
  const { board, class_num, subject, book_name, book_subtitle, book_color, chapter_num, chapter_title, resource_type, resource_title } = req.body;
  if (!req.file) return res.status(400).json({ error: 'Please upload a file.' });
  if (!board || !class_num || !subject || !book_name || !chapter_num || !chapter_title || !resource_type || !resource_title)
    return res.status(400).json({ error: 'All fields are required.' });

  const fileUrl = getFileUrl(req);

  try {
    if (usingDb) {
      // Full DB insert logic (same as before)
      let boardResult = await db.query('SELECT id FROM boards WHERE name = $1', [board]);
      let boardId = boardResult.rows[0]?.id;
      if (!boardId) {
        const ins = await db.query('INSERT INTO boards (name) VALUES ($1) RETURNING id', [board]);
        boardId = ins.rows[0].id;
      }
      let subjectResult = await db.query('SELECT id FROM subjects WHERE board_id=$1 AND class_num=$2 AND name=$3', [boardId, parseInt(class_num), subject]);
      let subjectId = subjectResult.rows[0]?.id;
      if (!subjectId) {
        const ins = await db.query('INSERT INTO subjects (board_id,class_num,name) VALUES ($1,$2,$3) RETURNING id', [boardId, parseInt(class_num), subject]);
        subjectId = ins.rows[0].id;
      }
      let bookResult = await db.query('SELECT id FROM books WHERE subject_id=$1 AND name=$2', [subjectId, book_name]);
      let bookId = bookResult.rows[0]?.id;
      if (!bookId) {
        const ins = await db.query('INSERT INTO books (subject_id,name,subtitle,color) VALUES ($1,$2,$3,$4) RETURNING id', [subjectId, book_name, book_subtitle || '', book_color || '#3A7BD5']);
        bookId = ins.rows[0].id;
      }
      let chapterResult = await db.query('SELECT id FROM chapters WHERE book_id=$1 AND num=$2', [bookId, parseInt(chapter_num)]);
      let chapterId = chapterResult.rows[0]?.id;
      if (!chapterId) {
        const ins = await db.query('INSERT INTO chapters (book_id,num,title) VALUES ($1,$2,$3) RETURNING id', [bookId, parseInt(chapter_num), chapter_title]);
        chapterId = ins.rows[0].id;
      }
      if (resource_type === 'Worksheet')
        await db.query('UPDATE chapters SET worksheets = worksheets + 1 WHERE id=$1', [chapterId]);

      await db.query('INSERT INTO chapter_resources (chapter_id,type,title,file_url) VALUES ($1,$2,$3,$4)', [chapterId, resource_type, resource_title, fileUrl]);
      invalidateCache();
    } else {
      // JSON file-based storage for uploaded chapter resources
      const resources = readJson('chapter_resources.json', []);
      resources.unshift({
        id: Date.now(), board, class_num: parseInt(class_num), subject,
        book_name, book_subtitle: book_subtitle || '', book_color: book_color || '#3A7BD5',
        chapter_num: parseInt(chapter_num), chapter_title,
        resource_type, resource_title, file_url: fileUrl,
        created_at: new Date().toISOString()
      });
      writeJson('chapter_resources.json', resources);
      invalidateCache();
    }

    res.json({ success: true, message: 'Chapter resource added successfully!' });
  } catch (err) {
    console.error('[upload-chapter-resource]', err);
    res.status(500).json({ error: 'Upload failed.' });
  }
});

// GET /api/admin/test-sheets — list all for admin table
app.get('/api/admin/test-sheets', auth, async (req, res) => {
  try {
    if (usingDb) {
      const r = await db.query('SELECT * FROM test_sheets ORDER BY created_at DESC');
      return res.json(r.rows);
    }
    res.json(readJson('test_sheets.json', []));
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed.' }); }
});

// DELETE /api/admin/test-sheet/:id
app.delete('/api/admin/test-sheet/:id', auth, async (req, res) => {
  const id = req.params.id;
  try {
    if (usingDb) {
      await db.query('DELETE FROM test_sheets WHERE id = $1', [id]);
    } else {
      const sheets = readJson('test_sheets.json', []);
      writeJson('test_sheets.json', sheets.filter(s => s.id.toString() !== id));
    }
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed.' }); }
});

// PATCH /api/admin/mentor-request/:id/status
app.patch('/api/admin/mentor-request/:id/status', auth, async (req, res) => {
  const { id }    = req.params;
  const { status } = req.body;
  try {
    if (usingDb) {
      await db.query('UPDATE mentor_requests SET status=$1 WHERE id=$2', [status, id]);
    } else {
      const requests = readJson('mentor_requests.json', []);
      const found = requests.find(r => r.id.toString() === id);
      if (found) { found.status = status; writeJson('mentor_requests.json', requests); }
    }
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed.' }); }
});

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  let dbStatus = 'not-configured';
  let dbError  = null;
  if (process.env.DATABASE_URL) {
    try {
      await db.query('SELECT 1');
      dbStatus = 'supabase-connected';
      usingDb = true;
    } catch(e) {
      dbStatus = 'supabase-error';
      dbError  = e.message;
      usingDb  = false;
    }
  } else {
    dbStatus = 'no-DATABASE_URL';
  }
  res.json({
    status:       'ok',
    db:           dbStatus,
    db_error:     dbError,
    fileStorage:  usingCloudinary ? 'cloudinary' : 'local-disk',
    ts:           new Date().toISOString()
  });
});

// ─── Catch-all: serve frontend ──────────────────────────────────────────────
app.get('*', (req, res) => {
  // Serve admin panel for /admin path
  if (req.path.startsWith('/admin')) {
    return res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`GyanLok Backend running at http://localhost:${PORT}`);
  console.log(`Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database:     ${usingDb ? 'Supabase PostgreSQL ✓' : 'JSON file storage'}`);
  console.log(`File Storage: ${usingCloudinary ? 'Cloudinary ✓' : 'Local disk (uploads/)'}`);
  console.log(`=========================================`);
});
