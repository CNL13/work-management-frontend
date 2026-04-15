import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Navbar() {
  const { logout, role, fullName, employeeCode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [pendingCount, setPendingCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    if (role === 'Manager') {
      fetchPendingCount()
      fetchUnreadCount()  // Manager cũng nhận thông báo
    }
    if (role === 'User') fetchUnreadCount()
  }, [role])

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/progress', { params: { page: 1, size: 100 } })
      const all = res.data.data || []
      const pending = all.filter(p => p.status === 'Submitted').length
      setPendingCount(pending)
      if (pending > 0) {
        setShowNotif(true)
        setTimeout(() => setShowNotif(false), 4000)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount(res.data || 0)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    ...(role === 'Admin' ? [
      { to: '/admin', label: '🛡️ Tổng quan' },
      { to: '/dashboard', label: '📊 Dashboard' },
      { to: '/tasks', label: 'Công việc' },
      { to: '/units', label: 'Đơn vị' },
      { to: '/users', label: 'Người dùng' },
    ] : []),
    ...(role === 'Manager' ? [
      { to: '/dashboard', label: '📊 Dashboard' },
      { to: '/tasks', label: 'Công việc' },
      { to: '/progress', label: 'Tiến độ' },
      { to: '/review', label: 'Phê duyệt', badge: pendingCount },
      { to: '/department-staff', label: '👥 Nhân sự' },
      { to: '/performance', label: '🏆 KPI' },
    ] : []),
    ...(role === 'User' ? [
      { to: '/tasks', label: 'Công việc' },
      { to: '/progress', label: 'Tiến độ' },
      { to: '/units', label: 'Phòng của tôi' },
      { to: '/performance', label: '🏆 KPI' },
    ] : []),
  ]

  const getRoleBadge = () => {
    if (role === 'Admin') return '🛡️ Admin'
    if (role === 'Manager') return '👑 Trưởng phòng'
    return '👤 Nhân viên'
  }

  const getRoleBadgeColor = () => {
    if (role === 'Admin') return 'bg-red-500'
    if (role === 'Manager') return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <>
      {showNotif && pendingCount > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <span className="text-xl">🔔</span>
          <div>
            <p className="font-semibold text-sm">Thông báo</p>
            <p className="text-xs">Có <strong>{pendingCount}</strong> báo cáo đang chờ phê duyệt!</p>
          </div>
          <button onClick={() => setShowNotif(false)} className="ml-2 text-white hover:text-yellow-200 font-bold text-lg leading-none">×</button>
        </div>
      )}

      {showNotifPanel && (
        <div className="fixed top-14 right-4 z-50 bg-white rounded-xl shadow-xl w-80 max-h-96 overflow-y-auto border">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Thông báo</h3>
            <button onClick={() => setShowNotifPanel(false)} className="text-gray-400 hover:text-gray-600">×</button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">Chưa có thông báo nào</p>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50' : ''}`}
              >
                <p className="text-sm text-gray-700">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                  {!n.isRead && <span className="ml-2 text-blue-500 font-semibold">● Mới</span>}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center shadow">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold whitespace-nowrap">Quản lý công việc</h1>
          <div className="flex gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition ${location.pathname === link.to
                    ? 'bg-white text-blue-600'
                    : 'hover:bg-blue-500 text-white'
                  }`}
              >
                {link.label}
                {link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {role !== 'Admin' && (
            <button
              onClick={() => {
                setShowNotifPanel(!showNotifPanel)
                if (!showNotifPanel) fetchNotifications()
              }}
              className="relative p-1.5 rounded-lg hover:bg-blue-500 transition"
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}

          <span className={`text-xs text-white px-2 py-1 rounded-full font-semibold ${getRoleBadgeColor()}`}>
            {getRoleBadge()}
          </span>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="text-right hover:opacity-80 transition"
            >
              <p className="text-sm font-semibold text-white">{fullName || 'Chưa cập nhật'}</p>
              <p className="text-xs text-blue-200">{employeeCode || ''}</p>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border z-50">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl"
                  >
                    👤 Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/change-password"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    🔐 Đổi mật khẩu
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-b-xl"
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
