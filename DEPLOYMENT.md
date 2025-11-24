# Deployment Guide - Network Monitor System

## Quick Start

### For Client Deployment (End Users)

#### Option 1: Docker (Simplest)
```bash
# Start the application
docker-compose up -d

# Access at http://localhost:3001
```

#### Option 2: Direct Installation
```bash
# Linux/Mac
chmod +x install.sh && ./install.sh && npm start

# Windows
install.bat
npm start
```

### For Portal Deployment (portal.itsupport.com.bd)

1. **Upload to cPanel:**
   - Upload contents of `portal/` folder to `public_html` directory
   - Ensure `data/` directory exists with write permissions (755 or 777)

2. **Configure PHP:**
   - PHP version: 7.4 or higher
   - Required extensions: sqlite3, pdo, pdo_sqlite

3. **Access Portal:**
   - URL: https://portal.itsupport.com.bd
   - Admin: username `admin`, password `admin123` (CHANGE THIS!)

## System Architecture

```
┌─────────────────────────────────────────────────┐
│          Client Network Monitor App             │
│  ┌───────────────┐      ┌──────────────────┐  │
│  │  React UI     │◄────►│  Express API     │  │
│  │  (Port 3001)  │      │  (Port 3001)     │  │
│  └───────────────┘      └─────────┬────────┘  │
│                                    │            │
│                          ┌─────────▼────────┐  │
│                          │  SQLite Database │  │
│                          │  (data/monitor.db│  │
│                          └──────────────────┘  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│        Portal Website (cPanel Hosting)          │
│  ┌───────────────────────────────────────────┐ │
│  │  PHP Application (portal.itsupport.com.bd)│ │
│  │  ┌──────────────┐  ┌──────────────────┐  │ │
│  │  │License Mgmt  │  │  Admin Dashboard │  │ │
│  │  └──────────────┘  └──────────────────┘  │ │
│  │            │                │             │ │
│  │   ┌────────▼────────────────▼──────────┐ │ │
│  │   │   SQLite Database (data/licenses.db│ │ │
│  │   └────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

## Configuration

### Environment Variables

Create a `.env` file in the project root (optional):

```env
PORT=3001
NODE_ENV=production
```

### Database Locations

- **Client App:** `./data/monitor.db`
- **Portal:** `./portal/data/licenses.db`

Both databases are created automatically on first run.

## Security Checklist

### For Client App:
- [ ] Run on internal network only
- [ ] Use firewall rules to restrict access
- [ ] Regular database backups
- [ ] Monitor disk space for database growth

### For Portal:
- [ ] Change default admin password immediately
- [ ] Enable SSL certificate (HTTPS)
- [ ] Restrict admin access by IP if possible
- [ ] Regular database backups
- [ ] Monitor for suspicious activity
- [ ] Keep PHP version updated

## Backup Strategy

### Client App Backup:
```bash
# Backup database
cp data/monitor.db data/monitor.db.backup.$(date +%Y%m%d)

# Restore from backup
cp data/monitor.db.backup.20241124 data/monitor.db
```

### Portal Backup:
```bash
# From cPanel File Manager, download:
portal/data/licenses.db

# Or via SSH:
cp public_html/portal/data/licenses.db ./backup/
```

## Troubleshooting

### Client App Issues

**Port already in use:**
```bash
# Find process using port 3001
lsof -i :3001
# Kill it or change port in .env
```

**Database locked:**
```bash
# Stop application
# Remove lock file
rm data/monitor.db-wal
# Restart application
```

**Can't connect to services:**
- Check firewall rules
- Verify IP addresses are correct
- Test connectivity: `ping <ip>` or `curl <url>`

### Portal Issues

**Database not writable:**
```bash
chmod 755 portal/data
chmod 644 portal/data/licenses.db
```

**PHP errors:**
- Check error logs in cPanel
- Verify PHP extensions are enabled
- Ensure PHP version is 7.4+

**Email not sending:**
- Configure PHP mail() function in cPanel
- Or modify `sendLicenseEmail()` in `functions.php`

## Monitoring Best Practices

### 1. Start Small
- Begin with 5-10 critical hosts
- Add more gradually as you become familiar

### 2. Set Appropriate Intervals
- Critical services: 30-60 seconds
- Normal services: 2-5 minutes
- Low priority: 10-15 minutes

### 3. Alert Management
- Acknowledge alerts after resolution
- Review alert history regularly
- Adjust thresholds if too many false positives

### 4. Maintenance Windows
- Disable checks during maintenance
- Or adjust intervals temporarily

## Performance Optimization

### For Large Deployments (100+ hosts):

1. **Increase check intervals:**
   - Not all services need 30-second checks
   - Stagger checks across services

2. **Database maintenance:**
   ```bash
   # Vacuum database monthly
   sqlite3 data/monitor.db "VACUUM;"

   # Clean old history (keep 30 days)
   sqlite3 data/monitor.db "DELETE FROM monitoring_history WHERE checked_at < datetime('now', '-30 days');"
   ```

3. **Resource monitoring:**
   - Monitor CPU usage
   - Monitor disk I/O
   - Consider dedicated server for 200+ hosts

## License Management Workflow

### 1. Customer Purchases License
- Customer fills out order form on portal
- Order stored in database with "pending" status

### 2. Admin Processes Order
- Login to admin dashboard
- Verify payment received
- Generate license key for customer
- System automatically emails license to customer

### 3. Customer Activates License
- Customer installs application
- Enters license key via API or UI
- License validated against portal database
- Application unlocked for use

### 4. License Renewal
- Admin generates new license before expiry
- Customer updates license key
- No reinstallation needed

## API Integration Examples

### Check License via API:
```javascript
const response = await fetch('http://localhost:3001/api/license/status');
const status = await response.json();
console.log(status.activated); // true/false
```

### Add Host Programmatically:
```javascript
await fetch('http://localhost:3001/api/hosts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'auto-host-01',
    ip_address: '10.0.0.50',
    description: 'Automatically added'
  })
});
```

## Support

For issues or questions:
- Email: support@itsupport.com.bd
- Portal: https://portal.itsupport.com.bd
- Documentation: See README.md

## Version History

- v1.0.0 (2024-11-24): Initial release
  - Network monitoring with PING, HTTP, HTTPS, TCP checks
  - Alert system
  - Network topology view
  - License management portal
  - Docker support
