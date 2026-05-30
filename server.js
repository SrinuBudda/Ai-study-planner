// AI Study Planner Backend Server & API Controller
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and body parsers
app.use(cors());
app.use(express.json());

// Serve static frontend files from workspace root
app.use(express.static(__dirname));

// MySQL connection configuration with environmental fallback defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_study_planner',
  port: process.env.DB_PORT || 3306
};

// Create MySQL Connection Pool
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Check MySQL Connection Status on Startup
async function checkDatabaseConnection() {
  try {
    const [rows] = await promisePool.query('SELECT 1');
    console.log('✅ MySQL Database Connected successfully!');
    await seedPapersTable();
  } catch (err) {
    console.error('❌ MySQL Database Connection failed:', err.message);
    console.warn('⚠️ Server is running in API-disabled fallback mode. Please start MySQL and create the database.');
  }
}

// Preseed the PYQ question papers database using DB entries
async function seedPapersTable() {
  try {
    const [rows] = await promisePool.query('SELECT COUNT(*) as count FROM pyq_papers');
    if (rows[0].count === 0) {
      console.log('🌱 Preseeding pyq_papers table with 11-year exam catalog entries...');
      
      const exams = ['jee', 'neet', 'gate', 'upsc', 'cds', 'nda', 'tgc', 'lawyer', 'govt_eng'];
      const titles = {
        jee: "JEE Main & Advanced - Physics, Chemistry & Mathematics",
        neet: "NEET UG - Physics, Chemistry & Biology Solved Paper",
        gate: "GATE CS - Computer Science Solved Exam Paper",
        upsc: "UPSC Civil Services Prelims - General Studies Paper I",
        cds: "CDS Entrance Exam - English, General Knowledge & Elementary Mathematics",
        nda: "NDA & NA Entrance Exam - Mathematics & General Ability Test",
        tgc: "TGC Engineering Officer Entry - Technical & Military Aptitude",
        lawyer: "CLAT (Common Law Admission Test) - Solved Question Paper",
        govt_eng: "ESE / IES Engineering Services Exam - General Studies & Technical Specialization"
      };

      const seedQueries = [];
      exams.forEach(ex => {
        for (let yr = 2025; yr >= 2015; yr--) {
          const id = `p_${ex}_${yr}`;
          const title = `${yr} ${titles[ex]}`;
          const size = `${(1.2 + (yr % 4) * 0.7).toFixed(1)} MB`;
          const downloads = Math.floor(1000 + (yr % 5) * 620 + (yr % 3) * 190);
          const fileUrl = `/papers/download/${id}`; // Simulate real downloading paths
          
          seedQueries.push(promisePool.query(
            'INSERT INTO pyq_papers (id, exam_key, title, year, file_size, downloads, file_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, ex, title, yr, size, downloads, fileUrl]
          ));
        }
      });

      await Promise.all(seedQueries);
      console.log('✅ Seeded 99 question papers successfully into MySQL!');
    }
  } catch (err) {
    console.error('❌ Failed to seed pyq_papers:', err.message);
  }
}

// ================= API ENDPOINTS =================

// 1. AUTHENTICATION: User Registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'All registration parameters are required.' });
  }

  try {
    const [existing] = await promisePool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    await promisePool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
    res.json({ success: true, message: 'User account created successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database registration error.', error: err.message });
  }
});

// 2. AUTHENTICATION: User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const [rows] = await promisePool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database login error.', error: err.message });
  }
});

// 3. EXAM DATES: Get & Save Dates
app.get('/api/exam-dates', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID is required.' });

  try {
    const [rows] = await promisePool.query('SELECT exam_key, exam_date FROM exam_dates WHERE user_id = ?', [userId]);
    const datesMap = {};
    rows.forEach(r => {
      datesMap[r.exam_key] = r.exam_date;
    });
    res.json(datesMap);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exam dates.', details: err.message });
  }
});

