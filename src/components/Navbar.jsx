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
    }
    fetchUnreadCount()
    
    // Khôi phục Dark Mode
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    }
  }, [role])

  const fetchPendingCount = async () => {
    try {
      const res = await api.get('/progress', { params: { page: 1, size: 50 } })
      const all = res.data.data || []
      const pending = all.filter(p => p.status === 'Submitted').length
      setPendingCount(pending)
      if (pending > 0 && !showNotifPanel) {
        const hasShown = sessionStorage.getItem('pendingAlertShown')
        if (!hasShown) {
          setShowNotif(true)
          sessionStorage.setItem('pendingAlertShown', 'true')
          setTimeout(() => setShowNotif(false), 5000)
        }
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
      { to: '/admin',     label: 'Tổng quan',  icon: '🛡️' },
      { to: '/dashboard', label: 'Hệ thống',   icon: '📊' },
      { to: '/units',     label: 'Đơn vị',     icon: '🏢' },
      { to: '/users',     label: 'Người dùng', icon: '👥' },
    ] : []),
    ...(role === 'Manager' ? [
      { to: '/dashboard',        label: 'Dashboard',  icon: '📊' },
      { to: '/tasks',            label: 'Công việc',  icon: '📋' },
      { to: '/progress',         label: 'Tiến độ',    icon: '📈' },
      { to: '/review',           label: 'Duyệt bài',  icon: '✅', badge: pendingCount },
      { to: '/department-staff', label: 'Nhân sự',    icon: '👥' },
      { to: '/performance',      label: 'KPI',        icon: '🏆' },
      { to: '/my-history',       label: 'Lịch sử',    icon: '📚' },
    ] : []),
    ...(role === 'User' ? [
      { to: '/tasks',       label: 'Công việc',    icon: '📋' },
      { to: '/progress',    label: 'Tiến độ',      icon: '📈' },
      { to: '/units',       label: 'Phòng ban',    icon: '🏢' },
      { to: '/performance', label: 'Hiệu suất',    icon: '🏆' },
      { to: '/my-history',  label: 'Lịch sử',      icon: '📚' },
    ] : []),
  ]

  const getRoleLabel = () => {
    if (role === 'Admin') return 'Quản trị viên'
    if (role === 'Manager') return 'Trưởng phòng'
    return 'Thành viên'
  }

  const getRoleGradient = () => {
    if (role === 'Admin') return 'linear-gradient(135deg, #ef4444, #b91c1c)'
    if (role === 'Manager') return 'linear-gradient(135deg, #f59e0b, #d97706)'
    return 'linear-gradient(135deg, #4f46e5, #06b6d4)'
  }

  const getInitials = () => {
    if (!fullName) return '?'
    const parts = fullName.trim().split(' ')
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <>
      {/* Pending status toast */}
      {showNotif && pendingCount > 0 && (
        <div className="fixed top-20 right-5 z-[100] animate-slide-up" style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          boxShadow: '0 15px 35px rgba(0,0,0,0.08), 0 5px 15px rgba(245, 158, 11, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          color: '#0f172a',
          maxWidth: '320px',
        }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🔔</div>
          <div className="flex-1">
            <p style={{ fontWeight: 800, fontSize: '0.875rem', margin: 0, color: '#b45309' }}>Cần phê duyệt!</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>Có <b style={{ color: '#d97706' }}>{pendingCount}</b> báo cáo đang đợi xử lý.</p>
          </div>
          <button onClick={() => setShowNotif(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem', padding: 0 }}>×</button>
        </div>
      )}

      {/* Main Navbar */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
          
          {/* Logo & Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div style={{ 
                width: '36px', height: '36px', borderRadius: '10px', 
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>WorkFlow</span>
            </Link>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={isActive ? 'animate-fade-in' : ''}
                    style={{
                      position: 'relative',
                      padding: '0.5rem 0.875rem',
                      borderRadius: '0.75rem',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      background: isActive ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      border: isActive ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid transparent'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)'
                        e.currentTarget.style.color = 'var(--text-primary)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--text-secondary)'
                      }
                    }}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                    {link.badge > 0 && (
                      <span style={{ padding: '2px 6px', background: 'var(--danger)', color: 'white', fontSize: '0.6rem', borderRadius: '5px', marginLeft: '2px', boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)', fontWeight: 900 }}>{link.badge}</span>
                    )}
                    {isActive && <div style={{ position: 'absolute', bottom: '2px', left: '20%', right: '20%', height: '2px', background: 'var(--primary-light)', borderRadius: '2px', filter: 'blur(1px)' }} />}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            
            {/* Theme Toggle */}
            <button 
                 onClick={() => { 
                   document.documentElement.classList.toggle('dark'); 
                   localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
                 }}
                 className="ripple"
                 title="Light/Dark Mode"
                 style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-secondary)' }}
               >
                 🌓
               </button>

            {/* Notif Bell */}
            <div style={{ position: 'relative' }}>
               <button 
                 onClick={() => { setShowNotifPanel(!showNotifPanel); if (!showNotifPanel) fetchNotifications() }}
                 className="ripple"
                 style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', color: 'var(--text-secondary)' }}
               >
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                 {unreadCount > 0 && <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%', border: '2px solid #0f172a' }} />}
               </button>

               {showNotifPanel && (
                 <>
                   <div className="fixed inset-0 z-[110]" onClick={() => setShowNotifPanel(false)} />
                   <div className="glass-panel animate-scale-in" style={{ position: 'absolute', top: '50px', right: 0, width: '320px', maxHeight: '400px', overflowY: 'auto', zIndex: 120, borderRadius: '1.25rem', padding: '0.5rem' }}>
                      <div style={{ padding: '1rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'space-between' }}>
                         <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>Thông báo ({unreadCount})</span>
                         <button onClick={() => setShowNotifPanel(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                      </div>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>Hộp thư trống</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} onClick={() => handleMarkAsRead(n.id)} style={{ padding: '0.875rem 1rem', borderRadius: '0.75rem', cursor: 'pointer', borderBottom: '1px solid rgba(0, 0, 0, 0.03)', background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)' }}>
                            <p style={{ fontSize: '0.75rem', color: n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt + "Z").toLocaleString('vi-VN')}</span>
                          </div>
                        ))
                      )}
                   </div>
                 </>
               )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="ripple"
                style={{ height: '40px', padding: '0 0.5rem', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: getRoleGradient(), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900, color: 'white' }}>{getInitials()}</div>
                <div style={{ textAlign: 'left', display: 'none', md: 'block' }}>
                   <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</p>
                   <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', margin: 0 }}>{getRoleLabel()}</p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-[110]" onClick={() => setShowUserMenu(false)} />
                  <div className="glass-panel animate-scale-in" style={{ position: 'absolute', top: '50px', right: 0, width: '200px', zIndex: 120, borderRadius: '1.25rem', padding: '0.5rem' }}>
                    <Link to="/profile" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8125rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span>👤</span> Hồ sơ cá nhân
                    </Link>
                    <Link to="/change-password" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8125rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span>🔒</span> Đổi mật khẩu
                    </Link>
                    <div style={{ height: '1px', background: 'rgba(0, 0, 0, 0.05)', margin: '0.4rem 0' }} />
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.75rem', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span>🚪</span> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </nav>
    </>
  )
}
