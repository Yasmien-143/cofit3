import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '10mb' }));

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

  await dbPool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id INT PRIMARY KEY,
      members JSON NOT NULL,
      trainers JSON NOT NULL,
      payments JSON NOT NULL,
      sessions JSON NOT NULL,
      settings JSON NOT NULL,
      admin JSON NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await dbPool.query(
    `INSERT IGNORE INTO app_state (id, members, trainers, payments, sessions, settings, admin)
     VALUES (1, JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_ARRAY(), JSON_OBJECT(), JSON_OBJECT('email','admin@cofit.com','password','adminpassword'))`
  );
}

// Serve the built Vite app
app.use(express.static(path.join(__dirname, 'dist')));

// Simple health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// DB health endpoint for Aiven / Render / Workbench checks
app.get('/api/db-status', async (_req, res) => {
  if (!dbPool) {
    return res.status(503).json({ connected: false, reason: 'DB env vars not configured' });
  }

  try {
    const [rows] = await dbPool.query('SELECT 1 AS ok');
    return res.json({ connected: true, result: rows });
  } catch (error) {
    return res.status(500).json({ connected: false, error: error.message });
  }
});

app.get('/api/bootstrap', async (_req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    const [rows] = await dbPool.query('SELECT * FROM app_state WHERE id = 1 LIMIT 1');
    if (!rows.length) {
      return res.status(404).json({ error: 'State row not found' });
    }
    const row = rows[0];
    return res.json({
      members: typeof row.members === 'string' ? JSON.parse(row.members) : row.members,
      trainers: typeof row.trainers === 'string' ? JSON.parse(row.trainers) : row.trainers,
      payments: typeof row.payments === 'string' ? JSON.parse(row.payments) : row.payments,
      sessions: typeof row.sessions === 'string' ? JSON.parse(row.sessions) : row.sessions,
      settings: typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings,
      admin: typeof row.admin === 'string' ? JSON.parse(row.admin) : row.admin,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/sync', async (req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const payload = req.body || {};
  const members = Array.isArray(payload.members) ? payload.members : [];
  const trainers = Array.isArray(payload.trainers) ? payload.trainers : [];
  const payments = Array.isArray(payload.payments) ? payload.payments : [];
  const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
  const settings = payload.settings && typeof payload.settings === 'object' ? payload.settings : {};
  const admin = payload.admin && typeof payload.admin === 'object' ? payload.admin : { email: 'admin@cofit.com', password: 'adminpassword' };

  try {
    await dbPool.query(
      `UPDATE app_state SET members=?, trainers=?, payments=?, sessions=?, settings=?, admin=? WHERE id=1`,
      [JSON.stringify(members), JSON.stringify(trainers), JSON.stringify(payments), JSON.stringify(sessions), JSON.stringify(settings), JSON.stringify(admin)]
    );
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// SPA fallback so client-side routes work
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize server:', error);
    process.exit(1);
  });