app.post('/api/exam-dates', async (req, res) => {
  const { userId, examKey, examDate } = req.body;
  if (!userId || !examKey || !examDate) return res.status(400).json({ error: 'Parameters missing.' });

  try {
    await promisePool.query(
      'INSERT INTO exam_dates (user_id, exam_key, exam_date) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE exam_date = ?',
      [userId, examKey, examDate, examDate]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save exam date.', details: err.message });
  }
});

// 4. SYLLABUS: Fetch & Sync Syllabi Checklists
app.get('/api/syllabus/:exam', async (req, res) => {
  const { exam } = req.params;
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID is required.' });

  try {
    const [rows] = await promisePool.query(
      'SELECT subject_name, topic_name, difficulty, completed FROM syllabus_topics WHERE user_id = ? AND exam_key = ? ORDER BY id ASC',
      [userId, exam]
    );

    if (rows.length === 0) {
      return res.json({ name: exam, subjects: [] });
    }

    // Reconstruct hierarchical subjects & topics layout
    const subjectsMap = {};
    rows.forEach(r => {
      if (!subjectsMap[r.subject_name]) {
        subjectsMap[r.subject_name] = { name: r.subject_name, topics: [] };
      }
      subjectsMap[r.subject_name].topics.push({
        name: r.topic_name,
        difficulty: r.difficulty,
        completed: !!r.completed
      });
    });

    res.json({
      name: exam,
      subjects: Object.values(subjectsMap)
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve syllabus.', details: err.message });
  }
});

app.post('/api/syllabus/:exam', async (req, res) => {
  const { exam } = req.params;
  const { userId, subjects } = req.body;
  if (!userId || !subjects) return res.status(400).json({ error: 'Parameters missing.' });

  try {
    // Delete existing entries in a transactional fashion
    await promisePool.query('DELETE FROM syllabus_topics WHERE user_id = ? AND exam_key = ?', [userId, exam]);
    
    // Insert new entries
    const insertQueries = [];
    subjects.forEach(subject => {
      subject.topics.forEach(topic => {
        insertQueries.push(promisePool.query(
          'INSERT INTO syllabus_topics (user_id, exam_key, subject_name, topic_name, difficulty, completed) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, exam, subject.name, topic.name, topic.difficulty, topic.completed ? 1 : 0]
        ));
      });
    });

    if (insertQueries.length > 0) {
      await Promise.all(insertQueries);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize syllabus checklist.', details: err.message });
  }
});

// 5. STUDY PLAN: Fetch & Sync Plans
app.get('/api/planner/:exam', async (req, res) => {
  const { exam } = req.params;
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID is required.' });

  try {
    const [rows] = await promisePool.query(
      'SELECT day_index, time_slot, subject, topic, block_type FROM study_plans WHERE user_id = ? AND exam_key = ? ORDER BY id ASC',
      [userId, exam]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve study plan.', details: err.message });
  }
});

app.post('/api/planner/:exam', async (req, res) => {
  const { exam } = req.params;
  const { userId, planBlocks } = req.body;
  if (!userId || !planBlocks) return res.status(400).json({ error: 'Parameters missing.' });

  try {
    await promisePool.query('DELETE FROM study_plans WHERE user_id = ? AND exam_key = ?', [userId, exam]);
    
    const insertQueries = [];
    planBlocks.forEach(block => {
      insertQueries.push(promisePool.query(
        'INSERT INTO study_plans (user_id, exam_key, day_index, time_slot, subject, topic, block_type) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, exam, block.day_index || block.dayIndex, block.time_slot || block.timeSlot, block.subject, block.topic, block.block_type || block.blockType]
      ));
    });

    if (insertQueries.length > 0) {
      await Promise.all(insertQueries);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync planner schedule.', details: err.message });
  }
});

// 6. NOTES: Fetch & Sync Study Notes
app.get('/api/notes/:exam', async (req, res) => {
  const { exam } = req.params;
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID is required.' });

  try {
    const [rows] = await promisePool.query(
      'SELECT subject, content FROM notes WHERE user_id = ? AND exam_key = ?',
      [userId, exam]
    );

    const notesMap = {};
    rows.forEach(r => {
      notesMap[r.subject] = r.content;
    });
    res.json(notesMap);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve notes.', details: err.message });
  }
});

app.post('/api/notes/:exam', async (req, res) => {
  const { exam } = req.params;
  const { userId, subject, content } = req.body;
  if (!userId || !subject || content === undefined) return res.status(400).json({ error: 'Parameters missing.' });

  try {
    await promisePool.query(
      'INSERT INTO notes (user_id, exam_key, subject, content) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE content = ?',
      [userId, exam, subject, content, content]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to synchronize notes.', details: err.message });
  }
});

// 7. CHATBOT: Retrieve & Log Chat Messages
app.get('/api/chatbot/:exam', async (req, res) => {
  const { exam } = req.params;
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID is required.' });

  try {
    const [rows] = await promisePool.query(
      'SELECT sender, message_text as text, UNIX_TIMESTAMP(timestamp)*1000 as timestamp FROM chatbot_logs WHERE user_id = ? AND exam_key = ? ORDER BY id ASC',
      [userId, exam]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chatbot logs.', details: err.message });
  }
});

app.post('/api/chatbot/:exam', async (req, res) => {
  const { exam } = req.params;
  const { userId, sender, text } = req.body;
  if (!userId || !sender || !text) return res.status(400).json({ error: 'Parameters missing.' });

  try {
    await promisePool.query(
      'INSERT INTO chatbot_logs (user_id, exam_key, sender, message_text) VALUES (?, ?, ?, ?)',
      [userId, exam, sender, text]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log chat statement.', details: err.message });
  }
});

app.delete('/api/chatbot/:exam', async (req, res) => {
  const { exam } = req.params;
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'User ID is required.' });

  try {
    await promisePool.query('DELETE FROM chatbot_logs WHERE user_id = ? AND exam_key = ?', [userId, exam]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear chat statement logs.', details: err.message });
  }
});

// 8. PREVIOUS PAPERS: Fetch List & Download Counts
app.get('/api/papers', async (req, res) => {
  try {
    const [rows] = await promisePool.query('SELECT id, exam_key as exam, title, year, file_size as size, downloads, file_url as fileUrl FROM pyq_papers ORDER BY year DESC, exam_key ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve question papers.', details: err.message });
  }
});

app.post('/api/papers/download', async (req, res) => {
  const { paperId } = req.body;
  if (!paperId) return res.status(400).json({ error: 'Paper ID is required.' });

  try {
    await promisePool.query('UPDATE pyq_papers SET downloads = downloads + 1 WHERE id = ?', [paperId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment download count.', details: err.message });
  }
});

// Redirect any unmatched requests to the main app dashboard (Fallback routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize connection and start listening
checkDatabaseConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AI Study Planner API server running at: http://localhost:${PORT}`);
  });
});
