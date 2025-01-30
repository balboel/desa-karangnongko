<?php
// Check for empty fields
if (
    empty($_POST['name']) ||
    empty($_POST['email']) ||
    empty($_POST['phone']) ||
    empty($_POST['message']) ||
    !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)
) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields']);
    exit;
}

// Sanitize input data
$name = strip_tags(htmlspecialchars($_POST['name']));
$email_address = strip_tags(htmlspecialchars($_POST['email']));
$phone = strip_tags(htmlspecialchars($_POST['phone']));
$message = strip_tags(htmlspecialchars($_POST['message']));

// Validate email format with stricter regex
if (!preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email_address)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address']);
    exit;
}

// Include PHPMailer library
require_once 'vendor/autoload.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Load environment variables
$dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->Port = 587;
$mail->SMTPSecure = 'tls';
$mail->SMTPAuth = true;
$mail->Username = $_ENV['GMAIL_ADDRESS']; // Get from .env file
$mail->Password = $_ENV['GMAIL_APP_PASSWORD']; // Get from .env file
$mail->SMTPDebug = 2; // Enable debug output

// Set email content
$mail->setFrom($email_address, $name);
$mail->addAddress('belajarmoskov@gmail.com', 'Administrator');
$mail->addReplyTo($email_address, $name);
$mail->Subject = "Website Contact Form: $name";
$mail->Body = "You have received a new message from your website contact form.\n\nHere are the details:\nName: $name\nEmail: $email_address\nPhone: $phone\nMessage:\n$message";

try {
    $mail->send();
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
} catch (Exception $e) {
    http_response_code(500);
    error_log("Mailer Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Message could not be sent. Please try again later']);
}
