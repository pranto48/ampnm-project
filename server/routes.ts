import express from 'express';
import { db } from './database';
import { v4 as uuidv4 } from 'uuid';
import { performMonitoringChecks } from './monitoring';

const router = express.Router();

const getAgentToken = () => process.env.WINDOWS_AGENT_TOKEN || 'ampnm-agent-token';
const validateAgentToken = (req: express.Request, res: express.Response) => {
  const provided =
    (req.headers['x-agent-token'] as string) ||
    (req.query.agent_token as string) ||
    (req.body?.agent_token as string);

  if (!provided || provided !== getAgentToken()) {
    res.status(401).json({ error: 'Unauthorized agent request' });
    return false;
  }
  return true;
};

const parseMetricNumber = (value: any) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

router.get('/hosts', (req, res) => {
  try {
    const hosts = db.prepare('SELECT * FROM hosts ORDER BY name').all();
    res.json(hosts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/hosts', (req, res) => {
  try {
    const { name, ip_address, description, device_type, api_username, api_password, api_port } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO hosts (id, name, ip_address, description, device_type, api_username, api_password, api_port, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'unknown', ?, ?)
    `).run(
      id,
      name,
      ip_address,
      description || null,
      device_type || 'server',
      api_username || null,
      api_password || null,
      api_port || 8728,
      now,
      now
    );

    const host = db.prepare('SELECT * FROM hosts WHERE id = ?').get(id);
    res.json(host);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/hosts/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM hosts WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/services', (req, res) => {
  try {
    const services = db.prepare('SELECT * FROM services ORDER BY name').all();
    res.json(services);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/services', (req, res) => {
  try {
    const { host_id, name, description, check_type, check_interval } = req.body;
    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO services (id, host_id, name, description, check_type, check_interval, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'unknown', ?, ?)
    `).run(id, host_id, name, description || null, check_type, check_interval, now, now);

    const service = db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    res.json(service);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/services/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/alerts', (req, res) => {
  try {
    const acknowledged = req.query.acknowledged === 'true' ? 1 : 0;
    const alerts = db.prepare(
      'SELECT * FROM alerts WHERE acknowledged = ? ORDER BY created_at DESC'
    ).all(acknowledged);
    res.json(alerts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/alerts/:id/acknowledge', (req, res) => {
  try {
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE alerts SET acknowledged = 1, acknowledged_at = ? WHERE id = ?
    `).run(now, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/monitoring-history/:serviceId', (req, res) => {
  try {
    const history = db.prepare(`
      SELECT * FROM monitoring_history
      WHERE service_id = ?
      ORDER BY checked_at DESC
      LIMIT 100
    `).all(req.params.serviceId);
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/monitor/run', async (req, res) => {
  try {
    await performMonitoringChecks();
    res.json({ success: true, message: 'Monitoring check completed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/agent/windows-metrics', (req, res) => {
  if (!validateAgentToken(req, res)) {
    return;
  }

  try {
    const {
      host_name,
      host_ip,
      cpu_percent,
      memory_percent,
      disk_free_gb,
      disk_total_gb,
      network_in_mbps,
      network_out_mbps,
      gpu_percent,
    } = req.body || {};

    if (!host_name) {
      return res.status(400).json({ error: 'host_name is required' });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(
      `INSERT INTO agent_windows_metrics (
        id, host_name, host_ip, cpu_percent, memory_percent, disk_free_gb, disk_total_gb,
        network_in_mbps, network_out_mbps, gpu_percent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      host_name,
      host_ip || null,
      parseMetricNumber(cpu_percent),
      parseMetricNumber(memory_percent),
      parseMetricNumber(disk_free_gb),
      parseMetricNumber(disk_total_gb),
      parseMetricNumber(network_in_mbps),
      parseMetricNumber(network_out_mbps),
      parseMetricNumber(gpu_percent),
      now
    );

    res.json({ success: true, id, recorded_at: now });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/agent/windows-metrics/recent', (req, res) => {
  if (!validateAgentToken(req, res)) {
    return;
  }

  try {
    const requestedLimit = parseInt((req.query.limit as string) || '50', 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(requestedLimit, 500))
      : 50;
    const metrics = db
      .prepare(
        `SELECT * FROM agent_windows_metrics ORDER BY datetime(created_at) DESC LIMIT ?`
      )
      .all(limit);
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/agent/windows-metrics/:host/latest', (req, res) => {
  if (!validateAgentToken(req, res)) {
    return;
  }

  try {
    const host = req.params.host;
    const metric = db
      .prepare(
        `SELECT * FROM agent_windows_metrics WHERE host_name = ? ORDER BY datetime(created_at) DESC LIMIT 1`
      )
      .get(host);

    if (!metric) {
      return res.status(404).json({ error: 'No metrics found for host' });
    }

    res.json(metric);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/license/activate', (req, res) => {
  try {
    const { license_key, machine_id } = req.body;

    const license: any = db.prepare(
      'SELECT * FROM licenses WHERE license_key = ?'
    ).get(license_key);

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
    db.prepare(`
      UPDATE licenses SET machine_id = ?, activated_at = ? WHERE id = ?
    `).run(machine_id, now, license.id);

    db.prepare(`
      INSERT OR REPLACE INTO system_config (key, value, updated_at)
      VALUES ('license_key', ?, ?), ('max_hosts', ?, ?), ('license_status', 'active', ?)
    `).run(license_key, now, license.max_hosts.toString(), now, now);

    res.json({
      success: true,
      max_hosts: license.max_hosts,
      expiry_date: license.expiry_date,
      customer_name: license.customer_name
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/license/status', (req, res) => {
  try {
    const licenseKey: any = db.prepare(
      "SELECT value FROM system_config WHERE key = 'license_key'"
    ).get();

    if (!licenseKey) {
      return res.json({ activated: false });
    }

    const license: any = db.prepare(
      'SELECT * FROM licenses WHERE license_key = ?'
    ).get(licenseKey.value);

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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/system/info', (req, res) => {
  try {
    const hostCount: any = db.prepare('SELECT COUNT(*) as count FROM hosts').get();
    const serviceCount: any = db.prepare('SELECT COUNT(*) as count FROM services').get();
    const alertCount: any = db.prepare('SELECT COUNT(*) as count FROM alerts WHERE acknowledged = 0').get();

    res.json({
      total_hosts: hostCount.count,
      total_services: serviceCount.count,
      active_alerts: alertCount.count,
      version: '1.0.0'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
