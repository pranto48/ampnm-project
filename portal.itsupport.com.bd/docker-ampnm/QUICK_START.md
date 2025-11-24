# Docker AMPNM - Quick Start Card

## 🚀 5-Minute Setup

### Step 1: Start Container
```bash
docker-compose up -d
```

### Step 2: Access Application
Open browser: `http://YOUR_IP:2266`

### Step 3: Complete Setup Wizard
The system will guide you through:

1. **Database Setup** - Click "Setup Database"
2. **Create Admin** - Enter username/password
3. **Enter License** - Paste your license key
4. **Login** - Use your admin credentials

**Done!** You're ready to add devices.

---

## 📋 What You Need

- ✅ Docker installed
- ✅ License key from [portal.itsupport.com.bd](https://portal.itsupport.com.bd)
- ✅ Network access to portal for license verification

---

## 🔑 Getting a License Key

1. Visit: https://portal.itsupport.com.bd
2. Register → Purchase AMPNM → Get License Key
3. Format: `XXXX-XXXX-XXXX-XXXX`

---

## ❓ Common Issues

### "License Expired" on First Install
**Fixed!** This should no longer happen. If you see it:
- Navigate directly to: `http://YOUR_IP:2266/license_setup.php`
- Enter your license key

### Cannot Connect to Portal
Check your network:
```bash
ping portal.itsupport.com.bd
```

### Invalid License Key
- Double-check for typos
- Verify license is active in portal
- Contact support if issue persists

---

## 📚 Full Documentation

- **Setup Guide:** `/docker-ampnm/SETUP_GUIDE.md`
- **Technical Flow:** `/docker-ampnm/INSTALLATION_FLOW.md`
- **User Manual:** `http://YOUR_IP:2266/documentation.php`

---

## 🆘 Support

**Portal Support:** https://portal.itsupport.com.bd/support.php

---

## 🔒 License Info

- **Verification:** Every 5 minutes
- **Offline Mode:** 30 days maximum
- **Grace Period:** 7 days after expiration

---

**AMPNM** - Advanced Multi-Protocol Network Monitor
© 2024 ITSupport.com.bd
