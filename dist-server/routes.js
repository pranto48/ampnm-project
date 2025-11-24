"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("./database");
const uuid_1 = require("uuid");
const monitoring_1 = require("./monitoring");
const router = express_1.default.Router();
router.get('/hosts', (req, res) => {
    try {
        const hosts = database_1.db.prepare('SELECT * FROM hosts ORDER BY name').all();
        res.json(hosts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/hosts', (req, res) => {
    try {
        const { name, ip_address, description } = req.body;
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        database_1.db.prepare(`
      INSERT INTO hosts (id, name, ip_address, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'unknown', ?, ?)
    `).run(id, name, ip_address, description || null, now, now);
        const host = database_1.db.prepare('SELECT * FROM hosts WHERE id = ?').get(id);
        res.json(host);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete('/hosts/:id', (req, res) => {
    try {
        database_1.db.prepare('DELETE FROM hosts WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/services', (req, res) => {
    try {
        const services = database_1.db.prepare('SELECT * FROM services ORDER BY name').all();
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/services', (req, res) => {
    try {
        const { host_id, name, description, check_type, check_interval } = req.body;
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        database_1.db.prepare(`
      INSERT INTO services (id, host_id, name, description, check_type, check_interval, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'unknown', ?, ?)
    `).run(id, host_id, name, description || null, check_type, check_interval, now, now);
        const service = database_1.db.prepare('SELECT * FROM services WHERE id = ?').get(id);
        res.json(service);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.delete('/services/:id', (req, res) => {
    try {
        database_1.db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/alerts', (req, res) => {
    try {
        const acknowledged = req.query.acknowledged === 'true' ? 1 : 0;
        const alerts = database_1.db.prepare('SELECT * FROM alerts WHERE acknowledged = ? ORDER BY created_at DESC').all(acknowledged);
        res.json(alerts);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put('/alerts/:id/acknowledge', (req, res) => {
    try {
        const now = new Date().toISOString();
        database_1.db.prepare(`
      UPDATE alerts SET acknowledged = 1, acknowledged_at = ? WHERE id = ?
    `).run(now, req.params.id);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/monitoring-history/:serviceId', (req, res) => {
    try {
        const history = database_1.db.prepare(`
      SELECT * FROM monitoring_history
      WHERE service_id = ?
      ORDER BY checked_at DESC
      LIMIT 100
    `).all(req.params.serviceId);
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/monitor/run', async (req, res) => {
    try {
        await (0, monitoring_1.performMonitoringChecks)();
        res.json({ success: true, message: 'Monitoring check completed' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/license/activate', (req, res) => {
    try {
        const { license_key, machine_id } = req.body;
        const license = database_1.db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(license_key);
        if (!license) {
            return res.status(404).json({ error: 'Invalid license key' });
        }
        if (license.status !== 'active') {
            return res.status(400).json({ error: 'License is not active' });
        }
        if (license.machine_id && license.machine_id !== machine_id) {
            return res.status(400).json({ error: 'License already activated on another machine' });
        }
        if (license.expiry_date) {
            const expiryDate = new Date(license.expiry_date);
            if (expiryDate < new Date()) {
                return res.status(400).json({ error: 'License has expired' });
            }
        }
        const now = new Date().toISOString();
        database_1.db.prepare(`
      UPDATE licenses SET machine_id = ?, activated_at = ? WHERE id = ?
    `).run(machine_id, now, license.id);
        database_1.db.prepare(`
      INSERT OR REPLACE INTO system_config (key, value, updated_at)
      VALUES ('license_key', ?, ?), ('max_hosts', ?, ?), ('license_status', 'active', ?)
    `).run(license_key, now, license.max_hosts.toString(), now, now);
        res.json({
            success: true,
            max_hosts: license.max_hosts,
            expiry_date: license.expiry_date,
            customer_name: license.customer_name
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/license/status', (req, res) => {
    try {
        const licenseKey = database_1.db.prepare("SELECT value FROM system_config WHERE key = 'license_key'").get();
        if (!licenseKey) {
            return res.json({ activated: false });
        }
        const license = database_1.db.prepare('SELECT * FROM licenses WHERE license_key = ?').get(licenseKey.value);
        if (!license) {
            return res.json({ activated: false });
        }
        const isExpired = license.expiry_date
            ? new Date(license.expiry_date) < new Date()
            : false;
        res.json({
            activated: true,
            customer_name: license.customer_name,
            max_hosts: license.max_hosts,
            expiry_date: license.expiry_date,
            expired: isExpired,
            status: license.status
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.get('/system/info', (req, res) => {
    try {
        const hostCount = database_1.db.prepare('SELECT COUNT(*) as count FROM hosts').get();
        const serviceCount = database_1.db.prepare('SELECT COUNT(*) as count FROM services').get();
        const alertCount = database_1.db.prepare('SELECT COUNT(*) as count FROM alerts WHERE acknowledged = 0').get();
        res.json({
            total_hosts: hostCount.count,
            total_services: serviceCount.count,
            active_alerts: alertCount.count,
            version: '1.0.0'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
