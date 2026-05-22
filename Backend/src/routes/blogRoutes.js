import { createBlog, deleteBlog, getAllBlogs, getMyBlogs } from "../controllers/blogController.js"
import express from "express"
import multer from "multer"
import authantication from "../middleware/authMiddleware.js"
import { adminMiddlware } from "../middleware/Adminmiddle.js"

const blogRoute = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
})

blogRoute.post("/create", authantication, upload.single('image'), createBlog)
blogRoute.delete("/delete/:id", authantication, deleteBlog)
blogRoute.get("/all", authantication, adminMiddlware, getAllBlogs)   // admin only
blogRoute.get("/myblogs", authantication, getMyBlogs)               // any logged-in user

export default blogRoute