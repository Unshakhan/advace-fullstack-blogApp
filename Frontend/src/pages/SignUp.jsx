import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { signUp } from '../api'
import './Auth.css'

export default function SignUp() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')
    setLoading(true)
    try {
      const { data } = await signUp(form)
      console.log('Signup response:', data)
      // backend returns "signup succesfull" (typo in backend) or status:true
      if (data.status === true) {
        toast.success(data.message || `Check ${form.email} (inbox & spam) for the verification link.`)
        if (data.devVerifyUrl) console.log('Dev verification link:', data.devVerifyUrl)
        navigate('/login')
      } else {
        toast.error(data.message || data.msg || 'Signup failed')
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
          New here?
        </div>
        <h1 className="auth-title">Join<br /><em>Inkwell</em></h1>
        <p className="auth-sub">Create your account and start writing.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              name="name"
              type="text"
              className="form-input"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              minLength={4}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select
              name="role"
              className="form-input form-select"
              value={form.role}
              onChange={handleChange}
            >
              <option value="user">Writer (User)</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? <span className="form-spinner" /> : null}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  )
}