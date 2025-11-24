<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IT Support Network Monitor - License Portal</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <?php
    session_start();
    require_once 'config.php';
    require_once 'functions.php';

    $page = isset($_GET['page']) ? $_GET['page'] : 'home';
    ?>

    <nav class="bg-blue-600 text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center space-x-3">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span class="text-xl font-bold">IT Support Network Monitor</span>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="?page=home" class="hover:text-blue-200">Home</a>
                    <a href="?page=purchase" class="hover:text-blue-200">Purchase License</a>
                    <?php if (isset($_SESSION['admin'])): ?>
                        <a href="?page=admin" class="hover:text-blue-200">Admin</a>
                        <a href="?page=logout" class="hover:text-blue-200">Logout</a>
                    <?php else: ?>
                        <a href="?page=login" class="hover:text-blue-200">Login</a>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <?php
        switch ($page) {
            case 'home':
                include 'pages/home.php';
                break;
            case 'purchase':
                include 'pages/purchase.php';
                break;
            case 'activate':
                include 'pages/activate.php';
                break;
            case 'admin':
                if (isset($_SESSION['admin'])) {
                    include 'pages/admin.php';
                } else {
                    header('Location: ?page=login');
                    exit;
                }
                break;
            case 'login':
                include 'pages/login.php';
                break;
            case 'logout':
                session_destroy();
                header('Location: ?page=home');
                exit;
                break;
            default:
                include 'pages/home.php';
        }
        ?>
    </main>

    <footer class="bg-gray-800 text-white mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="text-center">
                <p>&copy; <?php echo date('Y'); ?> portal.itsupport.com.bd - All rights reserved</p>
                <p class="text-sm text-gray-400 mt-2">Network Monitoring Solution</p>
            </div>
        </div>
    </footer>
</body>
</html>
