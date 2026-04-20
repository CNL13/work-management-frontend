import axios from 'axios'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://localhost:7231/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ['/register', '/login', '/forgot-password']
      const isPublic = publicPaths.some(p => window.location.pathname.startsWith(p))
      if (!isPublic) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    }
    if (error.response?.status === 403) {
      if (!error.response.data || !error.response.data.message) {
        error.response.data = { message: 'Bạn không có quyền thực hiện thao tác này! Vui lòng đăng nhập lại với tài khoản Admin.' }
      }
    }
    return Promise.reject(error)
  }
)

export default api