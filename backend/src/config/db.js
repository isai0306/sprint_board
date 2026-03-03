import mysql from 'mysql2/promise';
import { config } from './index.js';

let pool;

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: 'utf8mb4_general_ci'
    });

    pool.on('error', (err) => {
      console.error('[DB POOL ERROR]', err);
    });
  }
  return pool;
}

export async function query(sql, params) {
  const poolInstance = getDbPool();
  const [rows] = await poolInstance.execute(sql, params);
  return rows;
}

