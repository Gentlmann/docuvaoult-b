const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (toEmail, resetLink) => {
  const { data, error } = await resend.emails.send({
    from: 'DocuVault <onboarding@resend.dev>',
    to: toEmail,
    subject: 'Reset your DocuVault password',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset for your DocuVault account.</p>
        <p>Click the button below to set a new password. This link expires in 30 minutes.</p>
        <a href="${resetLink}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    // Ku daabac error-ka SAXDA AH server console-ka - kani ayaa kuu sheegi doona sababta
    console.error('--- RESEND FAILED TO SEND EMAIL ---');
    console.error(error);
    throw new Error(`Failed to send reset email: ${error.message || JSON.stringify(error)}`);
  }

  console.log('Email sent successfully. Resend id:', data?.id);
  return data;
};

module.exports = { sendPasswordResetEmail };