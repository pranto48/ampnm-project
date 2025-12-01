import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'monitor.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS hosts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      description TEXT,
      device_type TEXT DEFAULT 'server',
      api_username TEXT,
      api_password TEXT,
      api_port INTEGER DEFAULT 8728,
      status TEXT DEFAULT 'unknown',
      last_check TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      host_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      check_type TEXT NOT NULL DEFAULT 'ping',
      check_interval INTEGER NOT NULL DEFAULT 60,
      status TEXT NOT NULL DEFAULT 'unknown',
      last_check TEXT,
      last_status_change TEXT,
      response_time INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (host_id) REFERENCES hosts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS monitoring_history (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      status TEXT NOT NULL,
      response_time INTEGER,
      message TEXT,
      checked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'info',
      message TEXT NOT NULL,
      acknowledged INTEGER DEFAULT 0,
      acknowledged_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS licenses (
      id TEXT PRIMARY KEY,
      license_key TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      company_name TEXT,
      max_hosts INTEGER DEFAULT 10,
      expiry_date TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      activated_at TEXT,
      machine_id TEXT
    );

    CREATE TABLE IF NOT EXISTS system_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_services_host_id ON services(host_id);
    CREATE INDEX IF NOT EXISTS idx_monitoring_history_service_id ON monitoring_history(service_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_service_id ON alerts(service_id);
    CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON alerts(acknowledged);
    CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
  `);

  const hostColumns = db.prepare(`PRAGMA table_info(hosts)`).all() as { name: string }[];
  const hasDeviceType = hostColumns.some((column) => column.name === 'device_type');
  const hasApiUsername = hostColumns.some((column) => column.name === 'api_username');
  const hasApiPassword = hostColumns.some((column) => column.name === 'api_password');
  const hasApiPort = hostColumns.some((column) => column.name === 'api_port');

  if (!hasDeviceType) {
    db.exec(`ALTER TABLE hosts ADD COLUMN device_type TEXT DEFAULT 'server'`);
  }

  if (!hasApiUsername) {
    db.exec(`ALTER TABLE hosts ADD COLUMN api_username TEXT`);
  }

  if (!hasApiPassword) {
    db.exec(`ALTER TABLE hosts ADD COLUMN api_password TEXT`);
  }

  if (!hasApiPort) {
    db.exec(`ALTER TABLE hosts ADD COLUMN api_port INTEGER DEFAULT 8728`);
  }

  console.log('Database initialized successfully');
}
