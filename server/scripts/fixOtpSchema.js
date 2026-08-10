import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'careerlaunch.sqlite');
const db = new sqlite3.Database(dbPath);

function run(sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => (err ? reject(err) : resolve()));
  });
}

function all(sql) {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

(async () => {
  try {
    const cols = await all('PRAGMA table_info(users)');
    const names = cols.map((c) => c.name);
    console.log('users cols:', names.join(', '));

    if (!names.includes('otp')) {
      await run('ALTER TABLE users ADD COLUMN otp VARCHAR(6);');
      console.log('added users.otp');
    }
    if (!names.includes('otp_expires_at')) {
      await run('ALTER TABLE users ADD COLUMN otp_expires_at DATETIME;');
      console.log('added users.otp_expires_at');
    }
    if (!names.includes('is_verified')) {
      await run('ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0;');
      console.log('added users.is_verified');
    }

    await run(`CREATE TABLE IF NOT EXISTS pending_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'student',
      phone VARCHAR(20),
      education TEXT,
      skills TEXT,
      otp VARCHAR(6),
      otp_expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`);
    console.log('pending_registrations table ensured');
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    db.close();
  }
})();
