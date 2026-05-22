import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ENV_FILE_PATH = path.resolve(__dirname, "../../.env");

let transporter = null;

/** Mask email for logs, e.g. ar***@gmail.com */
export function maskEmail(email = "") {
  if (!email || !email.includes("@")) return "(not set)";
  const [local, domain] = email.split("@");
  const visible = local.length <= 2 ? "*" : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

/**
 * Normalize SMTP password from .env.
 * - Trims whitespace
 * - Removes spaces (Gmail app passwords are 16 chars; spaces are display-only)
 */
export function normalizeSmtpPass(pass = "") {
  return pass.trim().replace(/\s+/g, "");
}

/** Safe diagnostics — never returns password values. */
export function getSmtpDiagnostics() {
  const rawPass = process.env.SMTP_PASS ?? "";
  const normalizedPass = normalizeSmtpPass(rawPass);
  const envFileExists = fs.existsSync(ENV_FILE_PATH);
  const { host, port, secure, auth, from } = getSmtpConfigSafe();

  return {
    dotenv: {
      cwd: process.cwd(),
      envFilePath: ENV_FILE_PATH,
      envFileExists,
      SMTP_HOST_set: !!process.env.SMTP_HOST,
      SMTP_USER_set: !!process.env.SMTP_USER,
      SMTP_PASS_set: !!rawPass,
      SMTP_FROM_set: !!process.env.SMTP_FROM,
    },
    smtp: {
      user: maskEmail(process.env.SMTP_USER),
      from: maskEmail(from),
      host: process.env.SMTP_HOST ?? null,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      passRawLength: rawPass.length,
      passNormalizedLength: normalizedPass.length,
      passHadWhitespace: /\s/.test(rawPass),
      passLooksLikeGmailAppPassword: normalizedPass.length === 16,
    },
    transporter: {
      mode: host?.includes("gmail.com") ? "gmail-service-preset" : "custom-smtp",
      host,
      port,
      secure,
      authUser: maskEmail(auth?.user),
      authPassSet: !!auth?.pass,
    },
  };
}

/** getSmtpConfig without throwing — for diagnostics only. */
function getSmtpConfigSafe() {
  try {
    return getSmtpConfig();
  } catch {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER?.trim(),
        pass: normalizeSmtpPass(process.env.SMTP_PASS ?? ""),
      },
      from: (process.env.SMTP_FROM || process.env.SMTP_USER)?.trim(),
    };
  }
}

/** Safe SMTP debug logs (never logs password value). */
export function logSmtpDebug() {
  console.log("[SMTP] diagnostics:", getSmtpDiagnostics());
}

function getSmtpConfig() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_PORT, SMTP_SECURE, SMTP_FROM } =
    process.env;

  const pass = normalizeSmtpPass(SMTP_PASS);

  if (!SMTP_HOST || !SMTP_USER || !pass) {
    throw new Error(
      "SMTP configuration incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env"
    );
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: SMTP_SECURE === "true",
    requireTLS: true,
    auth: {
      user: SMTP_USER.trim(),
      pass,
    },
    from: (SMTP_FROM || SMTP_USER).trim(),
  };
}

function getTransporter() {
  if (transporter) return transporter;

  const { host, port, secure, requireTLS, auth } = getSmtpConfig();
  const isGmail = host?.includes("gmail.com");

  transporter = nodemailer.createTransport(
    isGmail
      ? { service: "gmail", auth }
      : { host, port, secure, requireTLS, auth }
  );

  return transporter;
}

export function resetSmtpTransporter() {
  transporter = null;
}

export async function sendEmail({ to, subject, html, text }) {
  if (!to || !subject || !html) {
    throw new Error("sendEmail requires to, subject, and html");
  }

  logSmtpDebug();

  const { from } = getSmtpConfig();
  const mailer = getTransporter();

  return mailer.sendMail({
    from,
    to,
    subject,
    html,
    ...(text && { text }),
  });
}

export async function verifyEmailConnection() {
  logSmtpDebug();
  resetSmtpTransporter();
  const mailer = getTransporter();
  return mailer.verify();
}
