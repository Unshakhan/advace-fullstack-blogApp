import Blog from "../models/Blog.js"
import User from "../models/User.js"
import { uploadImg, deleteImg } from "../config/cloudinary.js"

const createBlog = async (req, res) => {
  const { title, content } = req.body
  try {
    console.log('req.user---->', req.user)
    console.log("req.file=================>", req.file)

    if (req.file) {
      const up = await uploadImg(req.file)
      console.log('upload=================>', up)

      const data = {
        title,
        content,
        public_id: up.public_id,
        image: up.image,
        author: req.user._id   // store ObjectId
      }
      const blog = new Blog(data)
      const dataSave = await blog.save()
      return res.status(201).json({ status: true, message: 'blog created', data: dataSave })
    } else {
      return res.status(400).json({ status: false, message: 'image is required' })
    }
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

const deleteBlog = async (req, res) => {
  const { id } = req.params
  try {
    const found = await Blog.findById(id)
    if (!found) {
      return res.status(404).json({ status: false, message: 'blog not found' })
    }
    await deleteImg(found.public_id)
    await Blog.findByIdAndDelete(id)
    return res.status(200).json({ status: true, message: 'blog deleted successfully' })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

// Admin only — all blogs with author info
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
    return res.status(200).json({ status: true, message: 'all blogs fetched', data: blogs })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

// Logged-in user — only their own blogs
const getMyBlogs = async (req, res) => {
  try {
    console.log('getMyBlogs - req.user._id:', req.user._id)
    const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 })
    console.log('blogs found:', blogs.length)
    return res.status(200).json({ status: true, message: 'my blogs fetched', data: blogs })
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message })
  }
}

export { createBlog, deleteBlog, getAllBlogs, getMyBlogs }