import { useState, useEffect } from 'react'
import { getAllUsers, deleteUser, getAllBlogs, deleteBlog } from '../api'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import BlogCard from '../components/BlogCard'
import './Dashboard.css'
import './AdminPanel.css'

const TABS = ['Users', 'All Blogs']

export default function AdminPanel() {
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('Users')
  const [users, setUsers] = useState([])
  const [blogs, setBlogs] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingBlogs, setLoadingBlogs] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getAllUsers()
        if (data.status) setUsers(data.data)
        else toast.error(data.message)
      } catch {
        toast.error('Failed to load users')
      } finally {
        setLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await getAllBlogs()
        console.log("BLOGS DATA:", data)        // 👈 ye
    console.log("FIRST BLOG:", data.data[0]) // 👈 aur ye
        if (data.status) setBlogs(data.data)
        else toast.error(data.message)
      } catch {
        toast.error('Failed to load blogs')
      } finally {
        setLoadingBlogs(false)
      }
    }
    fetchBlogs()
  }, [])

  const handleDeleteUser = async (id) => {
    if (id === currentUser._id) return toast.error("You can't delete yourself")
    if (!window.confirm('Delete this user?')) return
    setDeletingId(id)
    try {
      const { data } = await deleteUser(id)
      if (data.status) {
        toast.success('User removed')
        setUsers(prev => prev.filter(u => u._id !== id))
      } else {
        toast.error(data.message)
      }
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteBlog = (id) => {
    setBlogs(prev => prev.filter(b => b._id !== id))
  }

  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">Admin Panel</div>
            <h1 className="page-title">Site<br /><em>Management</em></h1>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{users.filter(u => u.role === 'admin').length}</div>
            <div className="stat-label">Admins</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{users.filter(u => u.role === 'user').length}</div>
            <div className="stat-label">Writers</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{blogs.length}</div>
            <div className="stat-label">Total Blogs</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`admin-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span className="tab-count">
                {tab === 'Users' ? users.length : blogs.length}
              </span>
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'Users' && (
          loadingUsers ? (
            <div className="users-table-wrap">
              {[1,2,3,4].map(i => (
                <div key={i} className="user-row-skeleton">
                  <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="skeleton" style={{ height: '14px', width: '140px' }} />
                    <div className="skeleton" style={{ height: '11px', width: '200px' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">◉</span>
              <h3>No users found</h3>
            </div>
          ) : (
            <div className="users-table-wrap">
              <div className="users-table-header">
                <span>User</span>
                <span>Email</span>
                <span>Role</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              {users.map((u, i) => (
                <div className="user-row fade-up" key={u._id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="user-avatar-name">
                    <div className="user-avatar-sm">{u.name?.charAt(0).toUpperCase()}</div>
                    <span className="user-name-text">{u.name}</span>
                    {u._id === currentUser._id && <span className="you-badge">You</span>}
                  </div>
                  <span className="user-email-text">{u.email}</span>
                  <div className={`role-badge ${u.role}`}>
                    {u.role === 'admin' ? '◈ Admin' : '◉ Writer'}
                  </div>
                  <span className="user-date">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                  </span>
                  <button
                    className="user-delete-btn"
                    onClick={() => handleDeleteUser(u._id)}
                    disabled={deletingId === u._id || u._id === currentUser._id}
                    title={u._id === currentUser._id ? "Can't delete yourself" : 'Delete user'}
                  >
                    {deletingId === u._id ? '…' : '✕'}
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Blogs Tab */}
        {activeTab === 'All Blogs' && (
          loadingBlogs ? (
            <div className="blog-grid">
              {[1,2,3].map(i => (
                <div key={i} className="blog-card-skeleton">
                  <div className="skeleton" style={{ height: '180px' }} />
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                    <div className="skeleton" style={{ height: '22px', width: '80%' }} />
                    <div className="skeleton" style={{ height: '14px', width: '100%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✦</span>
              <h3>No blogs published yet</h3>
            </div>
          ) : (
            <div className="blog-grid">
              {blogs.map((blog, i) => (
                <div key={blog._id} style={{ animationDelay: `${i * 0.06}s` }}>
                  <BlogCard blog={blog} onDelete={handleDeleteBlog} showDelete />
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}