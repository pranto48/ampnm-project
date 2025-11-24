<?php
define('DB_FILE', __DIR__ . '/data/licenses.db');
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', password_hash('admin123', PASSWORD_DEFAULT));

$db = new SQLite3(DB_FILE);

$db->exec('
    CREATE TABLE IF NOT EXISTS licenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        license_key TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        company_name TEXT,
        max_hosts INTEGER DEFAULT 10,
        expiry_date TEXT,
        status TEXT DEFAULT "active",
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        activated_at TEXT,
        machine_id TEXT,
        payment_status TEXT DEFAULT "pending",
        amount REAL DEFAULT 0
    )
');

$db->exec('
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        company_name TEXT,
        phone TEXT,
        plan TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT DEFAULT "pending",
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        license_id INTEGER,
        FOREIGN KEY (license_id) REFERENCES licenses(id)
    )
');

function generateLicenseKey() {
    return sprintf(
        '%s-%s-%s-%s',
        strtoupper(bin2hex(random_bytes(4))),
        strtoupper(bin2hex(random_bytes(4))),
        strtoupper(bin2hex(random_bytes(4))),
        strtoupper(bin2hex(random_bytes(4)))
    );
}
?>
