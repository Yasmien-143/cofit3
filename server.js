import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// =====================
// MIDDLEWARE
// =====================
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

// =====================
// DB CONNECTION
// =====================
let dbPool = null;

async function initDb() {
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME = 'cofit1',
    DB_SSL = 'true',
  } = process.env;

  if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD) {
    console.log('⚠️ DB not configured');
    return;
  }

  dbPool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
    connectionLimit: 5,
  });

  console.log('✅ DB connected');

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INT PRIMARY KEY,
      members JSON NOT NULL,
      trainers JSON NOT NULL,
      payments JSON NOT NULL,
      sessions JSON NOT NULL,
      settings JSON NOT NULL,
      admin JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await dbPool.query(`
    INSERT IGNORE INTO app_state (
      id, members, trainers, payments, sessions, settings, admin
    )
    VALUES (
      1,
      JSON_ARRAY(),
      JSON_ARRAY(),
      JSON_ARRAY(),
      JSON_ARRAY(),
      JSON_OBJECT(),
      JSON_OBJECT('email','admin@cofit.com','password','adminpassword')
    )
  `);
}

// =====================
// HEALTH
// =====================
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// =====================
// DB STATUS
// =====================
app.get('/api/db-status', async (_req, res) => {
  if (!dbPool) {
    return res.status(503).json({
      connected: false,
      reason: 'DB not configured',
    });
  }

  try {
    const [rows] = await dbPool.query('SELECT 1 AS ok');
    res.json({ connected: true, result: rows });
  } catch (err) {
    res.status(500).json({
      connected: false,
      error: err.message,
    });
  }
});

// =====================
// BOOTSTRAP DATA
// =====================
app.get('/api/bootstrap', async (_req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: 'DB not configured' });
  }

  try {
    const [rows] = await dbPool.query(
      'SELECT * FROM app_state WHERE id = 1'
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'State not found' });
    }

    const row = rows[0];

    res.json({
      members: JSON.parse(row.members || '[]'),
      trainers: JSON.parse(row.trainers || '[]'),
      payments: JSON.parse(row.payments || '[]'),
      sessions: JSON.parse(row.sessions || '[]'),
      settings: JSON.parse(row.settings || '{}'),
      admin: JSON.parse(row.admin || '{}'),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// SYNC DATA
// =====================
app.post('/api/sync', async (req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: 'DB not configured' });
  }

  const body = req.body || {};

  try {
    await dbPool.query(
      `UPDATE app_state SET 
        members=?,
        trainers=?,
        payments=?,
        sessions=?,
        settings=?,
        admin=?
       WHERE id=1`,
      [
        JSON.stringify(body.members || []),
        JSON.stringify(body.trainers || []),
        JSON.stringify(body.payments || []),
        JSON.stringify(body.sessions || []),
        JSON.stringify(body.settings || {}),
        JSON.stringify(body.admin || {
          email: 'admin@cofit.com',
          password: 'adminpassword',
        }),
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// SAFE SPA ROUTE (FIXED)
// =====================
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// =====================
// ERROR HANDLER (IMPORTANT)
// =====================
app.use((err, _req, res, _next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
  });
});

// =====================
// START SERVER
// =====================
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB Init failed:', err);
    process.exit(1);
  });
