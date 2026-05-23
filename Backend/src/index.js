import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ENV_PATH = path.resolve(__dirname, "../.env")
const dotenvResult = dotenv.config({ path: ENV_PATH })

console.log("[env] startup:", {
  cwd: process.cwd(),
  envPath: ENV_PATH,
  envFileExists: fs.existsSync(ENV_PATH),
  loaded: !dotenvResult.error,
  varsParsed: dotenvResult.parsed ? Object.keys(dotenvResult.parsed).length : 0,
  error: dotenvResult.error?.message ?? null,
})

import express from "express"
import connectDb from "./config/connect-DB.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import authRoute from "./routes/authRoutes.js"
import blogRoute from "./routes/blogRoutes.js"
import {
  sendEmail,
  getSmtpDiagnostics,
  verifyEmailConnection,
  resetSmtpTransporter,
} from "./utils/emailService.js"

const TEST_EMAIL = process.env.SMTP_USER

const app = express()

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'https://advace-fullstack-blog-app-g1tb.vercel.app',  // production
    ]
    // Sare Vercel preview URLs allow karo automatically
    if (!origin || allowedOrigins.includes(origin) || 
        /https:\/\/advace-fullstack-blog-app.*\.vercel\.app$/.test(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("helooo")
})

/** Safe SMTP diagnostics — no secrets, no email send. */
app.get("/test-smtp-debug", async (req, res) => {
  const diagnostics = getSmtpDiagnostics()
  let verify = { ok: false, error: null }
  try {
    resetSmtpTransporter()
    await verifyEmailConnection()
    verify = { ok: true, error: null }
  } catch (err) {
    verify = { ok: false, error: err.message }
  }
  res.json({ diagnostics, verify })
})

app.get("/test-email", async (req, res) => {
  const diagnostics = getSmtpDiagnostics()
  try {
    const info = await sendEmail({
      to: TEST_EMAIL,
      subject: "Inkwell — Test Email",
      html: "<p>If you received this, SMTP is working.</p>",
      text: "If you received this, SMTP is working.",
    })
    res.json({
      status: true,
      message: "Test email sent successfully",
      to: TEST_EMAIL,
      messageId: info.messageId,
    })
  } catch (error) {
    const isAuthError = /535|BadCredentials|Invalid login/i.test(error.message)
    res.status(500).json({
      status: false,
      message: "Failed to send test email",
      error: error.message,
      diagnostics,
      ...(isAuthError && {
        hint:
          "Gmail rejected credentials (535). This is NOT a missing POST body — use GET only. Fix on Google: enable 2-Step Verification → create App Password → paste 16 chars into .env SMTP_PASS (no spaces) → save .env → restart server. If it still fails, check https://myaccount.google.com/security for blocked sign-in alerts.",
      }),
    })
  }
})

app.use("/api/v1/auth", authRoute)
app.use("/api/v1/blog", blogRoute)

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDb()
    app.listen(PORT, () => {
      console.log(`Server is running on ${PORT}`)
    })
  } catch (err) {
    console.error("Failed to start server:", err.message)
    process.exit(1)
  }
}

startServer()