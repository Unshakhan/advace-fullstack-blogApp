import crypto from "crypto";

export function createSecureToken(expiryMs) {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + expiryMs);
  return { token, hashedToken, expiresAt };
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
