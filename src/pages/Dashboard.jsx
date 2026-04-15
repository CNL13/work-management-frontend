import { useEffect, useState } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { role } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [role])

  const fetchDashboard = async () => {
    try {
      const endpoint = role === 'Manager' ? '/dashboard/manager' : '/dashboard'
      const res = await api.get(endpoint)
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (type) => {
    try {
      setExporting(type)
      const res = await api.get(`/export/${type}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      const date = new Date().toLocaleDateString('vi-VN').replace(/\//g, '')
      link.setAttribute(
        'download',
        type === 'tasks'
          ? `DanhSachCongViec_${date}.xlsx`
          : `TienDoCongViec_${date}.xlsx`
      )
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
      alert('Export thất bại!')
    } finally {
      setExporting('')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-lg">Đang tải...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-lg">Không thể tải dữ liệu!</p>
      </div>
    </div>
  )

  // ========== MANAGER DASHBOARD ==========
  if (role === 'Manager') {
    const statCards = [
      { label: 'Tổng thành viên', value: data.totalMembers, color: 'bg-purple-500', icon: '👥' },
      { label: 'Tổng công việc', value: data.totalTasks, color: 'bg-blue-500', icon: '📋' },
      { label: 'Chờ duyệt', value: data.reportSubmitted, color: 'bg-yellow-500', icon: '⏳' },
      { label: 'Đã phê duyệt', value: data.taskApproved, color: 'bg-green-500', icon: '✅' },
    ]

    const progressCards = [
      { label: 'Chưa bắt đầu', value: data.taskPending, color: 'bg-gray-400', icon: '🔘' },
      { label: 'Đang thực hiện', value: data.taskInProgress, color: 'bg-blue-400', icon: '🔄' },
      { label: 'Đã phê duyệt', value: data.taskApproved, color: 'bg-green-400', icon: '✅' },
      { label: 'Bị từ chối', value: data.taskRejected, color: 'bg-red-400', icon: '❌' },
    ]

    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-700">📊 Dashboard Phòng Ban</h1>
              <p className="text-sm text-gray-500 mt-1">🏢 {data.unitName}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('tasks')}
                disabled={exporting === 'tasks'}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition disabled:opacity-60"
              >
                {exporting === 'tasks' ? '⏳ Đang xuất...' : '📥 Export Công việc'}
              </button>
              <button
                onClick={() => handleExport('progress')}
                disabled={exporting === 'progress'}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition disabled:opacity-60"
              >
                {exporting === 'progress' ? '⏳ Đang xuất...' : '📥 Export Tiến độ'}
              </button>
            </div>
          </div>

          {/* Thống kê tổng */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => (
              <div key={i} className={`${card.color} text-white rounded-xl p-5 shadow flex items-center gap-4`}>
                <span className="text-3xl">{card.icon}</span>
                <div>
                  <p className="text-3xl font-bold">{card.value}</p>
                  <p className="text-sm opacity-90">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tiến độ */}
          <h2 className="text-lg font-semibold text-gray-600 mb-3">📈 Tiến độ công việc</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {progressCards.map((card, i) => (
              <div key={i} className={`${card.color} text-white rounded-xl p-5 shadow flex items-center gap-4`}>
                <span className="text-3xl">{card.icon}</span>
                <div>
                  <p className="text-3xl font-bold">{card.value}</p>
                  <p className="text-sm opacity-90">{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Thống kê từng thành viên */}
          <h2 className="text-lg font-semibold text-gray-600 mb-3">👤 Tiến độ từng thành viên</h2>
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Thành viên</th>
                  <th className="px-6 py-3 text-center">Tổng báo cáo</th>
                  <th className="px-6 py-3 text-center">Chờ duyệt</th>
                  <th className="px-6 py-3 text-center">Đã duyệt</th>
                  <th className="px-6 py-3 text-center">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.memberProgresses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-gray-400">Chưa có dữ liệu</td>
                  </tr>
                ) : (
                  data.memberProgresses.map((m, i) => {
                    const rate = m.totalTasks > 0
                      ? Math.round((m.approvedTasks / m.totalTasks) * 100)
                      : 0
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-700">{m.fullName}</td>
                        <td className="px-6 py-4 text-center">{m.totalTasks}</td>
                        <td className="px-6 py-4 text-center text-yellow-600 font-semibold">{m.submittedTasks}</td>
                        <td className="px-6 py-4 text-center text-green-600 font-semibold">{m.approvedTasks}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{rate}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ========== ADMIN DASHBOARD ==========
  const statCards = [
    { label: 'Tổng công việc', value: data.totalTasks, color: 'bg-blue-500', icon: '📋' },
    { label: 'Tổng người dùng', value: data.totalUsers, color: 'bg-purple-500', icon: '👥' },
    { label: 'Tổng phòng ban', value: data.totalUnits, color: 'bg-green-500', icon: '🏢' },
    { label: 'Chờ duyệt', value: data.reportSubmitted, color: 'bg-yellow-500', icon: '⏳' },
  ]

  const progressCards = [
    { label: 'Chưa bắt đầu', value: data.taskPending, color: 'bg-gray-400', icon: '🔘' },
    { label: 'Đang thực hiện', value: data.taskInProgress, color: 'bg-blue-400', icon: '🔄' },
    { label: 'Đã phê duyệt', value: data.taskApproved, color: 'bg-green-400', icon: '✅' },
    { label: 'Bị từ chối', value: data.taskRejected, color: 'bg-red-400', icon: '❌' },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-700">📊 Dashboard Tổng Quan</h1>
          <div className="flex gap-3">
            <button
              onClick={() => handleExport('tasks')}
              disabled={exporting === 'tasks'}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition disabled:opacity-60"
            >
              {exporting === 'tasks' ? '⏳ Đang xuất...' : '📥 Export Công việc'}
            </button>
            <button
              onClick={() => handleExport('progress')}
              disabled={exporting === 'progress'}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition disabled:opacity-60"
            >
              {exporting === 'progress' ? '⏳ Đang xuất...' : '📥 Export Tiến độ'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statCards.map((card, i) => (
            <div key={i} className={`${card.color} text-white rounded-xl p-5 shadow flex items-center gap-4`}>
              <span className="text-3xl">{card.icon}</span>
              <div>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm opacity-90">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-600 mb-3">📈 Tiến độ công việc</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {progressCards.map((card, i) => (
            <div key={i} className={`${card.color} text-white rounded-xl p-5 shadow flex items-center gap-4`}>
              <span className="text-3xl">{card.icon}</span>
              <div>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm opacity-90">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-semibold text-gray-600 mb-3">🏢 Thống kê theo phòng ban</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 text-left">Phòng ban</th>
                <th className="px-6 py-3 text-center">Tổng công việc</th>
                <th className="px-6 py-3 text-center">Đã hoàn thành</th>
                <th className="px-6 py-3 text-center">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.unitSummaries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-400">Chưa có dữ liệu</td>
                </tr>
              ) : (
                data.unitSummaries.map((unit, i) => {
                  const rate = unit.totalTasks > 0
                    ? Math.round((unit.approvedTasks / unit.totalTasks) * 100)
                    : 0
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-700">{unit.unitName}</td>
                      <td className="px-6 py-4 text-center">{unit.totalTasks}</td>
                      <td className="px-6 py-4 text-center text-green-600 font-semibold">{unit.approvedTasks}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                           <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}