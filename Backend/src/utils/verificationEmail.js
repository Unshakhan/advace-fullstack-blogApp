import { sendEmail } from "./emailService.js";

export function buildVerificationUrl(token) {
  const base =
    process.env.FRONTEND_URL?.replace(/\/$/, "") || "http://localhost:5173";
  return `${base}/verify-email/${token}`;
}

export async function sendVerificationEmail({ to, name, token }) {
  const verifyUrl = buildVerificationUrl(token);

  await sendEmail({
    to,
    subject: "Verify your Inkwell account",
    html: `
      <p>Hi ${name},</p>
      <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
      <p><a href="${verifyUrl}">Verify my email</a></p>
      <p>Or copy this link into your browser:</p>
      <p>${verifyUrl}</p>
      <p>This link expires in 24 hours.</p>
    `,
    text: `Hi ${name},\n\nVerify your email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  });

  return verifyUrl;
}
