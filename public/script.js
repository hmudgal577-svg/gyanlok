/**
 * GyanLok — script.js (v2)
 *
 * Sections:
 *  1.  DATA — School Boards (CBSE/ICSE, classes, subjects, books, chapters)
 *  2.  DATA — Test Sheets (UTP, Worksheets, Mock Exam)
 *  3.  SVGS & HELPERS
 *  4.  NAVBAR (hamburger, dropdown, scroll shadow, active link)
 *  5.  FADE-IN (IntersectionObserver)
 *  6.  SCHOOL BOARDS — render logic
 *  7.  TEST SHEETS — render logic
 *  8.  CONTACT FORM — validation
 *  9.  REVISION NOTIFY FORM
 * 10.  DOCUMENT VIEWER MODAL
 * 11.  UPLOAD ANSWER SHEET MODAL
 * 12.  SCROLL-TO-TOP BUTTON
 * 13.  TOAST HELPER
 */

/* ══════════════════════════════════════════
   1. DATA — SCHOOL BOARDS
══════════════════════════════════════════ */
const BOARDS_DATA = {
  CBSE: {
    classes: [6, 7, 8, 9, 10],
    subjectsByClass: {
      6:  ['Hindi', 'Mathematics', 'Science', 'Social Science', 'English', 'Sanskrit'],
      7:  ['Hindi', 'Mathematics', 'Science', 'Social Science', 'English', 'Sanskrit'],
      8:  ['Hindi', 'Mathematics', 'Science', 'Social Science', 'English', 'Sanskrit'],
      9:  ['Hindi', 'Mathematics', 'Science', 'Social Science', 'English', 'Sanskrit'],
      10: ['Hindi', 'Mathematics', 'Science', 'Social Science', 'English'],
    },
    resources: {
      10: {
        Hindi: {
          syllabus:      { title: 'Hindi B Syllabus 2026–27', file_url: '/pdf/cbse/class10/hindi/class_10_hindi_syllabus_cbse.pdf', isNew: true },
          markingScheme: { title: 'Hindi B Marking Scheme 2026', file_url: '/pdf/cbse/class10/hindi/class_10_hindi_marking_schema_cbse.pdf' },
          books: [
            {
              name: 'स्पर्श (भाग-2)',
              subtitle: 'कक्षा 10 हिंदी (कोर्स बी) — मुख्य पाठ्यपुस्तक (NCERT)',
              color: '#3A7BD5',
              file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_complete_book.pdf',
              chapters: [
                { num: 1,  title: 'कबीर — साखी', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_1.pdf' },
                { num: 2,  title: 'मीरा — पद', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_2.pdf' },
                { num: 3,  title: 'मैथिलीशरण गुप्त — मनुष्यता', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_3.pdf' },
                { num: 4,  title: 'सुमित्रानंदन पंत — पर्वत प्रदेश में पावस', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_4.pdf' },
                { num: 5,  title: 'वीरेन डंगवाल — तोप', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_5.pdf' },
                { num: 6,  title: 'कैफ़ी आज़मी — कर चले हम फ़िदा', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_6.pdf' },
                { num: 7,  title: 'रवींद्रनाथ ठाकुर — आत्मत्राण', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_7.pdf' },
                { num: 8,  title: 'प्रेमचंद — बड़े भाई साहब', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_8.pdf' },
                { num: 9,  title: 'सीताराम सेकसरिया — डायरी का एक पन्ना', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_9.pdf' },
                { num: 10, title: 'लीलाधर मंडलोई — तताँरा-वामीरो कथा', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_10.pdf' },
                { num: 11, title: 'प्रहलाद अग्रवाल — तीसरी कसम के शिल्पकार शैलेंद्र', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_11.pdf' },
                { num: 12, title: 'निदा फ़ाज़ली — अब कहाँ दूसरे के दुख से दुखी होने वाले', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_12.pdf' },
                { num: 13, title: 'रवींद्र केलेकर — पतझर में टूटी पत्तियाँ (गिन्नी का सोना / झेन की देन)', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_13.pdf' },
                { num: 14, title: 'हबीब तनवीर — कारतूस (एकांकी)', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sparsh_hindi_chapter_14.pdf' },
              ]
            },
            {
              name: 'संचयन (भाग-2)',
              subtitle: 'कक्षा 10 हिंदी (कोर्स बी) — पूरक पाठ्यपुस्तक (NCERT)',
              color: '#2BA899',
              file_url: '/pdf/cbse/class10/hindi/class_10_hindi_book_complete_sanchayan.pdf',
              chapters: [
                { num: 1, title: 'मिथिलेश्वर — हरिहर काका', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sanchayan_hindi_chapter_1.pdf' },
                { num: 2, title: 'गुरदयाल सिंह — सपनों के-से दिन', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sanchayan_hindi_chapter_2.pdf' },
                { num: 3, title: 'राही मासूम रज़ा — टोपी शुक्ला', worksheets: 2, file_url: '/pdf/cbse/class10/hindi/class_10_sanchayan_hindi_chapter_3.pdf' },
              ]
            }
          ]
        },
        Mathematics: {
          syllabus:      { title: 'Mathematics Syllabus 2026–27', isNew: true },
          markingScheme: { title: 'Mathematics Marking Scheme 2026' },
          books: [
            {
              name: 'Mathematics — Standard',
              subtitle: 'Class 10 Mathematics (NCERT)',
              color: '#E05555',
              chapters: [
                { num: 1,  title: 'Real Numbers',                                       worksheets: 2 },
                { num: 2,  title: 'Polynomials',                                        worksheets: 2 },
                { num: 3,  title: 'Pair of Linear Equations in Two Variables',          worksheets: 2 },
                { num: 4,  title: 'Quadratic Equations',                               worksheets: 2 },
                { num: 5,  title: 'Arithmetic Progressions',                           worksheets: 2 },
                { num: 6,  title: 'Triangles',                                         worksheets: 1 },
                { num: 7,  title: 'Coordinate Geometry',                               worksheets: 2 },
                { num: 8,  title: 'Introduction to Trigonometry',                      worksheets: 2 },
                { num: 9,  title: 'Some Applications of Trigonometry',                 worksheets: 1 },
                { num: 10, title: 'Circles',                                           worksheets: 1 },
                { num: 11, title: 'Areas Related to Circles',                          worksheets: 1 },
                { num: 12, title: 'Surface Areas and Volumes',                         worksheets: 2 },
                { num: 13, title: 'Statistics',                                        worksheets: 2 },
                { num: 14, title: 'Probability',                                       worksheets: 1 },
              ]
            }
          ]
        },
        Science: {
          syllabus:      { title: 'Science Syllabus 2026–27', isNew: true },
          markingScheme: { title: 'Science Marking Scheme 2026' },
          books: [
            {
              name: 'Science',
              subtitle: 'Class 10 Science — Physics, Chemistry & Biology (NCERT)',
              color: '#7EC8A4',
              chapters: [
                { num: 1,  title: 'Chemical Reactions and Equations',          worksheets: 2 },
                { num: 2,  title: 'Acids, Bases and Salts',                   worksheets: 2 },
                { num: 3,  title: 'Metals and Non-metals',                     worksheets: 2 },
                { num: 4,  title: 'Carbon and its Compounds',                  worksheets: 2 },
                { num: 6,  title: 'Life Processes',                            worksheets: 2 },
                { num: 7,  title: 'Control and Coordination',                  worksheets: 2 },
                { num: 8,  title: 'How do Organisms Reproduce?',               worksheets: 1 },
                { num: 9,  title: 'Heredity',                                  worksheets: 1 },
                { num: 10, title: 'Light — Reflection and Refraction',         worksheets: 2 },
                { num: 11, title: 'Human Eye and the Colourful World',         worksheets: 1 },
                { num: 12, title: 'Electricity',                               worksheets: 2 },
                { num: 13, title: 'Magnetic Effects of Electric Current',      worksheets: 2 },
                { num: 14, title: 'Sources of Energy',                         worksheets: 1 },
                { num: 15, title: 'Our Environment',                           worksheets: 1 },
              ]
            }
          ]
        },
        'Social Science': {
          syllabus:      { title: 'Social Science Syllabus 2026–27', isNew: true },
          markingScheme: { title: 'Social Science Marking Scheme 2026' },
          books: [
            {
              name: 'India and the Contemporary World — II (History)',
              subtitle: 'Class 10 History',
              color: '#9B59B6',
              chapters: [
                { num: 1, title: 'The Rise of Nationalism in Europe',         worksheets: 2 },
                { num: 2, title: 'Nationalism in India',                      worksheets: 2 },
                { num: 3, title: 'The Making of a Global World',              worksheets: 1 },
                { num: 4, title: 'The Age of Industrialisation',              worksheets: 1 },
                { num: 5, title: 'Print Culture and the Modern World',        worksheets: 1 },
              ]
            },
            {
              name: 'Contemporary India — II (Geography)',
              subtitle: 'Class 10 Geography',
              color: '#27AE60',
              chapters: [
                { num: 1, title: 'Resources and Development',                 worksheets: 2 },
                { num: 2, title: 'Forest and Wildlife Resources',             worksheets: 1 },
                { num: 3, title: 'Water Resources',                           worksheets: 2 },
                { num: 4, title: 'Agriculture',                               worksheets: 2 },
                { num: 5, title: 'Minerals and Energy Resources',             worksheets: 1 },
                { num: 6, title: 'Manufacturing Industries',                  worksheets: 1 },
                { num: 7, title: 'Lifelines of National Economy',             worksheets: 1 },
              ]
            }
          ]
        },
        English: {
          syllabus:      { title: 'English Syllabus 2026–27', isNew: true },
          markingScheme: { title: 'English Marking Scheme 2026' },
          books: [
            {
              name: 'First Flight',
              subtitle: 'Class 10 English — Main Textbook',
              color: '#F5A623',
              chapters: [
                { num: 1,  title: 'A Letter to God',                          worksheets: 2 },
                { num: 2,  title: 'Nelson Mandela: Long Walk to Freedom',     worksheets: 2 },
                { num: 3,  title: 'Two Stories About Flying',                 worksheets: 1 },
                { num: 4,  title: 'From the Diary of Anne Frank',             worksheets: 2 },
                { num: 5,  title: 'The Hundred Dresses — I',                  worksheets: 1 },
                { num: 6,  title: 'The Hundred Dresses — II',                 worksheets: 1 },
                { num: 7,  title: 'Glimpses of India',                        worksheets: 1 },
                { num: 8,  title: 'Mijbil the Otter',                         worksheets: 1 },
                { num: 9,  title: 'Madam Rides the Bus',                      worksheets: 1 },
                { num: 10, title: 'The Sermon at Benares',                    worksheets: 1 },
                { num: 11, title: 'The Proposal',                             worksheets: 2 },
              ]
            },
            {
              name: 'Footprints Without Feet',
              subtitle: 'Class 10 English — Supplementary Reader',
              color: '#E8900A',
              chapters: [
                { num: 1,  title: 'A Triumph of Surgery',                     worksheets: 1 },
                { num: 2,  title: "The Thief's Story",                        worksheets: 1 },
                { num: 3,  title: 'The Midnight Visitor',                     worksheets: 1 },
                { num: 4,  title: 'A Question of Trust',                      worksheets: 1 },
                { num: 5,  title: 'Footprints Without Feet',                  worksheets: 2 },
                { num: 6,  title: 'The Making of a Scientist',                worksheets: 1 },
                { num: 7,  title: 'The Necklace',                             worksheets: 2 },
                { num: 8,  title: 'The Hack Driver',                          worksheets: 1 },
                { num: 9,  title: 'Bholi',                                    worksheets: 2 },
                { num: 10, title: 'The Book That Saved the Earth',            worksheets: 1 },
              ]
            }
          ]
        }
      }
    }
  },

  ICSE: {
    classes: [6, 7, 8, 9, 10],
    subjectsByClass: {
      6:  ['English', 'Mathematics', 'Science', 'History & Civics', 'Geography', 'Hindi'],
      7:  ['English', 'Mathematics', 'Science', 'History & Civics', 'Geography', 'Hindi'],
      8:  ['English', 'Mathematics', 'Science', 'History & Civics', 'Geography', 'Hindi'],
      9:  ['Hindi', 'English Language', 'English Literature', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History & Civics', 'Geography'],
      10: ['Hindi', 'English Language', 'English Literature', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'History & Civics', 'Geography'],
    },
    resources: {
      10: {
        Mathematics: {
          syllabus:      { title: 'ICSE Mathematics Syllabus 2026–27', isNew: true },
          markingScheme: { title: 'ICSE Mathematics Marking Scheme 2026' },
          books: [
            {
              name: 'ICSE Mathematics (Selina / Frank)',
              subtitle: 'Class 10 ICSE Mathematics',
              color: '#E05555',
              chapters: [
                { num: 1, title: 'Commercial Mathematics — GST, Shares, Compound Interest',  worksheets: 2 },
                { num: 2, title: 'Algebra — Polynomials, Quadratic Equations',               worksheets: 2 },
                { num: 3, title: 'Geometry — Similarity, Loci, Tangents to Circles',         worksheets: 2 },
                { num: 4, title: 'Mensuration — Cylinder, Cone, Sphere',                     worksheets: 2 },
                { num: 5, title: 'Trigonometry',                                             worksheets: 2 },
                { num: 6, title: 'Statistics — Mean, Median, Ogive, Histogram',              worksheets: 2 },
                { num: 7, title: 'Probability',                                              worksheets: 1 },
              ]
            }
          ]
        },
        Physics: {
          syllabus:      { title: 'ICSE Physics Syllabus 2026–27', isNew: true },
          markingScheme: { title: 'ICSE Physics Marking Scheme 2026' },
          books: [
            {
              name: 'ICSE Physics (Selina)',
              subtitle: 'Class 10 ICSE Physics',
              color: '#3A7BD5',
              chapters: [
                { num: 1, title: 'Force, Work, Power and Energy',             worksheets: 2 },
                { num: 2, title: 'Light — Refraction and Lenses',             worksheets: 2 },
                { num: 3, title: 'Sound',                                     worksheets: 1 },
                { num: 4, title: 'Electricity and Magnetism',                 worksheets: 2 },
                { num: 5, title: 'Heat',                                      worksheets: 1 },
                { num: 6, title: 'Modern Physics (Radioactivity)',            worksheets: 1 },
              ]
            }
          ]
        },
        Chemistry: {
          syllabus:      { title: 'ICSE Chemistry Syllabus 2026–27', isNew: true },
          markingScheme: { title: 'ICSE Chemistry Marking Scheme 2026' },
          books: [
            {
              name: 'ICSE Chemistry (Selina)',
              subtitle: 'Class 10 ICSE Chemistry',
              color: '#7EC8A4',
              chapters: [
                { num: 1, title: 'Periodic Table',                            worksheets: 2 },
                { num: 2, title: 'Chemical Bonding',                          worksheets: 2 },
                { num: 3, title: 'Acids, Bases and Salts',                   worksheets: 2 },
                { num: 4, title: 'Analytical Chemistry',                      worksheets: 1 },
                { num: 5, title: 'Mole Concept and Stoichiometry',            worksheets: 2 },
                { num: 6, title: 'Electrolysis',                              worksheets: 2 },
                { num: 7, title: 'Metallurgy',                                worksheets: 1 },
                { num: 8, title: 'Organic Chemistry',                         worksheets: 2 },
              ]
            }
          ]
        },
        Hindi: {
          syllabus:      { title: 'ICSE Hindi Syllabus 2026–27', isNew: true },
          markingScheme: { title: 'ICSE Hindi Marking Scheme 2026' },
          books: [
            {
              name: 'साहित्य सागर — गद्य (Prose)',
              subtitle: 'Class 10 ICSE Hindi — Gadya Khand | 10 Kahaniyaan',
              color: '#9B59B6',
              chapters: [
                { num: 1,  title: 'बात अठन्नी की',         worksheets: 2 },
                { num: 2,  title: 'काकी',                   worksheets: 2 },
                { num: 3,  title: 'महायज्ञ का पुरस्कार',    worksheets: 2 },
                { num: 4,  title: 'नेताजी का चश्मा',        worksheets: 2 },
                { num: 5,  title: 'अपना-अपना भाग्य',        worksheets: 2 },
                { num: 6,  title: 'बड़े घर की बेटी',        worksheets: 2 },
                { num: 7,  title: 'संदेह',                  worksheets: 1 },
                { num: 8,  title: 'भीड़ में खोया आदमी',     worksheets: 2 },
                { num: 9,  title: 'भेड़ें और भेड़िए',       worksheets: 1 },
                { num: 10, title: 'दो कलाकार',              worksheets: 2 },
              ]
            },
            {
              name: 'साहित्य सागर — पद्य (Poetry)',
              subtitle: 'Class 10 ICSE Hindi — Padya Khand | 9 Kavitaen',
              color: '#E8900A',
              chapters: [
                { num: 1, title: 'साखी',                    worksheets: 2 },
                { num: 2, title: 'कुंडलियाँ',               worksheets: 2 },
                { num: 3, title: 'स्वर्ग बना सकते हैं',     worksheets: 2 },
                { num: 4, title: 'वह मातृभूमि मेरी',        worksheets: 2 },
                { num: 5, title: 'मेघ आए',                  worksheets: 1 },
                { num: 6, title: 'सूरदास के पद',            worksheets: 2 },
                { num: 7, title: 'विनय के पद',               worksheets: 2 },
                { num: 8, title: 'भिक्षुक',                 worksheets: 1 },
                { num: 9, title: 'चलना हमारा काम है',        worksheets: 2 },
              ]
            },
            {
              name: 'एकांकी संचय',
              subtitle: 'Class 10 ICSE Hindi — Ekanki | 6 One-Act Plays',
              color: '#2BA899',
              chapters: [
                { num: 1, title: 'संस्कार और भावना',        worksheets: 2 },
                { num: 2, title: 'बहू की विदा',             worksheets: 2 },
                { num: 3, title: 'मातृभूमि का मान',         worksheets: 2 },
                { num: 4, title: 'सूखी डाली',               worksheets: 2 },
                { num: 5, title: 'महाभारत की एक साँझ',      worksheets: 2 },
                { num: 6, title: 'दीपदान',                  worksheets: 2 },
              ]
            },
            {
              name: 'नया रास्ता (उपन्यास)',
              subtitle: 'Class 10 ICSE Hindi — Novel | अध्याय क्रमवार (Publisher: Evergreen / Morning Star)',
              color: '#E05555',
              chapters: [
                { num: 1, title: 'अध्याय 1', worksheets: 1 },
                { num: 2, title: 'अध्याय 2', worksheets: 1 },
                { num: 3, title: 'अध्याय 3', worksheets: 1 },
                { num: 4, title: 'अध्याय 4', worksheets: 1 },
                { num: 5, title: 'अध्याय 5', worksheets: 1 },
                { num: 6, title: 'अध्याय 6', worksheets: 1 },
                { num: 7, title: 'अध्याय 7', worksheets: 1 },
                { num: 8, title: 'अध्याय 8', worksheets: 1 },
              ]
            }
          ]
        }
      }
    }
  }
};

/* ══════════════════════════════════════════
   2. DATA — TEST SHEETS
══════════════════════════════════════════ */
const TEST_DATA = {
  UTP: {
    CBSE: {
      10: [
        { id: 'UTP_CBSE_10_01', title: 'Unit Test Paper 1 — Science',       subject: 'Science',       date: 'Jan 2026', pages: 4, color: '#7EC8A4' },
        { id: 'UTP_CBSE_10_02', title: 'Unit Test Paper 2 — Mathematics',   subject: 'Mathematics',   date: 'Mar 2026', pages: 4, color: '#E05555' },
        { id: 'UTP_CBSE_10_03', title: 'Unit Test Paper 3 — Social Science',subject: 'Social Science',date: 'May 2026', pages: 3, color: '#9B59B6' },
        { id: 'UTP_CBSE_10_04', title: 'Unit Test Paper 4 — Hindi',         subject: 'Hindi',         date: 'Jun 2026', pages: 3, color: '#3A7BD5' },
      ],
      9: [
        { id: 'UTP_CBSE_09_01', title: 'Unit Test Paper 1 — Science',       subject: 'Science',       date: 'Feb 2026', pages: 4, color: '#7EC8A4' },
        { id: 'UTP_CBSE_09_02', title: 'Unit Test Paper 2 — Mathematics',   subject: 'Mathematics',   date: 'Apr 2026', pages: 4, color: '#E05555' },
      ],
      8: [
        { id: 'UTP_CBSE_08_01', title: 'Unit Test Paper 1 — Mathematics',   subject: 'Mathematics',   date: 'Feb 2026', pages: 3, color: '#E05555' },
      ],
      7: [],
      6: [],
    },
    ICSE: {
      10: [
        { id: 'UTP_ICSE_10_01', title: 'Unit Test Paper 1 — Mathematics',   subject: 'Mathematics',   date: 'Feb 2026', pages: 4, color: '#E05555' },
        { id: 'UTP_ICSE_10_02', title: 'Unit Test Paper 2 — Physics',       subject: 'Physics',       date: 'Apr 2026', pages: 4, color: '#3A7BD5' },
        { id: 'UTP_ICSE_10_03', title: 'Unit Test Paper 3 — Chemistry',     subject: 'Chemistry',     date: 'Jun 2026', pages: 3, color: '#7EC8A4' },
      ],
      9: [
        { id: 'UTP_ICSE_09_01', title: 'Unit Test Paper 1 — Mathematics',   subject: 'Mathematics',   date: 'Mar 2026', pages: 4, color: '#E05555' },
      ],
      8: [], 7: [], 6: [],
    }
  },
  Worksheets: {
    CBSE: {
      10: [
        { id: 'WS_CBSE_10_01', title: 'Worksheet 1 — Trigonometry',          subject: 'Mathematics', date: 'Jan 2026', pages: 2, color: '#E05555' },
        { id: 'WS_CBSE_10_02', title: 'Worksheet 2 — Chemical Reactions',    subject: 'Science',     date: 'Feb 2026', pages: 3, color: '#7EC8A4' },
        { id: 'WS_CBSE_10_03', title: 'Worksheet 3 — Hindi Grammar',         subject: 'Hindi',       date: 'Mar 2026', pages: 2, color: '#3A7BD5' },
        { id: 'WS_CBSE_10_04', title: 'Worksheet 4 — Electricity',           subject: 'Science',     date: 'Apr 2026', pages: 2, color: '#7EC8A4' },
      ],
      9: [
        { id: 'WS_CBSE_09_01', title: 'Worksheet 1 — Algebra',               subject: 'Mathematics', date: 'Feb 2026', pages: 2, color: '#E05555' },
        { id: 'WS_CBSE_09_02', title: 'Worksheet 2 — Force & Motion',        subject: 'Science',     date: 'Mar 2026', pages: 2, color: '#7EC8A4' },
      ],
      8: [
        { id: 'WS_CBSE_08_01', title: 'Worksheet 1 — Rational Numbers',      subject: 'Mathematics', date: 'Jan 2026', pages: 2, color: '#E05555' },
      ],
      7: [], 6: [],
    },
    ICSE: {
      10: [
        { id: 'WS_ICSE_10_01', title: 'Worksheet 1 — Commercial Maths',      subject: 'Mathematics', date: 'Jan 2026', pages: 3, color: '#E05555' },
        { id: 'WS_ICSE_10_02', title: 'Worksheet 2 — Light (Refraction)',     subject: 'Physics',     date: 'Mar 2026', pages: 2, color: '#3A7BD5' },
      ],
      9: [
        { id: 'WS_ICSE_09_01', title: 'Worksheet 1 — Algebra',               subject: 'Mathematics', date: 'Feb 2026', pages: 2, color: '#E05555' },
      ],
      8: [], 7: [], 6: [],
    }
  },
  MockExam: {
    CBSE: {
      10: [
        { id: 'MOCK_CBSE_10_01', title: 'Mock Exam 1 — Science (Full Paper)',    subject: 'Science',     date: 'Nov 2025', pages: 8, color: '#7EC8A4' },
        { id: 'MOCK_CBSE_10_02', title: 'Mock Exam 2 — Mathematics (Full Paper)',subject: 'Mathematics', date: 'Dec 2025', pages: 7, color: '#E05555' },
        { id: 'MOCK_CBSE_10_03', title: 'Mock Exam 3 — Hindi (Full Paper)',      subject: 'Hindi',       date: 'Dec 2025', pages: 5, color: '#3A7BD5' },
      ],
      9: [
        { id: 'MOCK_CBSE_09_01', title: 'Mock Exam 1 — Annual Paper (All Subjects)', subject: 'All Subjects', date: 'Oct 2025', pages: 10, color: '#9B59B6' },
      ],
      8: [], 7: [], 6: [],
    },
    ICSE: {
      10: [
        { id: 'MOCK_ICSE_10_01', title: 'Mock Exam 1 — Mathematics (Full Paper)', subject: 'Mathematics', date: 'Dec 2025', pages: 7, color: '#E05555' },
        { id: 'MOCK_ICSE_10_02', title: 'Mock Exam 2 — Physics (Full Paper)',      subject: 'Physics',     date: 'Dec 2025', pages: 6, color: '#3A7BD5' },
      ],
      9: [], 8: [], 7: [], 6: [],
    }
  }
};

/* ══════════════════════════════════════════
   3. SVG HELPERS
══════════════════════════════════════════ */
const SVG = {
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  pencil:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  star:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  dl:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  up:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  eye:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  send:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  chevD: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`,
};

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let state = {
  board: 'CBSE',
  cls:   10,
  subj:  'Hindi',
  testType: 'UTP',
  testBoard: 'CBSE',
};

/* ══════════════════════════════════════════
   DOM READY
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initFadeIn();
  initBoardsSection();
  initTestSheets();
  initContactForm();
  initRevisionNotify();
  initDocModal();
  initUploadModal();
  initScrollTop();
});

/* ══════════════════════════════════════════
   4. NAVBAR
══════════════════════════════════════════ */
function initNavbar() {
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('nav-links');
  const navEl      = document.getElementById('navbar');
  const boardsTrig = document.getElementById('boards-trigger');
  const boardsDrop = document.getElementById('boards-dropdown');
  const boardsWrap = boardsTrig ? boardsTrig.closest('.nav-dropdown-wrapper') : null;

  /* Hamburger toggle */
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  /* Close nav on link click */
  navLinks.querySelectorAll('a.nav-link, a.dropdown-item').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* School Boards dropdown */
  if (boardsTrig && boardsWrap) {
    boardsTrig.addEventListener('click', (e) => {
      e.stopPropagation();
      boardsWrap.classList.toggle('open');
      const isOpen = boardsWrap.classList.contains('open');
      boardsTrig.setAttribute('aria-expanded', String(isOpen));
    });

    /* Dropdown item click: pre-select board and scroll */
    boardsDrop.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const board = item.dataset.board;
        if (board) selectBoard(board);
        boardsWrap.classList.remove('open');
      });
    });
  }

  /* Close dropdown/nav on outside click */
  document.addEventListener('click', (e) => {
    if (boardsWrap && !boardsWrap.contains(e.target)) boardsWrap.classList.remove('open');
    if (!navEl.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* Scroll shadow */
  const onScroll = () => navEl.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Active nav link on scroll */
  const sections   = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link[href^="#"]');
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(l => {
          l.classList.remove('active');
          if (l.getAttribute('href') === `#${entry.target.id}`) l.classList.add('active');
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => secObs.observe(s));
}

/* ══════════════════════════════════════════
   5. FADE-IN
══════════════════════════════════════════ */
let fadeObserver;
function initFadeIn() {
  fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sibs = [...entry.target.parentElement.children].filter(c => c.classList.contains('fade-in'));
        const idx  = sibs.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 70}ms`;
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));
}

function observeFade(el) {
  if (fadeObserver) fadeObserver.observe(el);
  else el.classList.add('visible');
}

/* ══════════════════════════════════════════
   6. SCHOOL BOARDS SECTION
══════════════════════════════════════════ */
function initBoardsSection() {
  /* Board tab clicks */
  document.querySelectorAll('.board-tab').forEach(tab => {
    tab.addEventListener('click', () => selectBoard(tab.dataset.board));
  });
  renderClassPills();
  renderSubjectPills();
  renderBoardContent();
}

function selectBoard(board) {
  state.board = board;
  state.cls   = BOARDS_DATA[board].classes[BOARDS_DATA[board].classes.length - 1]; // default to highest class
  document.querySelectorAll('.board-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.board === board);
    t.setAttribute('aria-selected', String(t.dataset.board === board));
  });
  renderClassPills();
  renderSubjectPills();
  renderBoardContent();
}

function renderClassPills() {
  const container = document.getElementById('class-pills');
  if (!container) return;
  const classes = BOARDS_DATA[state.board].classes;
  // default state.cls to first available for this board
  if (!classes.includes(state.cls)) state.cls = classes[classes.length - 1];
  container.innerHTML = classes.map(c => `
    <button class="class-pill${c === state.cls ? ' active' : ''}" data-class="${c}">Class ${c}</button>
  `).join('');
  container.querySelectorAll('.class-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      state.cls = parseInt(pill.dataset.class);
      renderClassPills();
      renderSubjectPills();
      renderBoardContent();
    });
  });
}

function renderSubjectPills() {
  const container = document.getElementById('subject-pills');
  if (!container) return;
  const subjects = BOARDS_DATA[state.board].subjectsByClass[state.cls] || [];
  // reset subject if not in new list
  if (!subjects.includes(state.subj)) state.subj = subjects[0] || '';
  container.innerHTML = subjects.map(s => `
    <button class="subject-pill${s === state.subj ? ' active' : ''}" data-subject="${s}">${s}</button>
  `).join('');
  container.querySelectorAll('.subject-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      state.subj = pill.dataset.subject;
      renderSubjectPills();
      renderBoardContent();
    });
  });
}

function renderBoardContent() {
  const panel = document.getElementById('board-content');
  if (!panel) return;

  const boardRes = BOARDS_DATA[state.board].resources;
  const clsRes   = boardRes && boardRes[state.cls];
  const subjRes  = clsRes && clsRes[state.subj];

  if (!subjRes) {
    panel.innerHTML = `
      <div class="resources-coming-soon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" stroke-width="1.5" stroke-linecap="round" style="margin:0 auto var(--sp-sm)" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>${state.subj} — Class ${state.cls} (${state.board})</h3>
        <p>Resources for this subject are being prepared and will be available soon.<br/>
        <a href="#contact" style="color:var(--accent);font-weight:600">Contact a mentor</a> for study material in the meantime.</p>
      </div>`;
    return;
  }

  const { syllabus, markingScheme, books } = subjRes;
  let html = '';

  /* Syllabus + Marking Scheme row */
  html += `<div class="resource-row">`;
  if (syllabus) {
    html += `
      <div class="resource-card" role="button" tabindex="0" onclick="openDocViewer('${syllabus.title}', '${syllabus.file_url || ''}')">
        <div class="rc-icon" style="background:#3A7BD5">${SVG.file}</div>
        <div class="rc-info">
          <strong>${syllabus.title} ${syllabus.isNew ? '<span class="new-badge">New</span>' : ''}</strong>
          <span>Official Syllabus | PDF</span>
        </div>
        <div class="rc-actions">
          <button class="rc-btn" title="View" onclick="event.stopPropagation();openDocViewer('${syllabus.title}', '${syllabus.file_url || ''}')">${SVG.eye}</button>
          <button class="rc-btn" title="Download" onclick="event.stopPropagation();handleDownload('${syllabus.title}', '${syllabus.file_url || ''}')">${SVG.dl}</button>
        </div>
      </div>`;
  }
  if (markingScheme) {
    html += `
      <div class="resource-card" role="button" tabindex="0" onclick="openDocViewer('${markingScheme.title}', '${markingScheme.file_url || ''}')">
        <div class="rc-icon" style="background:#2BA899">${SVG.check}</div>
        <div class="rc-info">
          <strong>${markingScheme.title}</strong>
          <span>Marking Scheme | PDF</span>
        </div>
        <div class="rc-actions">
          <button class="rc-btn" title="View" onclick="event.stopPropagation();openDocViewer('${markingScheme.title}', '${markingScheme.file_url || ''}')">${SVG.eye}</button>
          <button class="rc-btn" title="Download" onclick="event.stopPropagation();handleDownload('${markingScheme.title}', '${markingScheme.file_url || ''}')">${SVG.dl}</button>
        </div>
      </div>`;
  }
  html += `</div>`;

  /* Books */
  books.forEach(book => {
    html += `
      <div class="book-section">
        <div class="book-header">
          <div class="book-icon" style="background:${book.color}">${SVG.book}</div>
          <div class="book-title-group">
            <h3>${book.name}</h3>
            <span>${book.subtitle}</span>
          </div>
          <button class="full-book-btn" onclick="openDocViewer('${book.name} — Complete Book', '${book.file_url || ''}')">
            ${SVG.dl} Complete Book
          </button>
        </div>
        <div class="chapters-list">
          ${book.chapters.map(ch => renderChapter(book, ch)).join('')}
        </div>
      </div>`;
  });

  panel.innerHTML = html;

  /* Accordion logic */
  panel.querySelectorAll('.chapter-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.chapter-item');
      // close others in same book
      const siblings = item.parentElement.querySelectorAll('.chapter-item');
      siblings.forEach(s => { if (s !== item) s.classList.remove('open'); });
      item.classList.toggle('open');
    });
  });
}

function renderChapter(book, ch) {
  const chId = `ch-${book.name.replace(/\s/g,'-')}-${ch.num}`;
  const wsRows = Array.from({ length: ch.worksheets }, (_, i) => `
    <div class="worksheet-item">
      <span class="ws-name">Practice Worksheet ${i + 1}</span>
      <div class="ws-actions">
        <button class="ws-btn download" onclick="handleDownload('${book.name} Ch.${ch.num} Worksheet ${i+1}')">${SVG.dl} Download</button>
        <button class="ws-btn upload" onclick="openUploadModal('${book.name} Ch.${ch.num} Worksheet ${i+1}')">${SVG.up} Upload</button>
      </div>
    </div>`).join('');

  const resources = [
    { icon: SVG.dl,     color: '#3A7BD5', bg: '#EBF3FD', label: 'Download Chapter',              action: `handleDownload('${book.name} — Chapter ${ch.num}', '${ch.file_url || ''}')` },
    { icon: SVG.file,   color: '#2BA899', bg: '#E8F8F6', label: 'Summary and Objectives',         action: `openDocViewer('${book.name} Ch.${ch.num} — Summary')` },
    { icon: SVG.pencil, color: '#9B59B6', bg: '#F5EFF9', label: 'Muhavare / Word Meanings',       action: `openDocViewer('${book.name} Ch.${ch.num} — Muhavare')` },
    { icon: SVG.check,  color: '#27AE60', bg: '#EAF7EF', label: 'Questions and Answers',          action: `openDocViewer('${book.name} Ch.${ch.num} — Q&A')` },
    { icon: SVG.star,   color: '#E8900A', bg: '#FFF4E0', label: 'Additional Practice Questions',  action: `openDocViewer('${book.name} Ch.${ch.num} — Additional Qs')` },
    { icon: SVG.clock,  color: '#E05555', bg: '#FDE8E8', label: 'Previous Year Questions (PYQ)',  action: `openDocViewer('${book.name} Ch.${ch.num} — PYQ')` },
  ];

  return `
    <div class="chapter-item" id="${chId}">
      <div class="chapter-header" role="button" tabindex="0" aria-expanded="false">
        <div class="ch-num">${ch.num}</div>
        <div class="ch-title">${ch.title}</div>
        <div class="ch-toggle">${SVG.chevD}</div>
      </div>
      <div class="chapter-body">
        <div class="chapter-body-inner">
          <div class="ch-resources">
            ${resources.map(r => `
              <div class="ch-res-item" role="button" tabindex="0" onclick="${r.action}">
                <div class="ch-res-icon" style="background:${r.bg};color:${r.color}">${r.icon}</div>
                <span class="ch-res-label">${r.label}</span>
                <span class="ch-res-action">Open →</span>
              </div>`).join('')}
          </div>
          ${ch.worksheets > 0 ? `
            <div class="worksheets-label">Practice Worksheets</div>
            ${wsRows}
          ` : ''}
        </div>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════
   7. TEST SHEETS
══════════════════════════════════════════ */
function initTestSheets() {
  /* Category tabs */
  document.querySelectorAll('.test-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.testType = tab.dataset.testType;
      document.querySelectorAll('.test-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.testType === state.testType);
        t.setAttribute('aria-selected', String(t.dataset.testType === state.testType));
      });
      renderTestContent();
    });
  });

  /* Board filter */
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      state.testBoard = pill.dataset.filter;
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.filter === state.testBoard));
      renderTestContent();
    });
  });

  renderTestContent();
}

function renderTestContent() {
  const container = document.getElementById('test-content');
  if (!container) return;

  const typeData  = TEST_DATA[state.testType];
  const boardData = typeData && typeData[state.testBoard];

  if (!boardData) { container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">No data available.</p>'; return; }

  const classes = BOARDS_DATA[state.testBoard].classes.slice().reverse(); // descending
  let html = '';

  classes.forEach(cls => {
    const papers = boardData[cls] || [];
    html += `
      <div class="test-class-item" data-class="${cls}">
        <div class="test-class-header" role="button">
          <span class="tc-label">Class ${cls}</span>
          <span class="tc-count">${papers.length} ${papers.length === 1 ? 'paper' : 'papers'}</span>
          <span class="tc-toggle">${SVG.chevD}</span>
        </div>
        <div class="test-class-body">
          <div class="test-papers-grid">
            ${papers.length > 0 ? papers.map(p => renderTestPaperCard(p)).join('') : '<p class="no-papers-msg">More papers being added soon. Check back or contact a mentor.</p>'}
          </div>
        </div>
      </div>`;
  });

  container.innerHTML = html;

  /* Class accordion toggle */
  container.querySelectorAll('.test-class-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.test-class-item');
      item.classList.toggle('open');
    });
  });

  /* Auto-open Class 10 */
  const cls10 = container.querySelector('[data-class="10"]');
  if (cls10) cls10.classList.add('open');
}

function renderTestPaperCard(p) {
  return `
    <div class="test-paper-card">
      <div class="tp-header">
        <div class="tp-icon" style="background:${p.color}">${SVG.file}</div>
        <div class="tp-info">
          <div class="tp-title">${p.title}</div>
          <div class="tp-meta">${p.subject} | ${p.pages} pages | ${p.date}</div>
        </div>
      </div>
      <div class="tp-view-mode">
        ${SVG.eye} Default: View Mode
      </div>
      <div class="tp-actions">
        <button class="tp-action-btn view" onclick="openDocViewer('${p.title.replace(/'/g,"\\'")}')">
          ${SVG.eye} View
        </button>
        <button class="tp-action-btn download" onclick="handleDownload('${p.title.replace(/'/g,"\\'")}')">
          ${SVG.dl} Download
        </button>
        <button class="tp-action-btn upload" onclick="openUploadModal('${p.title.replace(/'/g,"\\'")}')">
          ${SVG.up} Upload Answer
        </button>
        <button class="tp-action-btn submit" onclick="simulateSubmit(this, '${p.id}')">
          ${SVG.send} Submit
        </button>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════
   8. CONTACT FORM
══════════════════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name:    { el: form.querySelector('#name'),          errId: 'name-error' },
    email:   { el: form.querySelector('#contact-email'), errId: 'email-error' },
    cls:     { el: form.querySelector('#student-class'), errId: 'class-error' },
    message: { el: form.querySelector('#message'),       errId: 'message-error' },
  };

  Object.values(fields).forEach(({ el, errId }) => {
    el.addEventListener('input',  () => clearError(el, errId));
    el.addEventListener('change', () => clearError(el, errId));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let valid = true;

    const name = fields.name.el.value.trim();
    if (!name || name.length < 2) { showError(fields.name.el, fields.name.errId, 'Please enter your full name (at least 2 characters).'); valid = false; }
    else clearError(fields.name.el, fields.name.errId);

    const emailVal = fields.email.el.value.trim();
    const emailOK  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    const phoneOK  = /^[6-9]\d{9}$/.test(emailVal.replace(/\s/g,''));
    if (!emailVal) { showError(fields.email.el, fields.email.errId, 'Please enter your email or phone number.'); valid = false; }
    else if (!emailOK && !phoneOK) { showError(fields.email.el, fields.email.errId, 'Enter a valid email or 10-digit Indian phone number.'); valid = false; }
    else clearError(fields.email.el, fields.email.errId);

    if (!fields.cls.el.value) { showError(fields.cls.el, fields.cls.errId, 'Please select your class.'); valid = false; }
    else clearError(fields.cls.el, fields.cls.errId);

    const msg = fields.message.el.value.trim();
    if (!msg || msg.length < 10) { showError(fields.message.el, fields.message.errId, 'Please write a message (at least 10 characters).'); valid = false; }
    else clearError(fields.message.el, fields.message.errId);

    if (!valid) return;

    const btn = document.getElementById('form-submit');
    const s   = document.getElementById('form-success');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const res  = await fetch('/api/mentor-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email_or_phone: emailVal, student_class: fields.cls.el.value, message: msg })
      });
      const data = await res.json();
      if (res.ok) {
        s.textContent = String.fromCharCode(10003) + ' ' + data.message;
        s.style.display = 'block';
        form.reset();
        setTimeout(() => { s.style.display = 'none'; }, 6000);
      } else {
        showToast(data.error || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      showToast('Network error. Please check your connection.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send Message';
    }
  });
}

/* ══════════════════════════════════════════
   9. REVISION NOTIFY FORM
══════════════════════════════════════════ */
function initRevisionNotify() {
  const form = document.getElementById('notify-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const succ      = document.getElementById('notify-success');
    const nameEl    = document.getElementById('notify-name');
    const contactEl = document.getElementById('notify-contact');
    const classEl   = document.getElementById('notify-class');
    try {
      const res  = await fetch('/api/revision-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:      nameEl?.value?.trim()    || 'Student',
          contact:   contactEl?.value?.trim() || 'N/A',
          class_num: classEl?.value           || '10'
        })
      });
      const data = await res.json();
      succ.textContent = res.ok
        ? String.fromCharCode(10003) + ' ' + data.message
        : (data.error || 'Registered successfully!');
    } catch (err) {
      succ.textContent = String.fromCharCode(10003) + " You'll be notified when Revision Classes begin!";
    }
    form.reset();
    setTimeout(() => { succ.textContent = ''; }, 5000);
  });
}

/* ══════════════════════════════════════════
   10. DOCUMENT VIEWER MODAL
══════════════════════════════════════════ */
function initDocModal() {
  const modal     = document.getElementById('doc-modal');
  const closeBtn  = document.getElementById('doc-modal-close');
  const dlBtn     = document.getElementById('doc-download-btn');
  if (!modal) return;

  closeBtn.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(modal); });

  dlBtn.addEventListener('click', () => {
    const title = document.getElementById('doc-modal-title').textContent;
    handleDownload(title);
  });
}

function openDocViewer(title, url) {
  const modal    = document.getElementById('doc-modal');
  const titleEl  = document.getElementById('doc-modal-title');
  const bodyEl   = document.getElementById('doc-viewer-body');
  if (!modal) return;

  titleEl.textContent = title;

  // Backup original mock placeholder if we haven't already
  if (!window._originalDocViewerHTML) {
    window._originalDocViewerHTML = bodyEl.innerHTML;
  }

  // Setup download button in header
  const dlBtn = document.getElementById('doc-download-btn');
  if (dlBtn) {
    const newDlBtn = dlBtn.cloneNode(true);
    dlBtn.parentNode.replaceChild(newDlBtn, dlBtn);
    newDlBtn.addEventListener('click', () => handleDownload(title, url));
  }

  if (url) {
    bodyEl.innerHTML = `<iframe src="${url}" width="100%" height="520px" style="border:none;border-radius:var(--r-md);"></iframe>`;
  } else {
    bodyEl.innerHTML = window._originalDocViewerHTML;
    const nameEl = document.getElementById('doc-preview-name');
    if (nameEl) nameEl.textContent = title;
  }

  openModal(modal);
}

/* ══════════════════════════════════════════
   11. UPLOAD ANSWER SHEET MODAL
══════════════════════════════════════════ */
function initUploadModal() {
  const modal      = document.getElementById('upload-modal');
  const closeBtn   = document.getElementById('upload-modal-close');
  const dropArea   = document.getElementById('upload-drop-area');
  const fileInput  = document.getElementById('answer-file-input');
  const fileInfo   = document.getElementById('upload-file-selected');
  const filename   = document.getElementById('upload-filename');
  const removeBtn  = document.getElementById('remove-file');
  const submitBtn  = document.getElementById('upload-submit-btn');
  const successEl  = document.getElementById('upload-success');
  if (!modal) return;

  closeBtn.addEventListener('click', () => closeModal(modal));
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });

  /* File input change */
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      filename.textContent = file.name;
      fileInfo.hidden = false;
      submitBtn.disabled = false;
      dropArea.style.display = 'none';
    }
  });

  /* Drag & drop */
  dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.classList.add('dragover'); });
  dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
  dropArea.addEventListener('drop', (e) => {
    e.preventDefault(); dropArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) {
      filename.textContent = file.name;
      fileInfo.hidden = false;
      submitBtn.disabled = false;
      dropArea.style.display = 'none';
    }
  });

  /* Remove file */
  removeBtn.addEventListener('click', () => {
    fileInput.value = '';
    fileInfo.hidden = true;
    submitBtn.disabled = true;
    dropArea.style.display = '';
  });

  /* Submit */
  submitBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';

    const fd = new FormData();
    fd.append('answer_file',    file);
    fd.append('resource_type', 'worksheet');
    fd.append('resource_id',    window._uploadResourceId   || 'general');
    fd.append('resource_title', window._uploadResourceName || 'Answer Sheet');
    fd.append('student_name',   'Student');

    try {
      const res  = await fetch('/api/student-submit', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        successEl.textContent = String.fromCharCode(10003) + ' ' + data.message;
        fileInput.value = '';
        fileInfo.hidden = true;
        dropArea.style.display = '';
        submitBtn.innerHTML = SVG.send + ' Submit for Evaluation';
        setTimeout(() => {
          closeModal(modal);
          successEl.textContent = '';
          showToast('Answer sheet submitted! Feedback in 48 hours.');
        }, 2000);
      } else {
        showToast(data.error || 'Upload failed. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = SVG.send + ' Submit for Evaluation';
      }
    } catch (err) {
      showToast('Network error during upload.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = SVG.send + ' Submit for Evaluation';
    }
  });
}

function openUploadModal(resourceName) {
  const modal    = document.getElementById('upload-modal');
  const label    = document.getElementById('upload-for-label');
  const fileInfo = document.getElementById('upload-file-selected');
  const submitBtn= document.getElementById('upload-submit-btn');
  const fileInput= document.getElementById('answer-file-input');
  const successEl= document.getElementById('upload-success');
  const dropArea = document.getElementById('upload-drop-area');
  if (!modal) return;
  label.textContent = `Upload your answer sheet for: "${resourceName}"`;
  fileInfo.hidden = true;
  submitBtn.disabled = true;
  if (fileInput) fileInput.value = '';
  if (successEl) successEl.textContent = '';
  if (dropArea) dropArea.style.display = '';
  openModal(modal);
}

/* ══════════════════════════════════════════
   12. SCROLL TO TOP
══════════════════════════════════════════ */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════
   13. HELPERS
══════════════════════════════════════════ */
function openModal(modal) {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = '';
}

function showError(el, errId, msg) {
  el.classList.add('error');
  el.setAttribute('aria-invalid', 'true');
  const err = document.getElementById(errId);
  if (err) err.textContent = msg;
}

function clearError(el, errId) {
  el.classList.remove('error');
  el.removeAttribute('aria-invalid');
  const err = document.getElementById(errId);
  if (err) err.textContent = '';
}

function handleDownload(title, url) {
  if (url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = url.split('/').pop();
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading: "${title}"`);
  } else {
    showToast(`"${title}" — will be available for download soon. Contact a mentor for direct access.`);
  }
}

function simulateSubmit(btn, paperId) {
  btn.disabled = true;
  btn.textContent = String.fromCharCode(10003) + ' Submitted';
  btn.style.background = '#EAF7EF';
  btn.style.color = '#1A7F4E';
  showToast('Paper submitted! Feedback within 48 hours.');
  fetch('/api/student-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resource_type:  'test_sheet',
      resource_id:    paperId,
      resource_title: 'Test Sheet ' + paperId,
      student_name:   'Student'
    })
  }).catch(() => {});
  setTimeout(() => {
    btn.disabled = false;
    btn.innerHTML = SVG.send + ' Submit';
    btn.style.background = '';
    btn.style.color = '';
  }, 6000);
}

function showToast(message) {
  const old = document.getElementById('gl-toast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'gl-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  Object.assign(toast.style, {
    position: 'fixed', bottom: '5rem', left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: '#1A2740', color: 'white',
    padding: '.7rem 1.4rem', borderRadius: '100px',
    fontSize: '.86rem', fontFamily: "'Inter', sans-serif", fontWeight: '500',
    boxShadow: '0 8px 24px rgba(0,0,0,.22)', zIndex: '9999',
    whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center',
    opacity: '0', transition: 'opacity .3s ease, transform .3s ease',
    overflow: 'hidden', textOverflow: 'ellipsis',
  });
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 350);
  }, 4000);
}