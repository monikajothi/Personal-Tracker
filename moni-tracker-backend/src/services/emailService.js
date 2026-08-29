import nodemailer from "nodemailer";

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  return transporter;
}

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const tx = getTransporter();

  // No SMTP configured yet — log the link so the flow is fully testable
  // during development without needing an email provider set up first.
  if (!tx) {
    console.log(`\n🔑 Password reset link for ${toEmail}:\n${resetUrl}\n`);
    return;
  }

  await tx.sendMail({
    from: process.env.SMTP_FROM || `"Wellness Tracker" <no-reply@wellnesstracker.app>`,
    to: toEmail,
    subject: "Reset your Wellness Tracker password",
    text: `Someone requested a password reset for your account. If this was you, use the link below (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <p>Someone requested a password reset for your account.</p>
        <p><a href="${resetUrl}" style="display:inline-block; padding:12px 20px; background:#C97B84; color:#fff; border-radius:10px; text-decoration:none;">Reset your password</a></p>
        <p style="font-size:12.5px; color:#888;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}