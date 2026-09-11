import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool | null {
  if (pool) return pool;

  const host = process.env.MYSQL_HOST || 'localhost';
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);

  if (!user || !database) {
    // Return null if MySQL credentials aren't provided yet
    return null;
  }

  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
    console.log(`[MySQL] Connected to database ${database} on ${host}:${port}`);
    return pool;
  } catch (err) {
    console.error('[MySQL] Failed to initialize MySQL pool:', err);
    return null;
  }
}

export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  const db = getDbPool();
  if (!db) {
    throw new Error('MySQL connection not configured. Please set MYSQL_USER and MYSQL_DATABASE.');
  }
  const [rows] = await db.query(query, params);
  return rows as T[];
}
