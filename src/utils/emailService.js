const nodemailer = require('nodemailer');
const Tenant = require('../modules/tenant/tenant.model');

/**
 * Helper to dispatch emails via SMTP.
 */
const sendEmail = async ({ to, subject, html, tenantId }) => {
  try {
    let host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
    let port = parseInt(process.env.SMTP_PORT) || 2525;
    let user = process.env.SMTP_USER || '';
    let pass = process.env.SMTP_PASS || '';
    let from = process.env.SMTP_FROM || '"Workly HRMS" <noreply@hrms.com>';

    // If tenantId is provided, look up tenant's emailConfig
    if (tenantId) {
      const tenant = await Tenant.findById(tenantId).lean();
      if (tenant && tenant.emailConfig?.senderEmail && tenant.emailConfig?.senderPassword) {
        host = 'smtp.gmail.com';
        port = 465; // secure Gmail SMTP port
        user = tenant.emailConfig.senderEmail;
        pass = tenant.emailConfig.senderPassword;
        from = `"${tenant.name || 'Workly'}" <${tenant.emailConfig.senderEmail}>`;
      }
    }

    const transportConfig = {
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    // If using Gmail, use Nodemailer's built-in service shortcut to prevent TLS handshake/port mismatch errors
    if (host === 'smtp.gmail.com' || user.endsWith('@gmail.com')) {
      transportConfig.service = 'gmail';
    } else {
      transportConfig.host = host;
      transportConfig.port = port;
      transportConfig.secure = port === 465;
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
      from,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    
    // Print the email content to the console log for development testing
    console.log('\n==================================================');
    console.log('📬  [DEVELOPMENT EMAIL FALLBACK LOG]');
    console.log(`👉  To:      ${to}`);
    console.log(`👉  Subject: ${subject}`);
    console.log('👉  Body (HTML):');
    console.log(html);
    console.log('==================================================\n');

    // Don't crash in non-production environments
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
};

module.exports = { sendEmail };
