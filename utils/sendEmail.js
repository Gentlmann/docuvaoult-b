const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const layout = (title, bodyHtml) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
    <h2 style="margin-bottom: 8px;">${title}</h2>
    ${bodyHtml}
    <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">DocuVault — Secure Document Management</p>
  </div>
`;

const button = (href, label) => `
  <a href="${href}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
    ${label}
  </a>
`;

const send = ({ to, subject, html }) =>
  transporter.sendMail({
    from: `"DocuVault" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

// Never throws — a failed email must not break registration or approval
const sendEmailSafe = async (options) => {
  try {
    await send(options);
  } catch (error) {
    console.error(`Email to ${options.to} failed:`, error.message);
  }
};

// This one throws on purpose; forgotPassword catches and logs it
const sendPasswordResetEmail = (toEmail, resetLink) =>
  send({
    to: toEmail,
    subject: 'Reset your DocuVault password',
    html: layout(
      'Reset Your Password',
      `<p>You requested a password reset for your DocuVault account.</p>
       <p>Click the button below to set a new password. This link expires in 30 minutes.</p>
       ${button(resetLink, 'Reset Password')}
       <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>`
    ),
  });

const sendRegistrationReceivedEmail = (toEmail, adminName, officeName) =>
  sendEmailSafe({
    to: toEmail,
    subject: 'We received your DocuVault registration',
    html: layout(
      'Registration received',
      `<p>Hello ${escapeHtml(adminName)},</p>
       <p>Thank you for registering <strong>${escapeHtml(officeName)}</strong> on DocuVault.</p>
       <p>Your registration is now waiting for approval. We will email you as soon as it has been reviewed. You will not be able to sign in until then.</p>`
    ),
  });

const sendOfficeApprovedEmail = (toEmail, adminName, officeName) =>
  sendEmailSafe({
    to: toEmail,
    subject: 'Your DocuVault office has been approved',
    html: layout(
      'Your office is approved',
      `<p>Hello ${escapeHtml(adminName)},</p>
       <p>Good news — <strong>${escapeHtml(officeName)}</strong> has been approved. You can sign in now with the email and password you registered with.</p>
       ${button(`${process.env.CLIENT_URL}/login`, 'Sign in to DocuVault')}`
    ),
  });

const sendOfficeRejectedEmail = (toEmail, adminName, officeName, reason) =>
  sendEmailSafe({
    to: toEmail,
    subject: 'Update on your DocuVault registration',
    html: layout(
      'Registration not approved',
      `<p>Hello ${escapeHtml(adminName)},</p>
       <p>We were unable to approve the registration for <strong>${escapeHtml(officeName)}</strong>.</p>
       <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
       <p>If you believe this is a mistake, please contact us.</p>`
    ),
  });

// Optional heads-up to the platform owner. Only sends if ADMIN_NOTIFY_EMAIL is set in .env
const sendNewRegistrationNotice = (officeName, adminName, applicantEmail) => {
  if (!process.env.ADMIN_NOTIFY_EMAIL) return Promise.resolve();
  return sendEmailSafe({
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: 'New office registration waiting for approval',
    html: layout(
      'New registration',
      `<p><strong>${escapeHtml(officeName)}</strong> has registered and is waiting for your review.</p>
       <p>Contact: ${escapeHtml(adminName)} (${escapeHtml(applicantEmail)})</p>
       ${button(`${process.env.CLIENT_URL}/offices`, 'Review in DocuVault')}`
    ),
  });
};

module.exports = {
  sendPasswordResetEmail,
  sendRegistrationReceivedEmail,
  sendOfficeApprovedEmail,
  sendOfficeRejectedEmail,
  sendNewRegistrationNotice,
};