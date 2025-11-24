<?php
/**
 * AMPNM Script Version - Quick Setup Script
 * This script helps verify and configure the installation
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AMPNM Setup - Script Version</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .container { background: white; border-radius: 15px; padding: 40px; max-width: 700px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
        .subtitle { color: #666; margin-bottom: 30px; font-size: 14px; }
        .check-item { padding: 15px; margin: 10px 0; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; }
        .check-ok { background: #d4edda; border-left: 4px solid #28a745; }
        .check-error { background: #f8d7da; border-left: 4px solid #dc3545; }
        .check-warning { background: #fff3cd; border-left: 4px solid #ffc107; }
        .status { font-weight: bold; padding: 5px 15px; border-radius: 20px; font-size: 12px; }
        .status-ok { background: #28a745; color: white; }
        .status-error { background: #dc3545; color: white; }
        .status-warning { background: #ffc107; color: #000; }
        .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: 600; transition: all 0.3s; }
        .btn:hover { background: #5568d3; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
        .info-box { background: #e7f3ff; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .code { background: #f5f5f5; padding: 10px; border-radius: 5px; font-family: 'Courier New', monospace; font-size: 13px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AMPNM Setup</h1>
        <p class="subtitle">Script Version for XAMPP/LAMP - Installation Verification</p>

        <?php
        $checks = [];

        // Check PHP Version
        $php_version = PHP_VERSION;
        $php_ok = version_compare($php_version, '7.4.0', '>=');
        $checks[] = [
            'name' => 'PHP Version',
            'status' => $php_ok,
            'message' => "PHP $php_version" . ($php_ok ? " ✓" : " (Need 7.4+)"),
            'type' => $php_ok ? 'ok' : 'error'
        ];

        // Check Required Extensions
        $required_extensions = ['pdo', 'pdo_mysql', 'openssl', 'json', 'curl'];
        foreach ($required_extensions as $ext) {
            $loaded = extension_loaded($ext);
            $checks[] = [
                'name' => "Extension: $ext",
                'status' => $loaded,
                'message' => $loaded ? "Loaded ✓" : "Missing ✗",
                'type' => $loaded ? 'ok' : 'error'
            ];
        }

        // Check config.php
        $config_exists = file_exists('config.php');
        $checks[] = [
            'name' => 'Configuration File',
            'status' => $config_exists,
            'message' => $config_exists ? "Found ✓" : "Missing ✗",
            'type' => $config_exists ? 'ok' : 'error'
        ];

        // Check Database Connection
        $db_connected = false;
        $db_message = '';
        if ($config_exists) {
            require_once 'config.php';
            try {
                $pdo = getDbConnection();
                $db_connected = true;
                $db_message = "Connected to " . DB_NAME . " ✓";
            } catch (Exception $e) {
                $db_message = "Connection failed: " . $e->getMessage();
            }
        } else {
            $db_message = "Config file missing";
        }

        $checks[] = [
            'name' => 'Database Connection',
            'status' => $db_connected,
            'message' => $db_message,
            'type' => $db_connected ? 'ok' : 'error'
        ];

        // Check if database is set up
        $db_setup = false;
        if ($db_connected) {
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM `devices`");
                $db_setup = true;
                $device_count = $stmt->fetchColumn();
                $checks[] = [
                    'name' => 'Database Tables',
                    'status' => true,
                    'message' => "Setup complete ($device_count devices) ✓",
                    'type' => 'ok'
                ];
            } catch (Exception $e) {
                $checks[] = [
                    'name' => 'Database Tables',
                    'status' => false,
                    'message' => "Not set up yet",
                    'type' => 'warning'
                ];
            }
        }

        // Check write permissions
        $writable = is_writable('.');
        $checks[] = [
            'name' => 'Directory Permissions',
            'status' => $writable,
            'message' => $writable ? "Writable ✓" : "Not writable ✗",
            'type' => $writable ? 'ok' : 'warning'
        ];

        // Display all checks
        foreach ($checks as $check) {
            $class = $check['type'] == 'ok' ? 'check-ok' : ($check['type'] == 'error' ? 'check-error' : 'check-warning');
            $status_class = $check['type'] == 'ok' ? 'status-ok' : ($check['type'] == 'error' ? 'status-error' : 'status-warning');
            echo "<div class='check-item $class'>";
            echo "<span>{$check['name']}</span>";
            echo "<span class='status $status_class'>{$check['message']}</span>";
            echo "</div>";
        }

        // Show next steps
        $all_ok = true;
        foreach ($checks as $check) {
            if ($check['type'] == 'error') {
                $all_ok = false;
                break;
            }
        }
        ?>

        <div class="info-box">
            <h3 style="margin-bottom: 10px;">📋 Next Steps:</h3>
            <?php if (!$all_ok): ?>
                <p>⚠️ Please fix the errors above before proceeding.</p>
                <div class="code">
                    # Install missing PHP extensions (Ubuntu/Debian):<br>
                    sudo apt install php-mysql php-curl php-json
                </div>
            <?php elseif (!$db_setup): ?>
                <p>✅ System requirements met! Now set up the database:</p>
                <a href="database_setup.php" class="btn">➡️ Setup Database</a>
            <?php else: ?>
                <p>🎉 Everything is ready! You can start using AMPNM:</p>
                <a href="index.php" class="btn">➡️ Go to Dashboard</a>
                <p style="margin-top: 15px; font-size: 13px; color: #666;">
                    Default login: <strong>admin</strong> / <strong>admin123</strong><br>
                    Please change the password after first login!
                </p>
            <?php endif; ?>
        </div>

        <div class="info-box" style="background: #fff9e6; border-color: #ffc107;">
            <h3 style="margin-bottom: 10px;">🔧 Configuration</h3>
            <p><strong>Database Settings (config.php):</strong></p>
            <div class="code">
                Server: <?php echo defined('DB_SERVER') ? DB_SERVER : 'localhost'; ?><br>
                Database: <?php echo defined('DB_NAME') ? DB_NAME : 'network_monitor'; ?><br>
                Username: <?php echo defined('DB_USERNAME') ? DB_USERNAME : 'root'; ?>
            </div>
            <p style="margin-top: 10px; font-size: 13px;">
                Edit <code>config.php</code> to change database settings if needed.
            </p>
        </div>

        <p style="text-align: center; margin-top: 30px; color: #999; font-size: 13px;">
            AMPNM Script Version v1.0 | <a href="https://portal.itsupport.com.bd" style="color: #667eea;">portal.itsupport.com.bd</a>
        </p>
    </div>
</body>
</html>
