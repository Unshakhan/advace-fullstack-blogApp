import bcrypt from "bcrypt";
import User from "../models/User.js";
import { createSecureToken, hashToken } from "../utils/secureToken.js";
import { sendPasswordResetEmail } from "../utils/passwordResetEmail.js";
import { maskEmail } from "../utils/emailService.js";

const RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.trim() });
    if (!user) {
      return res.json({
        status: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const { token, hashedToken, expiresAt } = createSecureToken(RESET_EXPIRY_MS);
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expiresAt;
    await user.save();

    const resetUrl = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token,
    });

    console.log(`[forgot-password] Reset email sent to ${maskEmail(user.email)}`);
    if (process.env.NODE_ENV !== "production") {
      console.log("[forgot-password] Dev reset link:", resetUrl);
    }

    res.json({
      status: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
      ...(process.env.NODE_ENV !== "production" && { devResetUrl: resetUrl }),
    });
  } catch (error) {
    console.error("[forgot-password] Error:", error.message);
    res.status(500).json({
      status: false,
      message: "Could not process password reset request",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).json({
        status: false,
        message: "Token and new password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: false,
        message: "Password must be at least 8 characters",
      });
    }

    const hashedToken = hashToken(token);

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select("+resetPasswordToken +resetPasswordExpires");

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired reset link",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      status: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("[reset-password] Error:", error.message);
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export { forgotPassword, resetPassword };
