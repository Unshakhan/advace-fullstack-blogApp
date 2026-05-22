import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetPassword } from '../api'
import './Auth.css'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return toast.error('Invalid reset link')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (password !== confirm) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const { data } = await resetPassword(token, password)
      if (data.status) {
        toast.success(data.message)
        navigate('/login')
      } else {
        toast.error(data.message || 'Reset failed')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Invalid link</h1>
          <p className="auth-sub">This password reset link is invalid.</p>
          <div className="auth-footer">
            <Link to="/forgot-password">Request a new link</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-eyebrow">
          <span />
          New password
        </div>
        <h1 className="auth-title">Set<br /><em>password</em></h1>
        <p className="auth-sub">Choose a new password (min. 8 characters).</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? <span className="form-spinner" /> : null}
            {loading ? 'Saving…' : 'Reset password'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
