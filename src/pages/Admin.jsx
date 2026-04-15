import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import RoleBadge from '../components/RoleBadge'

export default function Admin() {
  const navigate = useNavigate()
  const [pending, setPending] = useState([])
  const [units, setUnits] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalManagers: 0,
    totalTasks: 0,
    totalUnits: 0,
  })

  useEffect(() => {
    fetchPending()
    fetchUnits()
    fetchStats()
  }, [])

  const fetchPending = async () => {
    try {
      const res = await api.get('/auth/pending')
      setPending(res.data || [])
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

  const fetchStats = async () => {
    try {
      const [usersRes, tasksRes, unitsRes] = await Promise.all([
        api.get('/users'),
        api.get('/tasks', { params: { page: 1, size: 1 } }),
        api.get('/units'),
      ])
      const allUsers = usersRes.data || []
      setUsers(allUsers)
      setStats({
        totalUsers: allUsers.filter(u => u.role === 'User').length,
        totalManagers: allUsers.filter(u => u.role === 'Manager').length,
        totalTasks: tasksRes.data?.total || 0,
        totalUnits: (unitsRes.data || []).length,
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Tìm tên trưởng phòng theo unitId
  const getManagerName = (unitId) => {
    const manager = users.find(u => u.role === 'Manager' && u.unitId === unitId)
    return manager ? manager.fullName : '—'
  }

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId)
    return unit ? unit.name : '—'
  }

  const handleApprove = async (userId, fullName) => {
    if (!window.confirm(`Duyệt tài khoản "${fullName}"?`)) return
    try {
      await api.post(`/auth/approve/${userId}`)
      toast.success(`Đã duyệt tài khoản ${fullName}!`)
      fetchPending()
      fetchStats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Duyệt thất bại.')
    }
  }

  const handleReject = async (userId, fullName) => {
    if (!window.confirm(`Từ chối và xóa tài khoản "${fullName}"?`)) return
    try {
      await api.delete(`/auth/reject/${userId}`)
      toast.success(`Đã từ chối tài khoản ${fullName}!`)
      fetchPending()
    } catch (err) {
      toast.error('Thao tác thất bại.')
    }
  }



  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tổng quan hệ thống</h2>
          <p className="text-gray-500 text-sm mt-1">Quản lý nhân sự và phê duyệt tài khoản</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div onClick={() => navigate('/units')} className="bg-white rounded-xl shadow p-5 text-center cursor-pointer hover:shadow-md hover:bg-blue-50 transition">
            <p className="text-3xl font-bold text-blue-600">{stats.totalUnits}</p>
            <p className="text-sm text-gray-500 mt-1">Phòng ban</p>
            <p className="text-xs text-blue-400 mt-2">Xem chi tiết →</p>
          </div>
          <div onClick={() => navigate('/users')} className="bg-white rounded-xl shadow p-5 text-center cursor-pointer hover:shadow-md hover:bg-purple-50 transition">
            <p className="text-3xl font-bold text-purple-600">{stats.totalManagers}</p>
            <p className="text-sm text-gray-500 mt-1">Trưởng phòng</p>
            <p className="text-xs text-purple-400 mt-2">Xem chi tiết →</p>
          </div>
          <div onClick={() => navigate('/users')} className="bg-white rounded-xl shadow p-5 text-center cursor-pointer hover:shadow-md hover:bg-green-50 transition">
            <p className="text-3xl font-bold text-green-600">{stats.totalUsers}</p>
            <p className="text-sm text-gray-500 mt-1">Nhân viên</p>
            <p className="text-xs text-green-400 mt-2">Xem chi tiết →</p>
          </div>
          <div onClick={() => navigate('/tasks')} className="bg-white rounded-xl shadow p-5 text-center cursor-pointer hover:shadow-md hover:bg-orange-50 transition">
            <p className="text-3xl font-bold text-orange-500">{stats.totalTasks}</p>
            <p className="text-sm text-gray-500 mt-1">Công việc</p>
            <p className="text-xs text-orange-400 mt-2">Xem chi tiết →</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-700">Phòng ban & Trưởng phòng</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-blue-700">
              <tr>
                <th className="px-4 py-3 text-left">Phòng ban</th>
                <th className="px-4 py-3 text-left">Trưởng phòng</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {units.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-400">Chưa có phòng ban nào</td>
                </tr>
              ) : (
                units.map(unit => (
                  <tr key={unit.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{unit.name}</td>
                    <td className="px-4 py-3 text-gray-700">{getManagerName(unit.id)}</td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                        Hoạt động
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t text-right">
            <button onClick={() => navigate('/units')} className="text-blue-600 text-sm hover:underline font-medium">
              Xem tất cả phòng ban →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Tài khoản chờ duyệt</h3>
            {pending.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                {pending.length} chờ duyệt
              </span>
            )}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-blue-700">
              <tr>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Tên đăng nhập</th>
                <th className="px-4 py-3 text-left">Chức vụ</th>
                <th className="px-4 py-3 text-left">Phòng ban</th>
                <th className="px-4 py-3 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    ✅ Không có tài khoản nào chờ duyệt
                  </td>
                </tr>
              ) : (
                pending.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.fullName}</td>
                    <td className="px-4 py-3 text-gray-500">{u.username}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-gray-500">{getUnitName(u.unitId)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(u.id, u.fullName)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700 font-semibold">
                          ✓ Duyệt
                        </button>
                        <button onClick={() => handleReject(u.id, u.fullName)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 font-semibold">
                          ✗ Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t text-right">
            <button onClick={() => navigate('/users')} className="text-blue-600 text-sm hover:underline font-medium">
              Quản lý người dùng →
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}