const nodemailer = require('nodemailer');
require('dotenv').config();

async function run() {
  console.log('Testing SMTP connection with your new Google App Password...');
  console.log(`- User: ${process.env.SMTP_USER}`);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: 'himanshikhatri1109@gmail.com',
    subject: 'Workly HRMS - Active Connection Verified!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">Workly Mail Active!</h2>
        <p>This verification email confirms your Nodemailer and Google App Password configuration is working perfectly.</p>
        <p>All future onboarding invitations and credential reset requests will be delivered directly from this account.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('SUCCESS! The test email has been sent successfully.');
    console.log('Response:', info.response);
  } catch (error) {
    console.error('ERROR ENCOUNTERED DURING SMTP TEST:');
    console.error(error.message);
  }
}

run();
