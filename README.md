# Network Monitor - Complete Solution

A professional network monitoring system with licensing portal for **portal.itsupport.com.bd**

## Package Contents

This package contains two applications:

1. **Network Monitor Application** - The main monitoring system (client-side)
2. **License Portal Website** - PHP-based license management portal (hosted on cPanel)

## Features

### Network Monitor Application
- Real-time network monitoring
- Multiple check types: PING, HTTP, HTTPS, TCP
- Automated health checks every 30 seconds
- Alert system with notifications
- Network topology visualization
- SQLite database (no external dependencies)
- Self-hosted solution
- Docker support
- Licensing system with activation

### License Portal
- Customer license management
- Online license purchase
- License activation verification
- Admin dashboard for license generation
- Order management
- Automated email delivery

## Installation

### Option 1: Docker Installation (Recommended)

1. **Prerequisites:**
   - Docker and Docker Compose installed

2. **Installation Steps:**
   ```bash
   # Build and start the application
   docker-compose up -d

   # Check status
   docker-compose ps

   # View logs
   docker-compose logs -f
   ```

3. **Access the application:**
   - Open browser: `http://localhost:3001`

4. **Stop the application:**
   ```bash
   docker-compose down
   ```

### Option 2: Manual Installation

#### Linux/Mac:
```bash
# Make install script executable
chmod +x install.sh

# Run installation
./install.sh

# Start the application
npm start
```

#### Windows:
```cmd
# Run installation script
install.bat

# Start the application
npm start
```

### Prerequisites for Manual Installation:
- Node.js 18 or higher
- npm (comes with Node.js)

## Configuration

### Application Configuration

The application runs on port 3001 by default. To change:

1. Edit `.env` file:
   ```
   PORT=3001
   ```

2. Or set environment variable:
   ```bash
   PORT=8080 npm start
   ```

### Database

- Database file: `./data/monitor.db`
- Automatically created on first run
- Backed up regularly recommended

## License Activation

### Method 1: Using the Portal

1. Go to `https://portal.itsupport.com.bd`
2. Navigate to "Activate License"
3. Enter your license key
4. Follow activation instructions

### Method 2: API Activation

```bash
curl -X POST http://localhost:3001/api/license/activate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "YOUR-LICENSE-KEY",
    "machine_id": "YOUR-MACHINE-ID"
  }'
```

### Method 3: Direct Database

Insert license key into the database:

```bash
# Using SQLite CLI
sqlite3 data/monitor.db
```

```sql
INSERT INTO system_config (key, value) VALUES ('license_key', 'YOUR-LICENSE-KEY');
```

## Portal Website Installation (cPanel)

### Step 1: Upload Files

1. Login to cPanel at portal.itsupport.com.bd
2. Go to File Manager
3. Navigate to `public_html` directory
4. Upload entire `portal` folder contents
5. Set permissions:
   - `data` directory: 755 (or 777 if needed)
   - `config.php`: 644
   - `index.php`: 644

### Step 2: Create Data Directory

```bash
mkdir -p portal/data
chmod 755 portal/data
```

### Step 3: Configure PHP

Ensure PHP 7.4+ is enabled in cPanel:
1. Go to "Select PHP Version"
2. Choose PHP 7.4 or higher
3. Enable extensions: `sqlite3`, `pdo`, `pdo_sqlite`

### Step 4: Test Installation

1. Visit: `https://portal.itsupport.com.bd`
2. Default admin credentials:
   - Username: `admin`
   - Password: `admin123`
3. **Change password immediately after first login!**

### Step 5: Security Recommendations

1. Change default admin password in `config.php`:
   ```php
   define('ADMIN_PASSWORD', password_hash('YOUR_NEW_PASSWORD', PASSWORD_DEFAULT));
   ```

2. Protect admin area with `.htaccess`:
   ```apache
   <Files "config.php">
       Order allow,deny
       Deny from all
   </Files>
   ```

3. Set up SSL certificate (recommended)
4. Configure email settings for license delivery

## Usage

### Adding Hosts

