import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Ensure local fallback storage directory exists
const localDataDir = path.join(__dirname, 'local_db');
if (!fs.existsSync(localDataDir)) {
  fs.mkdirSync(localDataDir, { recursive: true });
}

const localDbFile = path.join(localDataDir, 'store.json');
function getLocalData() {
  if (fs.existsSync(localDbFile)) {
    try {
      return JSON.parse(fs.readFileSync(localDbFile, 'utf-8'));
    } catch {
      return { users: [], collections: {} };
    }
  }
  return { users: [], collections: {} };
}

function saveLocalData(data) {
  try {
    fs.writeFileSync(localDbFile, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save local fallback data:', e);
  }
}

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
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
    return pool;
  } catch (e) {
    console.error('MySQL Pool Init Error:', e);
    return null;
  }
}

// -------------------------------------------------------------
// Auto Schema Initializer (Creates Tables in Hostinger MySQL)
// -------------------------------------------------------------
async function initMySQLSchema() {
  const db = getDb();
  if (!db) {
    console.log('[LimoPOS] MySQL credentials not detected. Running on local Node.js engine.');
    return;
  }
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Admin',
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
    console.log('[LimoPOS] Hostinger MySQL Schema auto-initialized successfully.');
  } catch (err) {
    console.error('[LimoPOS] Hostinger MySQL Schema initialization note:', err.message);
  }
}
initMySQLSchema();

// -------------------------------------------------------------
// Health Check Endpoint
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
    app: 'LimoPOS / MedPOS (Hostinger Node.js & MySQL Edition)',
    auth: 'Hostinger Node.js Native Auth (No Firebase required)',
    database: mysqlConnected ? 'Hostinger MySQL (Connected)' : 'Local File Storage (Ready to connect MySQL)',
    time: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// Node.js Native Authentication Endpoints (Register, Login, Reset)
// -------------------------------------------------------------

// 1. Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const userId = 'user_' + crypto.createHash('md5').update(cleanEmail).digest('hex').substring(0, 16);
  const userName = name || cleanEmail.split('@')[0];
  const userRole = role || 'Admin';

  const db = getDb();
  if (db) {
    try {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(400).json({ success: false, error: 'Account with this email already exists.' });
      }

      await db.query(
        'INSERT INTO users (id, name, email, password, role, active) VALUES (?, ?, ?, ?, ?, 1)',
        [userId, userName, cleanEmail, password, userRole]
      );

      return res.json({
        success: true,
        user: { id: userId, email: cleanEmail, name: userName, role: userRole }
      });
    } catch (e) {
      console.error('MySQL Register Error:', e);
    }
  }

  // Fallback Local Storage
  const local = getLocalData();
  const existingUser = (local.users || []).find(u => u.email === cleanEmail);
  if (existingUser) {
    return res.status(400).json({ success: false, error: 'Account with this email already exists.' });
  }

  const newUser = { id: userId, email: cleanEmail, password, name: userName, role: userRole, active: true };
  local.users = local.users || [];
  local.users.push(newUser);
  saveLocalData(local);

  return res.json({
    success: true,
    user: { id: userId, email: cleanEmail, name: userName, role: userRole }
  });
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const db = getDb();

  if (db) {
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
      if (Array.isArray(rows) && rows.length > 0) {
        const user = rows[0];
        if (user.password === password) {
          return res.json({
            success: true,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
          });
        } else {
          return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
        }
      }
    } catch (e) {
      console.error('MySQL Login Error:', e);
    }
  }

  // Fallback Local Storage / Auto-create for seamless access
  const local = getLocalData();
  let user = (local.users || []).find(u => u.email === cleanEmail);
  if (!user) {
    // If no user exists yet, auto-register as owner/admin for seamless setup
    const userId = 'user_' + crypto.createHash('md5').update(cleanEmail).digest('hex').substring(0, 16);
    user = { id: userId, email: cleanEmail, password, name: cleanEmail.split('@')[0], role: 'Admin', active: true };
    local.users = local.users || [];
    local.users.push(user);
    saveLocalData(local);

    // Also try saving to MySQL if connected
    if (db) {
      try {
        await db.query(
          'INSERT INTO users (id, name, email, password, role, active) VALUES (?, ?, ?, ?, ?, 1) ON DUPLICATE KEY UPDATE password = VALUES(password)',
          [userId, user.name, cleanEmail, password, 'Admin']
        );
      } catch {}
    }

    return res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  }

  if (user.password === password) {
    return res.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  }

  return res.status(401).json({ success: false, error: 'Incorrect password. Please try again.' });
});

// 3. Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  return res.json({
    success: true,
    message: `If an account exists with ${cleanEmail}, instructions have been prepared.`
  });
});

// -------------------------------------------------------------
// MySQL / Node Data Routes (Per-User Isolation)
// -------------------------------------------------------------

// 1. Fetch entire collection for a user
app.get('/api/mysql/:userId/:collection', async (req, res) => {
  const { userId, collection } = req.params;
  const db = getDb();

  if (db) {
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
    }
  }

  // Local fallback
  const local = getLocalData();
  const userCollKey = `${userId}_${collection}`;
  const data = (local.collections && local.collections[userCollKey]) ? local.collections[userCollKey] : [];
  return res.json({ success: true, data: Object.values(data) });
});

// 2. Save single document
app.post('/api/mysql/:userId/:collection/:docId', async (req, res) => {
  const { userId, collection, docId } = req.params;
  const data = req.body;
  const db = getDb();

  if (db) {
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
      } else {
        await db.query(
          `INSERT INTO generic_records (id, user_id, collection_name, data)
           VALUES (?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           data = VALUES(data)`,
          [docId, userId, collection, JSON.stringify(data)]
        );
      }
    } catch (e) {
      console.error(`Error saving ${collection}/${docId} to MySQL:`, e);
    }
  }

  // Always keep local copy updated for fast response
  const local = getLocalData();
  local.collections = local.collections || {};
  const userCollKey = `${userId}_${collection}`;
  local.collections[userCollKey] = local.collections[userCollKey] || {};
  local.collections[userCollKey][docId] = data;
  saveLocalData(local);

  return res.json({ success: true });
});

// 3. Delete single document
app.delete('/api/mysql/:userId/:collection/:docId', async (req, res) => {
  const { userId, collection, docId } = req.params;
  const db = getDb();

  if (db) {
    try {
      await db.query(
        'DELETE FROM generic_records WHERE user_id = ? AND collection_name = ? AND id = ?',
        [userId, collection, docId]
      );
    } catch (e) {
      console.error(`Error deleting ${collection}/${docId} from MySQL:`, e);
    }
  }

  // Local remove
  const local = getLocalData();
  const userCollKey = `${userId}_${collection}`;
  if (local.collections && local.collections[userCollKey]) {
    delete local.collections[userCollKey][docId];
    saveLocalData(local);
  }

  return res.json({ success: true });
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
            <p>Node.js & Hostinger MySQL Server is active. Page will refresh automatically...</p>
          </div>
        </body>
      </html>
    `);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[LimoPOS] Node.js Server running on port ${PORT}`);
});
