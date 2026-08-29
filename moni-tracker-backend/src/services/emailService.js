// Uses Brevo's transactional email HTTP API instead of SMTP.
// Render blocks outbound SMTP connections (confirmed via ENETUNREACH/
// ETIMEDOUT on port 587) — this sidesteps that entirely since it's a
// normal HTTPS POST request, the same kind of call this app already
// makes to MongoDB Atlas and everywhere else.

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendPasswordResetEmail(toEmail, resetUrl) {
  const apiKey = process.env.BREVO_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  // No API key configured yet — log the link so the flow is fully
  // testable during development without needing the email provider set up.
  if (!apiKey || !fromEmail) {
    console.log(`\n🔑 Password reset link for ${toEmail}:\n${resetUrl}\n`);
    return;
  }

  const res = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { name: "Wellness Tracker", email: fromEmail },
      to: [{ email: toEmail }],
      subject: "Reset your Wellness Tracker password",
      textContent: `The Request for a password reset for your account. If this was you, use the link below (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <p>Someone requested a password reset for your account.</p>
          <p><a href="${resetUrl}" style="display:inline-block; padding:12px 20px; background:#C97B84; color:#fff; border-radius:10px; text-decoration:none;">Reset your password</a></p>
          <p style="font-size:12.5px; color:#888;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error (${res.status}): ${body}`);
  }
}