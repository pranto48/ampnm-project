<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $license_key = $_POST['license_key'];
    $license = getLicenseByKey($license_key);

    if ($license) {
        $is_expired = $license['expiry_date'] && strtotime($license['expiry_date']) < time();
    }
}
?>

<div class="max-w-2xl mx-auto">
    <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Activate Your License</h1>

    <div class="bg-white rounded-lg shadow-md p-8">
        <form method="POST" class="space-y-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">License Key</label>
                <input
                    type="text"
                    name="license_key"
                    placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                    required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg"
                >
            </div>

            <button
                type="submit"
                class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
                Verify License
            </button>
        </form>

        <?php if (isset($license)): ?>
            <?php if ($license && $license['status'] === 'active' && !$is_expired): ?>
                <div class="mt-6 bg-green-100 border border-green-400 rounded-lg p-6">
                    <div class="flex items-center space-x-3 mb-4">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 class="text-xl font-semibold text-green-900">Valid License</h3>
                    </div>

                    <div class="space-y-2 text-gray-700">
                        <p><strong>Customer:</strong> <?php echo htmlspecialchars($license['customer_name']); ?></p>
                        <?php if ($license['company_name']): ?>
                            <p><strong>Company:</strong> <?php echo htmlspecialchars($license['company_name']); ?></p>
                        <?php endif; ?>
                        <p><strong>Max Hosts:</strong> <?php echo $license['max_hosts']; ?></p>
                        <p><strong>Expiry Date:</strong> <?php echo date('F j, Y', strtotime($license['expiry_date'])); ?></p>
                        <p><strong>Status:</strong> <span class="text-green-600 font-semibold">Active</span></p>
                    </div>

                    <div class="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                        <h4 class="font-semibold text-blue-900 mb-2">Activation Instructions:</h4>
                        <ol class="list-decimal list-inside space-y-1 text-sm text-blue-800">
                            <li>Install the Network Monitor application</li>
                            <li>Run the application (npm start or docker-compose up)</li>
                            <li>The application will automatically validate your license</li>
                            <li>If manual activation is needed, use the license API endpoint</li>
                        </ol>
                    </div>
                </div>
            <?php elseif ($is_expired): ?>
                <div class="mt-6 bg-red-100 border border-red-400 rounded-lg p-6">
                    <div class="flex items-center space-x-3 mb-2">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 class="text-xl font-semibold text-red-900">License Expired</h3>
                    </div>
                    <p class="text-red-700">This license expired on <?php echo date('F j, Y', strtotime($license['expiry_date'])); ?>.</p>
                    <p class="text-red-700 mt-2">Please contact support to renew your license.</p>
                </div>
            <?php else: ?>
                <div class="mt-6 bg-yellow-100 border border-yellow-400 rounded-lg p-6">
                    <div class="flex items-center space-x-3 mb-2">
                        <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        <h3 class="text-xl font-semibold text-yellow-900">License Inactive</h3>
                    </div>
                    <p class="text-yellow-700">This license is not currently active.</p>
                </div>
            <?php endif; ?>
        <?php endif; ?>

        <?php if (isset($_POST['license_key']) && !$license): ?>
            <div class="mt-6 bg-red-100 border border-red-400 rounded-lg p-6">
                <div class="flex items-center space-x-3">
                    <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <div>
                        <h3 class="text-xl font-semibold text-red-900">Invalid License Key</h3>
                        <p class="text-red-700">The license key you entered was not found.</p>
                    </div>
                </div>
            </div>
        <?php endif; ?>
    </div>

    <div class="mt-8 bg-gray-100 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
        <p class="text-gray-700 mb-2">If you're having trouble activating your license, please contact us:</p>
        <ul class="space-y-1 text-gray-700">
            <li><strong>Email:</strong> support@itsupport.com.bd</li>
            <li><strong>Phone:</strong> +880 XXX-XXXXXX</li>
        </ul>
    </div>
</div>
