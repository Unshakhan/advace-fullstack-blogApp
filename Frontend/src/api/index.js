import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const signUp = (data) => api.post('/auth/signup', data)
export const resendVerification = (email) =>
  api.post('/auth/resend-verification', { email })
export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`)
export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email })
export const resetPassword = (token, password) =>
  api.post(`/auth/reset-password/${token}`, { password })
export const login = (data) => api.post('/auth/login', data)
export const logout = () => api.get('/auth/logout')
export const getAllUsers = () => api.get('/auth/users')
export const getUser = (id) => api.get(`/auth/user/${id}`)
export const updateUser = (id, data) => api.put(`/auth/user/${id}`, data)
export const deleteUser = (id) => api.delete(`/auth/user/${id}`)

// Blog
export const createBlog = (formData) =>
  api.post('/blog/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const deleteBlog = (id) => api.delete(`/blog/delete/${id}`)
export const getAllBlogs = () => api.get('/blog/all')
export const getMyBlogs = () => api.get('/blog/myblogs')

export default api