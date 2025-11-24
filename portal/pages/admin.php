<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'generate_license') {
        $license_key = createLicense(
            $_POST['customer_name'],
            $_POST['customer_email'],
            $_POST['company_name'],
            (int)$_POST['max_hosts'],
            (int)$_POST['duration']
        );

        sendLicenseEmail($_POST['customer_email'], $license_key, $_POST['customer_name']);

        $success_message = "License generated successfully: $license_key";
    }
}

$licenses = getAllLicenses();
?>

<h1 class="text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

<?php if (isset($success_message)): ?>
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
        <?php echo $success_message; ?>
    </div>
<?php endif; ?>

<div class="grid md:grid-cols-2 gap-8 mb-8">
    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Generate New License</h2>

        <form method="POST" class="space-y-4">
            <input type="hidden" name="action" value="generate_license">

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                <input type="text" name="customer_name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Customer Email *</label>
                <input type="email" name="customer_email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input type="text" name="company_name" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Max Hosts *</label>
                <input type="number" name="max_hosts" value="10" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Duration (months) *</label>
                <input type="number" name="duration" value="12" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>

            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                Generate License
            </button>
        </form>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Statistics</h2>

        <div class="space-y-4">
            <div class="flex justify-between items-center p-4 bg-blue-50 rounded">
                <span class="font-medium">Total Licenses</span>
                <span class="text-2xl font-bold text-blue-600"><?php echo count($licenses); ?></span>
            </div>

            <div class="flex justify-between items-center p-4 bg-green-50 rounded">
                <span class="font-medium">Active Licenses</span>
                <span class="text-2xl font-bold text-green-600">
                    <?php echo count(array_filter($licenses, fn($l) => $l['status'] === 'active')); ?>
                </span>
            </div>

            <div class="flex justify-between items-center p-4 bg-yellow-50 rounded">
                <span class="font-medium">Expired Licenses</span>
                <span class="text-2xl font-bold text-yellow-600">
                    <?php echo count(array_filter($licenses, fn($l) => $l['expiry_date'] && strtotime($l['expiry_date']) < time())); ?>
                </span>
            </div>
        </div>
    </div>
</div>

<div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-900 mb-4">All Licenses</h2>

    <div class="overflow-x-auto">
        <table class="min-w-full">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Key</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Hosts</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                <?php foreach ($licenses as $license): ?>
                    <?php
                    $is_expired = $license['expiry_date'] && strtotime($license['expiry_date']) < time();
                    $status_class = $is_expired ? 'text-red-600' : ($license['status'] === 'active' ? 'text-green-600' : 'text-gray-600');
                    ?>
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            <?php echo htmlspecialchars($license['license_key']); ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <?php echo htmlspecialchars($license['customer_name']); ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <?php echo htmlspecialchars($license['customer_email']); ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <?php echo $license['max_hosts']; ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">
                            <?php echo $license['expiry_date'] ? date('Y-m-d', strtotime($license['expiry_date'])) : 'Never'; ?>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold <?php echo $status_class; ?>">
                            <?php echo $is_expired ? 'Expired' : ucfirst($license['status']); ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>

        <?php if (empty($licenses)): ?>
            <p class="text-center text-gray-500 py-8">No licenses generated yet</p>
        <?php endif; ?>
    </div>
</div>
