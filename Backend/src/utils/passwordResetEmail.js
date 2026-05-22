import { sendEmail } from "./emailService.js";

export function buildPasswordResetUrl(token) {
  const base =
    process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:5173";
  return `${base}/reset-password/${token}`;
}

export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = buildPasswordResetUrl(token);

  await sendEmail({
    to,
    subject: "Reset your Inkwell password",
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your password. Click the link below:</p>
      <p><a href="${resetUrl}">Reset my password</a></p>
      <p>Or copy this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `,
    text: `Hi ${name},\n\nReset your password: ${resetUrl}\n\nExpires in 1 hour.`,
  });

  return resetUrl;
}