1. Click "Add Host" button
2. Enter host information:
   - Name (e.g., "web-server-01")
   - IP address or hostname
   - Description (optional)
3. Add services to monitor:
   - Service name (e.g., "HTTP", "SSH")
   - Check type (PING, HTTP, HTTPS, TCP)
   - Check interval (in seconds)
4. Click "Add Host"

### Monitoring

- Automatic checks run every 30 seconds
- Click "Check Now" for immediate check
- View status on Dashboard
- Expand hosts to see service details

### Managing Alerts

- Alerts appear when services enter warning/critical state
- Click checkmark to acknowledge alerts
- Acknowledged alerts are archived

### Network Topology

- Click "Topology" tab to view network map
- Visual representation of all hosts and services
- Color-coded status indicators

## Portal Admin Functions

### Generating Licenses

1. Login to admin panel
2. Fill in customer information:
   - Customer name
   - Email address
   - Company name (optional)
   - Max hosts allowed
   - Duration in months
3. Click "Generate License"
4. License key is automatically emailed to customer

### Managing Orders

1. View all orders in admin dashboard
2. Process pending orders
3. Generate licenses for paid orders
4. Track license activation status

## Pricing Plans

### Starter Plan
- **Price:** ৳4,999/year
- Up to 10 hosts
- 12 months license
- Email support

### Professional Plan (Popular)
- **Price:** ৳14,999/year
- Up to 50 hosts
- 12 months license
- Priority support
- Network topology view

### Enterprise Plan
- **Price:** ৳39,999/year
- Up to 200 hosts
- 12 months license
- 24/7 support
- Custom integrations
- Dedicated account manager

## API Documentation

### Check License Status

```bash
GET /api/license/status
```

### Activate License

```bash
POST /api/license/activate
Content-Type: application/json

{
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "machine_id": "unique-machine-id"
}
```

### Get Hosts

```bash
GET /api/hosts
```

### Add Host

```bash
POST /api/hosts
Content-Type: application/json

{
  "name": "web-server-01",
  "ip_address": "192.168.1.100",
  "description": "Production web server"
}
```

### Add Service

```bash
POST /api/services
Content-Type: application/json

{
  "host_id": "host-uuid",
  "name": "HTTP",
  "check_type": "http",
  "check_interval": 60
}
```

### Run Manual Check

```bash
POST /api/monitor/run
```

## Troubleshooting

### Application won't start

1. Check if port 3001 is available:
   ```bash
   netstat -an | grep 3001
   ```

2. Check Node.js version:
   ```bash
   node -v  # Should be 18+
   ```

3. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Database errors

1. Check permissions:
   ```bash
   ls -la data/
   ```

2. Reset database:
   ```bash
   rm data/monitor.db
   npm start  # Will recreate database
   ```

### Portal not working

1. Check PHP version (must be 7.4+)
2. Verify SQLite extension is enabled
3. Check file permissions on `data` directory
4. Review error logs in cPanel

### License activation fails

1. Verify license key is correct
2. Check license hasn't expired
3. Ensure license isn't already activated on another machine
4. Contact support: support@itsupport.com.bd

## File Structure

```
network-monitor/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── lib/               # API client
│   ├── types/             # TypeScript types
│   └── utils/             # Helper functions
├── server/                # Backend Node.js/Express server
│   ├── database.ts        # SQLite database setup
│   ├── routes.ts          # API routes
│   ├── monitoring.ts      # Monitoring service
│   └── index.ts          # Server entry point
├── portal/                # PHP License Portal
│   ├── pages/            # Portal pages
│   ├── config.php        # Database configuration
│   ├── functions.php     # Helper functions
│   └── index.php         # Main entry point
├── data/                  # Database files (auto-created)
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── install.sh            # Linux/Mac installer
├── install.bat           # Windows installer
└── README.md             # This file
```

## Support

For support, please contact:

- **Email:** support@itsupport.com.bd
- **Website:** https://portal.itsupport.com.bd
- **Phone:** +880 XXX-XXXXXX

## License

This software is licensed. A valid license key is required for operation.

## Version

Version 1.0.0

---

© 2024 portal.itsupport.com.bd - All rights reserved
