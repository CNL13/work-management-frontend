import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import RoleBadge from '../components/RoleBadge'

export default function Users() {
  const [users, setUsers] = useState([])
  const [units, setUnits] = useState([])
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ username: '', fullName: '', role: 'User', unitId: null })
  const [showForm, setShowForm] = useState(false)

  // ✅ Search state
  const [keyword, setKeyword] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterUnit, setFilterUnit] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const { isAdmin } = useAuth()

  useEffect(() => {
    fetchUsers()
    fetchUnits()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data || [])
      setIsSearching(false)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUnits = async () => {
    try {
      const res = await api.get('/units')
      setUnits(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ Tìm kiếm nhân viên
  const handleSearch = async (e) => {
    e?.preventDefault()
    try {
      const params = {}
      if (keyword) params.keyword = keyword
      if (filterRole) params.role = filterRole
      if (filterUnit) params.unitId = filterUnit

      const res = await api.get('/users/search', { params })
      setUsers(res.data || [])
      setIsSearching(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReset = () => {
    setKeyword('')
    setFilterRole('')
    setFilterUnit('')
    setIsSearching(false)
    fetchUsers()
  }

  const handleEdit = (user) => {
    setEditId(user.id)
    setForm({
      username: user.username,
      fullName: user.fullName || '',
      role: user.role,
      unitId: user.unitId || null
    })
    setShowForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/users/${editId}`, {
        role: form.role,
        unitId: form.role === 'Manager' ? form.unitId : null
      })
      toast.success('Cập nhật người dùng thành công!')
      setShowForm(false)
      setEditId(null)
      fetchUsers()
    } catch (err) {
      toast.error('Cập nhật thất bại.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('Xóa người dùng thành công!')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại.')
    }
  }

  // ✅ MỚI: Admin reset mật khẩu cho User
  const handleResetPassword = async (user) => {
    const newPassword = window.prompt(
      `Nhập mật khẩu mới cho "${user.fullName || user.username}":\n(Tối thiểu 6 ký tự)`,
      ''
    )
    if (!newPassword) return
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }
    try {
      await api.post('/auth/reset-password', {
        username: user.username,
        newPassword
      })
      toast.success(`Đã đặt lại mật khẩu cho "${user.fullName || user.username}"!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại!')
    }
  }

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId)
    return unit ? unit.name : '—'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h2>

        {/* ✅ Search box */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Tìm theo tên / mã NV / tên đăng nhập
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập tên hoặc mã NV..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Chức vụ</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Tất cả</option>
                <option value="Manager">Trưởng phòng</option>
                <option value="User">Nhân viên</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Phòng ban</label>
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
              >
                <option value="">Tất cả phòng</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
              >
                🔍 Tìm kiếm
              </button>
              {isSearching && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 text-sm font-semibold"
                >
                  ✕ Xóa bộ lọc
                </button>
              )}
            </div>
          </form>

          {/* ✅ Hiện kết quả tìm kiếm */}
          {isSearching && (
            <p className="text-xs text-gray-500 mt-2">
              Tìm thấy <span className="font-semibold text-blue-600">{users.length}</span> kết quả
            </p>
          )}
        </div>

        {/* Form chỉnh sửa — chỉ Admin */}
        {showForm && isAdmin && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Chỉnh sửa người dùng</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={form.fullName}
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                  <input
                    type="text"
                    value={form.username}
                    disabled
                    className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-gray-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                >
                  <option value="User">Nhân viên</option>
                  <option value="Manager">Trưởng phòng</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              {form.role === 'Manager' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gán vào phòng ban <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.unitId || ''}
                    onChange={(e) => setForm({ ...form, unitId: e.target.value || null })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                    required
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {units.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-red-400 mt-1">* Bắt buộc chọn phòng để Manager có thể quản lý công việc</p>
                </div>
              )}

              <div className="flex gap-3">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                  Cập nhật
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditId(null) }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Danh sách người dùng */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-blue-700">
              <tr>
                <th className="px-4 py-3 text-left">Mã NV</th>
                <th className="px-4 py-3 text-left">Họ và tên</th>
                <th className="px-4 py-3 text-left">Tên đăng nhập</th>
                <th className="px-4 py-3 text-left">Vai trò</th>
                <th className="px-4 py-3 text-left">Phòng ban</th>
                {isAdmin && <th className="px-4 py-3 text-left">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
                    {isSearching ? '🔍 Không tìm thấy kết quả' : 'Chưa có người dùng nào'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                      {user.employeeCode || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {/* ✅ Highlight từ khóa tìm kiếm */}
                      {keyword && user.fullName?.toLowerCase().includes(keyword.toLowerCase()) ? (
                        <span className="bg-yellow-100 px-1 rounded">{user.fullName}</span>
                      ) : (
                        user.fullName || '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.username}</td>
                    <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                    <td className="px-4 py-3 text-gray-500">
                      {user.unitId ? getUnitName(user.unitId) : '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        {user.role !== 'Admin' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-blue-600 hover:underline text-sm font-medium"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleResetPassword(user)}
                              className="text-yellow-600 hover:underline text-sm font-medium"
                            >
                              Reset MK
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-red-500 hover:underline text-sm font-medium"
                            >
                              Xóa
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs italic">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}