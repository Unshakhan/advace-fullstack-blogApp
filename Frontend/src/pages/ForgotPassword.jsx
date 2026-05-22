import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { forgotPassword } from '../api'
import './Auth.css'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      const { data } = await forgotPassword(email)
      if (data.status) {
        setSent(true)
        toast.success(data.message)
        if (data.devResetUrl) console.log('Dev reset link:', data.devResetUrl)
      } else {
        toast.error(data.message || 'Request failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-eyebrow">
          <span />
          Forgot password
        </div>
        <h1 className="auth-title">Reset<br /><em>password</em></h1>
        <p className="auth-sub">
          {sent
            ? 'Check your email (inbox & spam) for a reset link. It expires in 1 hour.'
            : 'Enter your account email and we will send a reset link.'}
        </p>

        {!sent && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                name="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="form-submit" disabled={loading}>
              {loading ? <span className="form-spinner" /> : null}
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
