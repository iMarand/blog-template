import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export async function sendNewsletter(to, subject, html) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('❌ Mailer not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
        return { success: false, error: 'Mailer not configured' };
    }

    try {
        const info = await transporter.sendMail({
            from: `"${process.env.BLOG_NAME || 'Blog'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html
        });

        console.log('✅ Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error: error.message };
    }
}
