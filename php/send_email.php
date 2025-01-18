<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Obtener los datos del formulario
    $subject = htmlspecialchars($_POST['subject']);
    $reply_email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $from_email = "contact@aleremu.dev";
    $body = htmlspecialchars($_POST['body']);

    // Dirección de correo del destinatario
    $to_email = 'contact@aleremu.dev';

    // Asunto del correo
    $email_subject = "New Contact Form Submission: $subject";

    // Cuerpo del correo
    $email_body = "You have received a new message from your website contact form.\n\n".
                  "Here are the details:\n\n".
                  "Subject: $subject\n".
                  "Email: $reply_email\n\n".
                  "Message:\n$body";

    // Cabeceras del correo
    $headers = "From: $from_email\r\n";
    $headers .= "Reply-To: $reply_email\r\n";
    $headers .= "X-Mailer: PHP/".phpversion();

    // Enviar el correo
    if (mail($to_email, $email_subject, $email_body, $headers)) {
        echo "Message sent successfully!";
    } else {
        echo "There was an error sending your message.";
    }
} else {
    echo "There was an error with your submission, please try again.";
}
?>
