import { useState } from 'react'
import { deleteBlog } from '../api'
import toast from 'react-hot-toast'
import './BlogCard.css'

export default function BlogCard({ blog, onDelete, showDelete = false }) {
  const [deleting, setDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm('Delete this blog post?')) return
    setDeleting(true)
    try {
      const { data } = await deleteBlog(blog._id)
      // status: true means success (fixed in backend)
      if (data.status) {
        toast.success('Blog deleted')
        onDelete && onDelete(blog._id)
      } else {
        toast.error(data.message || 'Delete failed')
      }
    } catch (err) {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  const date = blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    : ''

  return (
    <article className="blog-card">
      <div className="blog-card-img-wrap">
        {!imgError && blog.image ? (
          <img
            src={blog.image}
            alt={blog.title}
            className="blog-card-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="blog-card-img-placeholder">
            <span>✦</span>
          </div>
        )}
      </div>
      <div className="blog-card-body">
        {date && <div className="blog-card-date">{date}</div>}
        <h2 className="blog-card-title">{blog.title}</h2>
        <p className="blog-card-content">
          {blog.content?.length > 150 ? blog.content.slice(0, 150) + '…' : blog.content}
        </p>
        {blog.author && typeof blog.author === 'object' && (
          <div className="blog-card-author">
            <span className="author-dot" />
            {blog.author.name}
          </div>
        )}
      </div>
      {showDelete && (
        <div className="blog-card-actions">
          <button
            className="blog-delete-btn"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : '✕ Delete'}
          </button>
        </div>
      )}
    </article>
  )
}