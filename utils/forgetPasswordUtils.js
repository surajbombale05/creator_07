const nodeMailer = require('nodemailer');
require('dotenv').config();

async function sendForgotPasswordEmail(email, newPassword) {
    try {
        const transporter = nodeMailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: process.env.NODE_MAILER_EMAIL, 
                pass: process.env.NODE_MAILER_PASSWORD
            }
        });
        

        const mailOptions = {
            from: process.env.NODE_MAILER_EMAIL, 
            to: email, 
            subject: 'Password For Creator-07', 
            text: `Your password is: ${newPassword}`,
            html: `<p>Your password is: <strong>${newPassword}</strong></p>
            <img src="http://139.59.12.22:3050/1711607880774-.jpeg" alt="Your Image" width="200" height="150">
            `
            
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, message: 'Password email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, message: 'Error sending email' };
    }
}

module.exports = {sendForgotPasswordEmail};

