import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUser, updateUser, deleteUser } from '../api'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import './Dashboard.css'
import './Profile.css'

export default function Profile() {
  const { user, logoutUser, setUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '' })

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email }
      if (form.password) payload.password = form.password
      const { data } = await updateUser(user._id, payload)
      if (data.status) {
        toast.success('Profile updated!')
        setUser(data.data)
        localStorage.setItem('user', JSON.stringify(data.data))
        setEditMode(false)
        setForm(f => ({ ...f, password: '' }))
      } else {
        toast.error(data.message || 'Update failed')
      }
    } catch (err) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure? This will permanently delete your account.')) return
    setDeleting(true)
    try {
      const { data } = await deleteUser(user._id)
      if (data.status) {
        toast.success('Account deleted')
        await logoutUser()
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="profile-inner">
        <div className="page-eyebrow">My Account</div>
        <h1 className="page-title" style={{ marginBottom: '2.5rem' }}>
          Your<br /><em>Profile</em>
        </h1>

        {/* Info Card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <div className={`role-badge ${user?.role}`}>
              {user?.role === 'admin' ? '◈ Admin' : '◉ Writer'}
            </div>
          </div>
          <button className="edit-toggle-btn" onClick={() => setEditMode(e => !e)}>
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Form */}
        {editMode && (
          <div className="edit-form-card fade-up">
            <div className="edit-form-title">Update Details</div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input name="name" type="text" className="form-input" value={form.name} onChange={handleChange} minLength={4} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(leave blank to keep current)</span></label>
                <input name="password" type="password" className="form-input" value={form.password} onChange={handleChange} placeholder="••••••••" minLength={8} />
              </div>
              <button type="submit" className="form-submit" style={{ marginTop: '0.5rem' }} disabled={loading}>
                {loading ? <span className="form-spinner" /> : null}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Danger Zone */}
        <div className="danger-zone">
          <div className="danger-title">Danger Zone</div>
          <p className="danger-desc">Permanently delete your account and all your data. This cannot be undone.</p>
          <button className="danger-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : '✕ Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
