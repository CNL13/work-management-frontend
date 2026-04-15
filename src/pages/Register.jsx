import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'User',
    unitId: ''
  })
  const [units, setUnits] = useState([])
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchUnits()
  }, [])

  const fetchUnits = async () => {
    try {
      const res = await api.get('/units/public') // ✅ endpoint không cần token
      setUnits(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setSuccess('')
    try {
      const payload = {
        ...form,
        unitId: form.unitId || null
      }
      const res = await api.post('/auth/register', payload)
      setSuccess(res.data || 'Đăng ký thành công! Vui lòng chờ Admin phê duyệt.')
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data
        || 'Đăng ký thất bại!'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-2">
          Đăng ký tài khoản
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Tài khoản cần được Admin phê duyệt trước khi đăng nhập
        </p>


        {success && (
          <div className="bg-green-100 text-green-600 p-3 rounded mb-4 text-sm">
            {success}
            <div className="mt-2">
              <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
            <input type="text" style={{ display: 'none' }} />
            <input type="password" style={{ display: 'none' }} />

            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập họ và tên"
                autoComplete="off"
                required
              />
            </div>

            {/* Tên đăng nhập */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tên đăng nhập"
                autoComplete="off"
                required
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu"
                autoComplete="new-password"
                required
              />
            </div>

            {/* Chức vụ - chỉ Nhân viên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chức vụ
              </label>
              <input
                type="text"
                value="Nhân viên"
                disabled
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">
                * Trưởng phòng sẽ được Admin phân quyền sau khi duyệt
              </p>
            </div>

            {/* Chọn phòng - không bắt buộc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phòng ban
                <span className="text-gray-400 font-normal ml-1">(không bắt buộc)</span>
              </label>
              <select
                name="unitId"
                value={form.unitId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn phòng ban --</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                * Nếu chưa chắc, Admin có thể gán phòng ban sau khi duyệt
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Đăng ký
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-4">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
