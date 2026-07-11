const { pool } = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('Seeding database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Clear existing data (optional, but good for reset/re-seed)
    console.log('Clearing old data...');
    await client.query('TRUNCATE TABLE users, boards, subjects, subject_resources, books, chapters, chapter_resources, test_sheets, mentor_requests, student_submissions, revision_notifications CASCADE');

    // 2. Create Default Admin User
    console.log('Seeding admin user...');
    const adminEmail = 'admin@gyanlok.in';
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await client.query(
      `INSERT INTO users (email, password_hash, role) 
       VALUES ($1, $2, 'admin') 
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, passwordHash]
    );

    // 3. Seed Boards
    console.log('Seeding boards...');
    const boardIds = {};
    const boards = ['CBSE', 'ICSE'];
    for (const board of boards) {
      const res = await client.query(
        'INSERT INTO boards (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id',
        [board]
      );
      if (res.rows[0]) {
        boardIds[board] = res.rows[0].id;
      } else {
        const fetchRes = await client.query('SELECT id FROM boards WHERE name = $1', [board]);
        boardIds[board] = fetchRes.rows[0].id;
      }
    }

    // 4. Seed CBSE Class 10 Hindi and Science as starter data
    console.log('Seeding starter subjects...');
    // CBSE Class 10
    const cbseId = boardIds['CBSE'];
    
    // Add Science subject
    const sciSubRes = await client.query(
      'INSERT INTO subjects (board_id, class_num, name) VALUES ($1, 10, $2) RETURNING id',
      [cbseId, 'Science']
    );
    const scienceSubId = sciSubRes.rows[0].id;

    // Add Science Syllabus
    await client.query(
      'INSERT INTO subject_resources (subject_id, type, title, file_url, is_new) VALUES ($1, $2, $3, $4, $5)',
      [scienceSubId, 'Syllabus', 'Science Syllabus 2026–27', '/docs/science-syllabus.pdf', true]
    );
    // Add Science Marking Scheme
    await client.query(
      'INSERT INTO subject_resources (subject_id, type, title, file_url) VALUES ($1, $2, $3, $4)',
      [scienceSubId, 'Marking Scheme', 'Science Marking Scheme 2026', '/docs/science-marking.pdf']
    );

    // Add Science Book
    const sciBookRes = await client.query(
      'INSERT INTO books (subject_id, name, subtitle, color) VALUES ($1, $2, $3, $4) RETURNING id',
      [scienceSubId, 'Science', 'Class 10 Science — Physics, Chemistry & Biology (NCERT)', '#7EC8A4']
    );
    const sciBookId = sciBookRes.rows[0].id;

    // Add Science Chapters
    const scienceChapters = [
      { num: 1, title: 'Chemical Reactions and Equations' },
      { num: 2, title: 'Acids, Bases and Salts' },
      { num: 3, title: 'Metals and Non-metals' }
    ];
    for (const ch of scienceChapters) {
      const chRes = await client.query(
        'INSERT INTO chapters (book_id, num, title, worksheets) VALUES ($1, $2, $3, 2) RETURNING id',
        [sciBookId, ch.num, ch.title]
      );
      const chId = chRes.rows[0].id;
      
      // Add standard resources for this chapter
      await client.query(
        'INSERT INTO chapter_resources (chapter_id, type, title, file_url) VALUES ($1, $2, $3, $4)',
        [chId, 'Chapter PDF', `Chapter ${ch.num} - PDF`, `/docs/ch${ch.num}-textbook.pdf`]
      );
      await client.query(
        'INSERT INTO chapter_resources (chapter_id, type, title, file_url) VALUES ($1, $2, $3, $4)',
        [chId, 'Summary', `Chapter ${ch.num} - Summary & Objectives`, `/docs/ch${ch.num}-summary.pdf`]
      );
    }

    // 5. Seed Test Sheets Starter Data
    console.log('Seeding test sheets...');
    const testSheets = [
      {
        type: 'UTP',
        board: 'CBSE',
        class_num: 10,
        title: 'Unit Test Paper 1 — Science',
        subject: 'Science',
        date_label: 'Jan 2026',
        pages: 4,
        file_url: '/docs/utp-cbse-10-sci-1.pdf',
        color: '#7EC8A4'
      },
      {
        type: 'Worksheets',
        board: 'CBSE',
        class_num: 10,
        title: 'Worksheet 1 — Trigonometry',
        subject: 'Mathematics',
        date_label: 'Jan 2026',
        pages: 2,
        file_url: '/docs/ws-cbse-10-math-1.pdf',
        color: '#E05555'
      }
    ];

    for (const test of testSheets) {
      await client.query(
        `INSERT INTO test_sheets (type, board, class_num, title, subject, date_label, pages, file_url, color) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [test.type, test.board, test.class_num, test.title, test.subject, test.date_label, test.pages, test.file_url, test.color]
      );
    }

    await client.query('COMMIT');
    console.log('Seeding completed successfully!');
    console.log('---------------------------------');
    console.log('Admin account created:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('---------------------------------');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during seeding:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
