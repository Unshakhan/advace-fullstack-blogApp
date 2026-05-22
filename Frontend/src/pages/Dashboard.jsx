import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BlogCard from '../components/BlogCard'
import api from '../api'
import toast from 'react-hot-toast'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)

  // Since there's no "get my blogs" endpoint, we fetch all and filter by author
 // Dashboard.jsx
useEffect(() => {
  const fetchBlogs = async () => {
    try {
      let data;
      
      if (user?.role === 'admin') {
        // Admin ko sab blogs chahiye
        const res = await api.get('/blog/all')
        data = res.data
      } else {
        // Normal user ko sirf apne blogs
        const res = await api.get('/blog/myblogs')
        data = res.data
      }

      if (data.status) {
        setBlogs(data.data || [])
      } else {
        setBlogs([])
      }
    } catch {
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }
  fetchBlogs()
}, [])

  const handleDelete = (id) => {
    setBlogs(prev => prev.filter(b => b._id !== id))
  }

  return (
    <div className="page">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">My Writing</div>
            <h1 className="page-title">
              Welcome,<br /><em>{user?.name}</em>
            </h1>
          </div>
          <Link to="/create" className="cta-primary">
            + New Post
          </Link>
        </div>

        {loading ? (
          <div className="blog-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="blog-card-skeleton">
                <div className="skeleton" style={{ height: '180px' }} />
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                  <div className="skeleton" style={{ height: '22px', width: '80%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '100%' }} />
                  <div className="skeleton" style={{ height: '14px', width: '70%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✦</span>
            <h3>No stories yet</h3>
            <p>Your published posts will appear here.</p>
            <Link to="/create" className="cta-primary" style={{ marginTop: '1.5rem' }}>
              Write Your First Post
            </Link>
          </div>
        ) : (
          <div className="blog-grid">
            {blogs.map((blog, i) => (
              <div key={blog._id} style={{ animationDelay: `${i * 0.08}s` }}>
                <BlogCard blog={blog} onDelete={handleDelete} showDelete />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
