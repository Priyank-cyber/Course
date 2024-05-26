const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'shanice.rad@gmail.com',
        pass: 'htkr ukne mqzp wsre'
    }
});

const sendConfirmationEmail = (to, token) => {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: to,
        subject: 'Account Confirmation',
        text: `Please confirm your account by clicking the following link: http://localhost:3000/confirm/${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending confirmation email:', error);
            return false;
        }
        console.log('Confirmation email sent:', info.response);
        return true;
    });
};

module.exports = sendConfirmationEmail;
