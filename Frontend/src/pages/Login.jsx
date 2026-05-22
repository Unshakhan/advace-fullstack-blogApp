import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { login, resendVerification } from '../api'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { loginUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const { data } = await login(form)
      if (data.status) {
        loginUser(data.user, data.token)
        toast.success('Welcome back!')
        navigate('/dashboard')
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch (err) {
      if (err?.response?.status === 403 && err?.response?.data?.needsVerification) {
        toast.error(
          'Email not verified yet. Check inbox/spam, or use Resend below — do not use Sign In until verified.',
          { duration: 6000 }
        )
      } else {
        toast.error(err?.response?.data?.message || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async (e) => {
    e?.preventDefault()
    if (!form.email) return toast.error('Enter your email above first')
    setResendLoading(true)
    try {
      const { data } = await resendVerification(form.email)
      if (data.status) {
        toast.success(data.message, { duration: 6000 })
        if (data.devVerifyUrl) {
          console.log('Dev verification link (open in browser):', data.devVerifyUrl)
        }
      } else {
        toast.error(data.message || 'Could not resend email')
      }
    } catch (err) {
      const msg = err?.response?.data?.message
      if (err?.response?.status === 404) {
        toast.error('Backend missing resend route. Restart backend and use local API (Frontend/.env.local).')
      } else {
        toast.error(msg || 'Could not resend email')
      }
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-eyebrow">
          <span />
          Welcome back
        </div>
        <h1 className="auth-title">Sign into<br /><em>Inkwell</em></h1>
        <p className="auth-sub">Continue your writing journey.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="auth-footer" style={{ marginTop: 0, paddingTop: 0, border: 'none' }}>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <p className="auth-hint">Verify your email before signing in.</p>
          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? <span className="form-spinner" /> : null}
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <form className="auth-resend" onSubmit={handleResend}>
          <p className="auth-hint">Didn&apos;t get the verification email? Enter email above, then:</p>
          <button type="submit" className="auth-link-btn auth-resend-btn" disabled={resendLoading}>
            {resendLoading ? 'Sending…' : 'Resend verification email'}
          </button>
        </form>
        <div className="auth-footer">
          Don&apos;t have an account?
          <Link to="/signup">Join Inkwell</Link>
        </div>
      </div>
    </div>
  )
}
