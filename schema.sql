-- ═══════════════════════════════════════════════════════════════
--  GyanLok Full Database Schema (matches server.js exactly)
-- ═══════════════════════════════════════════════════════════════

-- Drop existing tables if re-running
DROP TABLE IF EXISTS chapter_resources  CASCADE;
DROP TABLE IF EXISTS chapters           CASCADE;
DROP TABLE IF EXISTS books              CASCADE;
DROP TABLE IF EXISTS subject_resources  CASCADE;
DROP TABLE IF EXISTS subjects           CASCADE;
DROP TABLE IF EXISTS boards             CASCADE;
DROP TABLE IF EXISTS test_sheets        CASCADE;
DROP TABLE IF EXISTS student_submissions CASCADE;
DROP TABLE IF EXISTS mentor_requests    CASCADE;
DROP TABLE IF EXISTS revision_notifications CASCADE;
DROP TABLE IF EXISTS users              CASCADE;
DROP TABLE IF EXISTS announcements      CASCADE;
DROP TABLE IF EXISTS doubt_sessions     CASCADE;

-- 1. USERS
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(200),
  email         VARCHAR(200) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'student',
  class_num     INTEGER,
  board         VARCHAR(50),
  subject       VARCHAR(100),
  phone         VARCHAR(20),
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- 2. BOARDS
CREATE TABLE boards (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(20) UNIQUE NOT NULL   -- 'CBSE', 'ICSE'
);

-- 3. SUBJECTS
CREATE TABLE subjects (
  id        SERIAL PRIMARY KEY,
  board_id  INTEGER REFERENCES boards(id) ON DELETE CASCADE,
  class_num INTEGER NOT NULL,
  name      VARCHAR(100) NOT NULL,
  UNIQUE(board_id, class_num, name)
);

-- 4. SUBJECT_RESOURCES (syllabus, marking scheme per subject)
CREATE TABLE subject_resources (
  id         SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,    -- 'Syllabus', 'Marking Scheme'
  title      VARCHAR(300) NOT NULL,
  file_url   TEXT,
  is_new     BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. BOOKS
CREATE TABLE books (
  id         SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
  name       VARCHAR(200) NOT NULL,
  subtitle   VARCHAR(300),
  color      VARCHAR(20) DEFAULT '#3A7BD5',
  file_url   TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. CHAPTERS
CREATE TABLE chapters (
  id         SERIAL PRIMARY KEY,
  book_id    INTEGER REFERENCES books(id) ON DELETE CASCADE,
  num        INTEGER NOT NULL,
  title      VARCHAR(300) NOT NULL,
  worksheets INTEGER DEFAULT 0,
  file_url   TEXT,
  UNIQUE(book_id, num)
);

-- 7. CHAPTER_RESOURCES
CREATE TABLE chapter_resources (
  id         SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,    -- 'Worksheet', 'Summary', etc.
  title      VARCHAR(300),
  file_url   TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. TEST_SHEETS
CREATE TABLE test_sheets (
  id         SERIAL PRIMARY KEY,
  type       VARCHAR(50) NOT NULL,    -- 'UTP', 'Worksheets', 'MockExam'
  board      VARCHAR(20) NOT NULL,
  class_num  INTEGER NOT NULL,
  title      VARCHAR(300) NOT NULL,
  subject    VARCHAR(100) NOT NULL,
  date_label VARCHAR(50),
  pages      INTEGER DEFAULT 1,
  file_url   TEXT,
  color      VARCHAR(20) DEFAULT '#3A7BD5',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. STUDENT_SUBMISSIONS
CREATE TABLE student_submissions (
  id             SERIAL PRIMARY KEY,
  resource_type  VARCHAR(50),
  resource_id    VARCHAR(100),
  resource_title VARCHAR(300),
  student_name   VARCHAR(200),
  file_name      VARCHAR(300),
  file_path      TEXT,
  status         VARCHAR(30) DEFAULT 'pending',
  feedback       TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- 10. MENTOR_REQUESTS
CREATE TABLE mentor_requests (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  email_or_phone  VARCHAR(200) NOT NULL,
  student_class   VARCHAR(20),
  message         TEXT NOT NULL,
  status          VARCHAR(20) DEFAULT 'new',
  created_at      TIMESTAMP DEFAULT NOW()
);

-- 11. REVISION_NOTIFICATIONS
CREATE TABLE revision_notifications (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  contact    VARCHAR(200) NOT NULL,
  class_num  INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 12. ANNOUNCEMENTS
CREATE TABLE announcements (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(300) NOT NULL,
  content    TEXT NOT NULL,
  type       VARCHAR(20) DEFAULT 'info',
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. DOUBT_SESSIONS
CREATE TABLE doubt_sessions (
  id           SERIAL PRIMARY KEY,
  student_name VARCHAR(200),
  subject      VARCHAR(100),
  message      TEXT NOT NULL,
  reply        TEXT,
  status       VARCHAR(20) DEFAULT 'open',
  created_at   TIMESTAMP DEFAULT NOW(),
  replied_at   TIMESTAMP
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX idx_users_email          ON users(email);
CREATE INDEX idx_users_role           ON users(role);
CREATE INDEX idx_subjects_board_class ON subjects(board_id, class_num);
CREATE INDEX idx_chapters_book        ON chapters(book_id);
CREATE INDEX idx_test_sheets_board    ON test_sheets(board, class_num);
CREATE INDEX idx_submissions_student  ON student_submissions(student_name);
CREATE INDEX idx_mentor_requests_status ON mentor_requests(status);

-- ─── SEED: Boards ─────────────────────────────────────────────
INSERT INTO boards (name) VALUES ('CBSE') ON CONFLICT (name) DO NOTHING;
INSERT INTO boards (name) VALUES ('ICSE') ON CONFLICT (name) DO NOTHING;

-- ─── SEED: Admin user (password will be reset by server.js on startup) ────────
INSERT INTO users (name, email, password_hash, role)
VALUES ('Admin', 'ektaverma09.work@gmail.com', 'PLACEHOLDER', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ─── SEED: Announcement ───────────────────────────────────────
INSERT INTO announcements (title, content, type)
VALUES (
  'Welcome to GyanLok!',
  'Study materials for CBSE and ICSE Class 10 are now available. New chapters are added regularly!',
  'success'
);

SELECT 'GyanLok full schema created successfully!' AS status;
