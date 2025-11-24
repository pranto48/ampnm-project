<?php
function createLicense($customer_name, $customer_email, $company_name, $max_hosts, $duration_months) {
    global $db;

    $license_key = generateLicenseKey();
    $expiry_date = date('Y-m-d', strtotime("+$duration_months months"));

    $stmt = $db->prepare('
        INSERT INTO licenses (license_key, customer_name, customer_email, company_name, max_hosts, expiry_date, status)
        VALUES (:license_key, :customer_name, :customer_email, :company_name, :max_hosts, :expiry_date, "active")
    ');

    $stmt->bindValue(':license_key', $license_key, SQLITE3_TEXT);
    $stmt->bindValue(':customer_name', $customer_name, SQLITE3_TEXT);
    $stmt->bindValue(':customer_email', $customer_email, SQLITE3_TEXT);
    $stmt->bindValue(':company_name', $company_name, SQLITE3_TEXT);
    $stmt->bindValue(':max_hosts', $max_hosts, SQLITE3_INTEGER);
    $stmt->bindValue(':expiry_date', $expiry_date, SQLITE3_TEXT);

    $stmt->execute();

    return $license_key;
}

function getLicenseByKey($license_key) {
    global $db;

    $stmt = $db->prepare('SELECT * FROM licenses WHERE license_key = :key');
    $stmt->bindValue(':key', $license_key, SQLITE3_TEXT);
    $result = $stmt->execute();

    return $result->fetchArray(SQLITE3_ASSOC);
}

function getAllLicenses() {
    global $db;

    $result = $db->query('SELECT * FROM licenses ORDER BY created_at DESC');
    $licenses = [];

    while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
        $licenses[] = $row;
    }

    return $licenses;
}

function createOrder($data) {
    global $db;

    $stmt = $db->prepare('
        INSERT INTO orders (customer_name, customer_email, company_name, phone, plan, amount, status)
        VALUES (:name, :email, :company, :phone, :plan, :amount, "pending")
    ');

    $stmt->bindValue(':name', $data['name'], SQLITE3_TEXT);
    $stmt->bindValue(':email', $data['email'], SQLITE3_TEXT);
    $stmt->bindValue(':company', $data['company'], SQLITE3_TEXT);
    $stmt->bindValue(':phone', $data['phone'], SQLITE3_TEXT);
    $stmt->bindValue(':plan', $data['plan'], SQLITE3_TEXT);
    $stmt->bindValue(':amount', $data['amount'], SQLITE3_FLOAT);

    $stmt->execute();

    return $db->lastInsertRowID();
}

function getPricingPlans() {
    return [
        'starter' => [
            'name' => 'Starter',
            'hosts' => 10,
            'duration' => 12,
            'price' => 4999,
            'features' => [
                'Up to 10 hosts',
                'Unlimited services',
                'Real-time monitoring',
                'Email alerts',
                '12 months license',
                'Email support'
            ]
        ],
        'professional' => [
            'name' => 'Professional',
            'hosts' => 50,
            'duration' => 12,
            'price' => 14999,
            'features' => [
                'Up to 50 hosts',
                'Unlimited services',
                'Real-time monitoring',
                'Email & SMS alerts',
                '12 months license',
                'Priority support',
                'Network topology view'
            ]
        ],
        'enterprise' => [
            'name' => 'Enterprise',
            'hosts' => 200,
            'duration' => 12,
            'price' => 39999,
            'features' => [
                'Up to 200 hosts',
                'Unlimited services',
                'Real-time monitoring',
                'Email & SMS alerts',
                '12 months license',
                '24/7 support',
                'Network topology view',
                'Custom integrations',
                'Dedicated account manager'
            ]
        ]
    ];
}

function sendLicenseEmail($email, $license_key, $customer_name) {
    $subject = "Your Network Monitor License Key";
    $message = "
        Dear $customer_name,

        Thank you for purchasing IT Support Network Monitor!

        Your license key is: $license_key

        To activate your license:
        1. Install the application on your server
        2. Open the application in your browser
        3. Go to Settings > License
        4. Enter your license key

        If you have any questions, please contact us at support@itsupport.com.bd

        Best regards,
        IT Support Team
    ";

    $headers = "From: noreply@itsupport.com.bd\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    return mail($email, $subject, $message, $headers);
}
?>
