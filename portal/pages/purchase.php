<?php
$plans = getPricingPlans();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $plan_key = $_POST['plan'];
    $plan = $plans[$plan_key];

    $order_data = [
        'name' => $_POST['name'],
        'email' => $_POST['email'],
        'company' => $_POST['company'],
        'phone' => $_POST['phone'],
        'plan' => $plan['name'],
        'amount' => $plan['price']
    ];

    $order_id = createOrder($order_data);

    $success_message = "Order placed successfully! Order ID: #" . $order_id;
    $success_message .= "<br>We will contact you shortly for payment and license delivery.";
}
?>

<div class="max-w-6xl mx-auto">
    <h1 class="text-4xl font-bold text-gray-900 mb-8 text-center">Choose Your Plan</h1>

    <?php if (isset($success_message)): ?>
        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <?php echo $success_message; ?>
        </div>
    <?php endif; ?>

    <div class="grid md:grid-cols-3 gap-8 mb-12">
        <?php foreach ($plans as $key => $plan): ?>
            <div class="bg-white rounded-lg shadow-lg p-8 <?php echo $key === 'professional' ? 'ring-2 ring-blue-600 transform scale-105' : ''; ?>">
                <?php if ($key === 'professional'): ?>
                    <div class="bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                        POPULAR
                    </div>
                <?php endif; ?>

                <h3 class="text-2xl font-bold text-gray-900 mb-2"><?php echo $plan['name']; ?></h3>
                <div class="mb-6">
                    <span class="text-4xl font-bold text-gray-900">৳<?php echo number_format($plan['price']); ?></span>
                    <span class="text-gray-600">/year</span>
                </div>

                <ul class="space-y-3 mb-8">
                    <?php foreach ($plan['features'] as $feature): ?>
                        <li class="flex items-start space-x-2">
                            <svg class="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span class="text-gray-700"><?php echo $feature; ?></span>
                        </li>
                    <?php endforeach; ?>
                </ul>

                <button
                    onclick="showOrderForm('<?php echo $key; ?>')"
                    class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                    Purchase Now
                </button>
            </div>
        <?php endforeach; ?>
    </div>

    <div id="orderFormModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Place Order</h2>
                <button onclick="hideOrderForm()" class="text-gray-500 hover:text-gray-700">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <form method="POST">
                <input type="hidden" id="selectedPlan" name="plan" value="">

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input type="text" name="name" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                        <input type="email" name="email" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                        <input type="text" name="company" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                        <input type="tel" name="phone" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>

                    <button type="submit" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                        Submit Order
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
function showOrderForm(plan) {
    document.getElementById('selectedPlan').value = plan;
    document.getElementById('orderFormModal').classList.remove('hidden');
}

function hideOrderForm() {
    document.getElementById('orderFormModal').classList.add('hidden');
}
</script>
