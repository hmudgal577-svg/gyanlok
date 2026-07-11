-- Enable uuid-ossp extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Admin auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Boards Table
CREATE TABLE IF NOT EXISTS boards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL -- 'CBSE', 'ICSE'
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    board_id INT REFERENCES boards(id) ON DELETE CASCADE,
    class_num INT NOT NULL, -- 6, 7, 8, 9, 10
    name VARCHAR(100) NOT NULL, -- 'Mathematics', 'Science', etc.
    UNIQUE (board_id, class_num, name)
);

-- 4. Syllabus & Marking Scheme (Resources directly linked to a subject)
CREATE TABLE IF NOT EXISTS subject_resources (
    id SERIAL PRIMARY KEY,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'Syllabus', 'Marking Scheme'
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL, -- Path to file
    is_new BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Books Table
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    color VARCHAR(20) DEFAULT '#3A7BD5',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Chapters Table
CREATE TABLE IF NOT EXISTS chapters (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books(id) ON DELETE CASCADE,
    num INT NOT NULL, -- Chapter number
    title VARCHAR(255) NOT NULL,
    worksheets INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (book_id, num)
);

-- 7. Chapter Resources (Files like Chapter PDF, Summary, Q&A, worksheets)
CREATE TABLE IF NOT EXISTS chapter_resources (
    id SERIAL PRIMARY KEY,
    chapter_id INT REFERENCES chapters(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL, -- 'Chapter PDF', 'Summary', 'Word Meanings', 'Q&A', 'Practice Questions', 'PYQ', 'Worksheet'
    title VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL, -- Local path or link
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Test Sheets (UTP, Worksheets, Mock Exam)
CREATE TABLE IF NOT EXISTS test_sheets (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'UTP', 'Worksheets', 'MockExam'
    board VARCHAR(20) NOT NULL, -- 'CBSE', 'ICSE'
    class_num INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    date_label VARCHAR(50), -- e.g. 'Jan 2026'
    pages INT DEFAULT 1,
    file_url VARCHAR(500) NOT NULL,
    color VARCHAR(20) DEFAULT '#3A7BD5',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Mentor Requests (Student questions/messages)
CREATE TABLE IF NOT EXISTS mentor_requests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email_or_phone VARCHAR(255) NOT NULL,
    student_class VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Student Submissions (Uploaded worksheets/tests for evaluation)
CREATE TABLE IF NOT EXISTS student_submissions (
    id SERIAL PRIMARY KEY,
    resource_type VARCHAR(50) NOT NULL, -- 'worksheet', 'test_sheet'
    resource_id VARCHAR(100) NOT NULL, -- e.g., 'WS_CBSE_10_01' or chapter res ID
    resource_title VARCHAR(255) NOT NULL, -- e.g., 'Worksheet 1 - Trigonometry'
    student_name VARCHAR(255) DEFAULT 'Anonymous',
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' NOT NULL, -- 'Pending', 'Evaluated'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Revision Class Notifications (Newsletter sign-ups)
CREATE TABLE IF NOT EXISTS revision_notifications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    class_num INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
