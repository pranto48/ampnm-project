import { db } from './database';
import { v4 as uuidv4 } from 'uuid';
import http from 'http';
import https from 'https';
import net from 'net';

interface CheckResult {
  status: 'ok' | 'warning' | 'critical' | 'unknown';
  response_time?: number;
  message?: string;
}

async function checkPing(ipAddress: string): Promise<CheckResult> {
  return checkHttp(`http://${ipAddress}`);
}

async function checkHttp(url: string): Promise<CheckResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;

    const timeout = setTimeout(() => {
      resolve({
        status: 'critical',
        message: 'Request timeout after 10 seconds'
      });
    }, 10000);

    const req = client.get(url, (res) => {
      clearTimeout(timeout);
      const responseTime = Date.now() - startTime;

      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
        resolve({
          status: 'ok',
          response_time: responseTime,
          message: `HTTP ${res.statusCode}`
        });
      } else {
        resolve({
          status: 'warning',
          response_time: responseTime,
          message: `HTTP ${res.statusCode}`
        });
      }

      res.resume();
    });

    req.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        status: 'critical',
        message: `HTTP check failed: ${err.message}`
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      clearTimeout(timeout);
      resolve({
        status: 'critical',
        message: 'Request timeout'
      });
    });
  });
}

async function checkTcp(host: string, port: number): Promise<CheckResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();

    const timeout = setTimeout(() => {
      socket.destroy();
      resolve({
        status: 'critical',
        message: 'TCP connection timeout'
      });
    }, 5000);

    socket.connect(port, host, () => {
      clearTimeout(timeout);
      const responseTime = Date.now() - startTime;
      socket.destroy();
      resolve({
        status: 'ok',
        response_time: responseTime,
        message: `TCP port ${port} open`
      });
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({
        status: 'critical',
        message: `TCP check failed: ${err.message}`
      });
    });
  });
}

export async function performMonitoringChecks() {
  try {
    const services = db.prepare(`
      SELECT s.*, h.ip_address, h.name as host_name
      FROM services s
      JOIN hosts h ON s.host_id = h.id
    `).all();

    for (const service of services as any[]) {
      let checkResult: CheckResult;

      switch (service.check_type) {
        case 'ping':
          checkResult = await checkPing(service.ip_address);
          break;
        case 'http':
          const httpUrl = service.ip_address.startsWith('http')
            ? service.ip_address
            : `http://${service.ip_address}`;
          checkResult = await checkHttp(httpUrl);
          break;
        case 'https':
          const httpsUrl = service.ip_address.startsWith('https')
            ? service.ip_address
            : `https://${service.ip_address}`;
          checkResult = await checkHttp(httpsUrl);
          break;
        case 'tcp':
          checkResult = await checkTcp(service.ip_address, 80);
          break;
        default:
          checkResult = { status: 'unknown', message: 'Unknown check type' };
      }

      const now = new Date().toISOString();

      db.prepare(`
        UPDATE services
        SET status = ?, response_time = ?, last_check = ?, updated_at = ?
        WHERE id = ?
      `).run(
        checkResult.status,
        checkResult.response_time || null,
        now,
        now,
        service.id
      );

      db.prepare(`
        INSERT INTO monitoring_history (id, service_id, status, response_time, message, checked_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        service.id,
        checkResult.status,
        checkResult.response_time || null,
        checkResult.message || null,
        now
      );

      const hostServices: any[] = db.prepare(`
        SELECT status FROM services WHERE host_id = ?
      `).all(service.host_id);

      const allOk = hostServices.every(s => s.status === 'ok');
      const anyCritical = hostServices.some(s => s.status === 'critical');
      const anyWarning = hostServices.some(s => s.status === 'warning');

      let hostStatus = 'unknown';
      if (anyCritical) hostStatus = 'down';
      else if (anyWarning) hostStatus = 'warning';
      else if (allOk) hostStatus = 'up';

      db.prepare(`
        UPDATE hosts
        SET status = ?, last_check = ?, updated_at = ?
        WHERE id = ?
      `).run(hostStatus, now, now, service.host_id);

      if (checkResult.status === 'critical' || checkResult.status === 'warning') {
        const severity = checkResult.status === 'critical' ? 'critical' : 'warning';
        const message = `${service.name} on ${service.host_name}: ${checkResult.message}`;

        db.prepare(`
          INSERT INTO alerts (id, service_id, severity, message, acknowledged, created_at)
          VALUES (?, ?, ?, ?, 0, ?)
        `).run(uuidv4(), service.id, severity, message, now);
      }
    }

    console.log(`Monitored ${services.length} services at ${new Date().toLocaleString()}`);
  } catch (error) {
    console.error('Error performing monitoring checks:', error);
  }
}
