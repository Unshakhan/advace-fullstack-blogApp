import crypto from "crypto";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/verificationEmail.js";
import { maskEmail } from "../utils/emailService.js";

const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000;

function createVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const verificationTokenExpires = new Date(Date.now() + VERIFICATION_EXPIRY_MS);
  return { token, hashedToken, verificationTokenExpires };
}

const SignUp = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!email || !password || !name || !role) {
      return res.json({
        status: false,
        message: "required feilds",
      });
    }

    const hashPass = await bcrypt.hash(req.body.password, 10);
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({
        status: false,
        msg: "Email already exist",
      });
    }

    const { token, hashedToken, verificationTokenExpires } =
      createVerificationToken();

    const userData = {
      name,
      email,
      password: hashPass,
      role,
      isVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpires,
    };
    const user = new User(userData);
    await user.save();

    let verifyUrl;
    try {
      verifyUrl = await sendVerificationEmail({ to: email, name, token });
      console.log(
        `[signup] Verification email sent to ${maskEmail(email)}`
      );
    } catch (emailErr) {
      console.error("[signup] Verification email failed:", emailErr.message);
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        status: false,
        message: "Account could not be created. Verification email failed to send.",
      });
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[signup] Dev verification link:", verifyUrl);
    }

    res.status(201).json({
      status: true,
      message: `Signup successful. We sent a verification link to ${email}. Check inbox and spam, then log in.`,
      ...(process.env.NODE_ENV !== "production" && { devVerifyUrl: verifyUrl }),
    });
  } catch (err) {
    res.json({
      status: false,
      message: err.message,
    });
  }
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "No account found with this email",
      });
    }

    if (user.isVerified === true) {
      return res.json({
        status: true,
        message: "Email is already verified. You can log in.",
      });
    }

    const { token, hashedToken, verificationTokenExpires } =
      createVerificationToken();
    user.verificationToken = hashedToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    const verifyUrl = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token,
    });
    console.log(
      `[resend] Verification email sent to ${maskEmail(user.email)}`
    );
    if (process.env.NODE_ENV !== "production") {
      console.log("[resend] Dev verification link:", verifyUrl);
    }

    res.json({
      status: true,
      message: `Verification email sent to ${email}. Check inbox and spam.`,
      ...(process.env.NODE_ENV !== "production" && { devVerifyUrl: verifyUrl }),
    });
  } catch (error) {
    console.error("[resend] Failed:", error.message);
    res.status(500).json({
      status: false,
      message: "Could not send verification email. Try again later.",
    });
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    if (!token) {
      return res.status(400).json({
        status: false,
        message: "Verification token is required",
      });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() },
    }).select("+verificationToken +verificationTokenExpires");

    if (!user) {
      return res.status(400).json({
        status: false,
        message: "Invalid or expired verification link",
      });
    }

    if (user.isVerified) {
      return res.json({
        status: true,
        message: "Email already verified. You can log in.",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      status: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.json({
        status: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        status: false,
        message: "User not found",
      });
    }

    if (user.isVerified !== true) {
      return res.status(403).json({
        status: false,
        message:
          "Please verify your email before logging in. Check your inbox/spam for the verification link.",
        needsVerification: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
      });

      const { password: _, verificationToken, verificationTokenExpires, ...safeUser } =
        user.toObject();

      return res.json({
        status: true,
        message: "Login successful",
        token: token,
        user: safeUser,
      });
    } else {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }
  } catch (error) {
    console.log("Login error:", error.message);
    res.json({
      status: false,
      message: error.message,
    });
  }
};

const Logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.json({
      status: true,
      message: "user logout successfully",
    });
  } catch (error) {
    res.json({
      status: false,
      message: error.message,
    });
  }
};

const AllUsers = async (req, res) => {
  try {
    const user = await User.find().select("-password -verificationToken -verificationTokenExpires");
    res.json({
      status: true,
      message: "user fetched successfully",
      data: user,
    });
  } catch (error) {
    console.log("error in fetching user-->", error.message);

    res.json({
      status: false,
      message: error.message,
    });
  }
};

const GetUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user._id.toString() !== id) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized access",
      });
    }

    const { password, verificationToken, verificationTokenExpires, ...safeUser } =
      req.user.toObject();

    res.json({
      status: true,
      message: "user fetched successfully",
      data: safeUser,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user._id.toString() != id) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized access",
      });
    }

    delete req.body.isVerified;
    delete req.body.verificationToken;
    delete req.body.verificationTokenExpires;
    delete req.body.resetPasswordToken;
    delete req.body.resetPasswordExpires;
    delete req.body.email;

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
    }).select("-password -verificationToken -verificationTokenExpires");

    res.json({
      status: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    if (req.user._id.toString() != id) {
      return res.status(403).json({
        status: false,
        message: "Unauthorized access",
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      status: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error.message);

    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

export {
  SignUp,
  Login,
  Logout,
  AllUsers,
  GetUser,
  updateUser,
  deleteUser,
  verifyEmail,
  resendVerification,
};
