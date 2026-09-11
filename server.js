import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy MySQL connection
let pool = null;
function getDb() {
  if (pool) return pool;
  const user = process.env.MYSQL_USER;
  const database = process.env.MYSQL_DATABASE;
  if (!user || !database) return null;

  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306', 10),
      user,
      password: process.env.MYSQL_PASSWORD || '',
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    return pool;
  } catch (e) {
    console.error('MySQL Pool Error:', e);
    return null;
  }
}

// -------------------------------------------------------------
// Auto Schema Initializer (Creates Tables if not already exist)
// -------------------------------------------------------------
async function initMySQLSchema() {
  const db = getDb();
  if (!db) return;
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'cashier',
        phone VARCHAR(50),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS store_settings (
        user_id VARCHAR(100) PRIMARY KEY,
        store_settings JSON,
        categories JSON,
        brands JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS generic_records (
        id VARCHAR(100) NOT NULL,
        user_id VARCHAR(100) NOT NULL,
        collection_name VARCHAR(50) NOT NULL,
        data JSON NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, collection_name, id),
        INDEX idx_user_coll (user_id, collection_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log('[MySQL] Auto schema initialized successfully');
  } catch (err) {
    console.error('[MySQL] Auto schema initialization failed:', err);
  }
}
initMySQLSchema();

// -------------------------------------------------------------
// Health Check & MySQL Status Endpoint
// -------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const db = getDb();
  let mysqlConnected = false;
  if (db) {
    try {
      await db.query('SELECT 1');
      mysqlConnected = true;
    } catch {
      mysqlConnected = false;
    }
  }

  res.json({
    status: 'ok',
    app: 'LimoPOS / MedPOS (Hostinger Edition)',
    auth: 'Firebase Authentication (Client-side)',
    database: mysqlConnected ? 'Hostinger MySQL (Connected)' : 'Local / Offline fallback (Configure MySQL env in hPanel)',
    time: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// MySQL REST API Routes (Isolated by User ID)
// -------------------------------------------------------------

// 1. Fetch collection records for a user
app.get('/api/mysql/:userId/:collection', async (req, res) => {
  const { userId, collection } = req.params;
  const db = getDb();
  if (!db) {
    return res.status(200).json({ success: false, fallback: true, data: [] });
  }

  try {
    if (collection === 'settings') {
      const [rows] = await db.query('SELECT * FROM store_settings WHERE user_id = ?', [userId]);
      if (Array.isArray(rows) && rows.length > 0) {
        return res.json({ success: true, data: [rows[0]] });
      }
      return res.json({ success: true, data: [] });
    }

    const [rows] = await db.query(
      'SELECT data FROM generic_records WHERE user_id = ? AND collection_name = ?',
      [userId, collection]
    );
    const parsed = Array.isArray(rows)
      ? rows.map((r) => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data))
      : [];
    return res.json({ success: true, data: parsed });
  } catch (e) {
    console.error(`Error fetching ${collection}:`, e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 2. Save single record to MySQL
app.post('/api/mysql/:userId/:collection/:docId', async (req, res) => {
  const { userId, collection, docId } = req.params;
  const data = req.body;
  const db = getDb();
  if (!db) {
    return res.status(200).json({ success: false, fallback: true, message: 'MySQL not configured' });
  }

  try {
    if (collection === 'settings') {
      await db.query(
        `INSERT INTO store_settings (user_id, store_settings, categories, brands)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         store_settings = VALUES(store_settings),
         categories = VALUES(categories),
         brands = VALUES(brands)`,
        [
          userId,
          JSON.stringify(data.storeSettings || {}),
          JSON.stringify(data.categories || []),
          JSON.stringify(data.brands || []),
        ]
      );
      return res.json({ success: true });
    }

    await db.query(
      `INSERT INTO generic_records (id, user_id, collection_name, data)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       data = VALUES(data)`,
      [docId, userId, collection, JSON.stringify(data)]
    );

    return res.json({ success: true });
  } catch (e) {
    console.error(`Error saving ${collection}/${docId}:`, e);
    return res.status(500).json({ success: false, error: e.message });
  }
});

// 3. Delete single record from MySQL
app.delete('/api/mysql/:userId/:collection/:docId', async (req, res) => {
  const { userId, collection, docId } = req.params;
  const db = getDb();
  if (!db) {
    return res.status(200).json({ success: false, fallback: true });
  }

  try {
    await db.query(
      'DELETE FROM generic_records WHERE user_id = ? AND collection_name = ? AND id = ?',
      [userId, collection, docId]
    );
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// -------------------------------------------------------------
// Serve Static Frontend Assets from 'dist'
// -------------------------------------------------------------
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// Fallback for all other routes
app.use((req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LimoPOS - Starting...</title>
          <meta http-equiv="refresh" content="3">
          <style>body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background: #f8fafc; text-align: center; }</style>
        </head>
        <body>
          <div>
            <h2>LimoPOS is Initializing</h2>
            <p>Node.js & MySQL Server active. Page will refresh automatically...</p>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[LimoPOS] Server running on http://localhost:${PORT}`);
});
