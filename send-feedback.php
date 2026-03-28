<?php
header('Content-Type: application/json');

// Allow CORS (for development)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Your email address
$to_email = "bebarsstudio@gmail.com";

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

// Sanitize inputs
$name = filter_var($data['name'], FILTER_SANITIZE_STRING);
$email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
$type = filter_var($data['type'], FILTER_SANITIZE_STRING);
$subject = filter_var($data['subject'], FILTER_SANITIZE_STRING);
$message = filter_var($data['message'], FILTER_SANITIZE_STRING);
$page_url = filter_var($data['page_url'], FILTER_SANITIZE_URL);
$user_agent = $_SERVER['HTTP_USER_AGENT'];
$ip_address = $_SERVER['REMOTE_ADDR'];

// Map feedback types
$type_map = [
    'bug' => '🐛 Bug Report',
    'feature' => '💡 Feature Suggestion',
    'improvement' => '⚡ Improvement Idea',
    'general' => '📝 General Feedback'
];

$feedback_type = isset($type_map[$type]) ? $type_map[$type] : '📝 General Feedback';

// Email subject
$email_subject = "[BEBARS-GAMING] Feedback: $subject ($feedback_type)";

// Email body
$email_body = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
        .field { margin-bottom: 15px; }
        .field-label { font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .field-value { background: white; padding: 10px; border-radius: 5px; border-left: 3px solid #667eea; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 5px; font-size: 12px; font-weight: bold; }
        .badge-bug { background: #f44336; color: white; }
        .badge-feature { background: #4caf50; color: white; }
        .badge-improvement { background: #ff9800; color: white; }
        .badge-general { background: #2196f3; color: white; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>🎮 New Feedback Received</h2>
            <p>From your portfolio website</p>
        </div>
        <div class='content'>
            <div class='field'>
                <div class='field-label'>👤 Name:</div>
                <div class='field-value'>" . htmlspecialchars($name) . "</div>
            </div>
            <div class='field'>
                <div class='field-label'>📧 Email:</div>
                <div class='field-value'>" . htmlspecialchars($email) . "</div>
            </div>
            <div class='field'>
                <div class='field-label'>📋 Feedback Type:</div>
                <div class='field-value'>
                    <span class='badge badge-" . htmlspecialchars($type) . "'>" . htmlspecialchars($feedback_type) . "</span>
                </div>
            </div>
            <div class='field'>
                <div class='field-label'>📝 Subject:</div>
                <div class='field-value'>" . htmlspecialchars($subject) . "</div>
            </div>
            <div class='field'>
                <div class='field-label'>💬 Message:</div>
                <div class='field-value'>" . nl2br(htmlspecialchars($message)) . "</div>
            </div>
            " . ($page_url ? "
            <div class='field'>
                <div class='field-label'>🔗 Page URL:</div>
                <div class='field-value'><a href='" . htmlspecialchars($page_url) . "' target='_blank'>" . htmlspecialchars($page_url) . "</a></div>
            </div>
            " : "") . "
            <div class='field'>
                <div class='field-label'>🖥️ Browser/OS:</div>
                <div class='field-value'>" . htmlspecialchars($user_agent) . "</div>
            </div>
            <div class='field'>
                <div class='field-label'>🌐 IP Address:</div>
                <div class='field-value'>" . htmlspecialchars($ip_address) . "</div>
            </div>
        </div>
        <div class='footer'>
            <p>This feedback was sent from your portfolio website.</p>
            <p>Reply to: <a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></p>
        </div>
    </div>
</body>
</html>
";

// Email headers
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: " . htmlspecialchars($name) . " <" . htmlspecialchars($email) . ">\r\n";
$headers .= "Reply-To: " . htmlspecialchars($email) . "\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Send email
if (mail($to_email, $email_subject, $email_body, $headers)) {
    echo json_encode(['success' => true, 'message' => 'Feedback sent successfully! I\'ll get back to you soon.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to send feedback. Please try again or email directly.']);
}
?>