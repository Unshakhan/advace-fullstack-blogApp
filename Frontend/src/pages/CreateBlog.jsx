import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBlog } from '../api'
import toast from 'react-hot-toast'
import './CreateBlog.css'

export default function CreateBlog() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', content: '' })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileRef = useRef()

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB')
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) return toast.error('Title and content are required')
    if (!image) return toast.error('Please select a cover image')

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('content', form.content)
    formData.append('image', image)

    setLoading(true)
    try {
      const { data } = await createBlog(formData)
      if (data.status) {
        toast.success('Blog published!')
        navigate('/dashboard')
      } else {
        toast.error(data.message || 'Failed to publish')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <div className="create-inner">
        <div className="page-header">
          <div>
            <div className="page-eyebrow">New Story</div>
            <h1 className="page-title">Write<br /><em>Something</em></h1>
          </div>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div
            className={`image-drop ${preview ? 'has-preview' : ''}`}
            onClick={() => fileRef.current.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {preview ? (
              <>
                <img src={preview} alt="Preview" className="image-preview" />
                <div className="image-overlay">
                  <span>Change Image</span>
                </div>
              </>
            ) : (
              <div className="image-drop-placeholder">
                <span className="drop-icon">⊕</span>
                <span className="drop-main">Drop your cover image here</span>
                <span className="drop-sub">or click to browse · max 5MB</span>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              hidden
            />
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              name="title"
              type="text"
              className="form-input title-input"
              placeholder="Your compelling headline..."
              value={form.title}
              onChange={handleChange}
              minLength={4}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              name="content"
              className="form-input content-textarea"
              placeholder="Tell your story..."
              value={form.content}
              onChange={handleChange}
              required
              rows={14}
            />
          </div>

          <div className="create-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Discard
            </button>
            <button type="submit" className="form-submit publish-btn" disabled={loading}>
              {loading ? <span className="form-spinner" /> : null}
              {loading ? 'Publishing...' : '✦ Publish Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
