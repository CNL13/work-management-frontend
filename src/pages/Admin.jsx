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
      const [usersRes, dashRes, unitsRes] = await Promise.all([
        api.get('/users'),
        api.get('/dashboard'),  // ✅ FIX BUG-08: Dùng dashboard thay vì /tasks (Admin không có quyền xem tasks)
        api.get('/units'),
      ])
      const allUsers = usersRes.data || []
      setUsers(allUsers)
      setStats({
        totalUsers: allUsers.filter(u => u.role === 'User').length,
        totalManagers: allUsers.filter(u => u.role === 'Manager').length,
        totalTasks: dashRes.data?.totalTasks || 0,
        totalUnits: (unitsRes.data || []).length,
      })
    } catch (err) {
      console.error(err)
    }
  }

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
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ padding: '1.75rem 2rem', maxWidth: '1300px', margin: '0 auto' }}>
        
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 className="section-title">🛡️ Tổng quan Hệ thống</h2>
          <p className="section-subtitle">Quản trị toàn diện nhân sự và vận hành WorkFlow</p>
        </div>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6 mb-10 stagger-children">
          <div onClick={() => navigate('/units')} className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div>
                 <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800 }}>PHÒNG BAN</p>
                 <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>{stats.totalUnits}</p>
                 <p style={{ fontSize: '0.65rem', color: 'var(--primary-light)', fontWeight: 700 }}>Chi tiết →</p>
               </div>
               <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>🏢</div>
            </div>
          </div>
          <div onClick={() => navigate('/users')} className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div>
                 <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800 }}>TRƯỞNG PHÒNG</p>
                 <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>{stats.totalManagers}</p>
                 <p style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 700 }}>Chi tiết →</p>
               </div>
               <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>👔</div>
            </div>
          </div>
          <div onClick={() => navigate('/users')} className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div>
                 <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800 }}>NHÂN VIÊN</p>
                 <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>{stats.totalUsers}</p>
                 <p style={{ fontSize: '0.65rem', color: 'var(--success)', fontWeight: 700 }}>Chi tiết →</p>
               </div>
               <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>🧑‍💼</div>
            </div>
          </div>
          <div onClick={() => navigate('/dashboard')} className="stat-card" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
               <div>
                 <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800 }}>CÔNG VIỆC</p>
                 <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>{stats.totalTasks}</p>
                 <p style={{ fontSize: '0.65rem', color: 'var(--warning)', fontWeight: 700 }}>Chi tiết →</p>
               </div>
               <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>📋</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-panel animate-slide-up" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
             <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>🏢 Quản lý Cấu trúc Phòng ban</h3>
                <button onClick={() => navigate('/units')} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>Quản lý</button>
             </div>
             <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Phòng ban</th>
                      <th>Trưởng phòng</th>
                      <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chưa có dữ liệu</td></tr>
                    ) : (
                      units.map(unit => (
                        <tr key={unit.id}>
                          <td style={{ paddingLeft: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{unit.name}</td>
                          <td style={{ color: 'var(--primary-light)' }}>{getManagerName(unit.id)}</td>
                          <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                            <span className="badge badge-blue">Online</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
          </div>

          <div className="glass-panel animate-slide-right" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
             <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>⏳ Phê duyệt Tài khoản</h3>
                {pending.length > 0 && <span className="badge badge-yellow">{pending.length} yêu cầu</span>}
             </div>
             <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '1.5rem' }}>Ứng viên</th>
                      <th>Chức vụ</th>
                      <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Duyệt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.length === 0 ? (
                      <tr><td colSpan={3} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>✅ Hệ thống đã sạch yêu cầu</td></tr>
                    ) : (
                      pending.map((u) => (
                        <tr key={u.id}>
                          <td style={{ paddingLeft: '1.5rem' }}>
                             <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.fullName}</div>
                             <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                          </td>
                          <td><RoleBadge role={u.role} /></td>
                          <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                             <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button onClick={() => handleApprove(u.id, u.fullName)} style={{ padding: '0.35rem 0.625rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>✓</button>
                                <button onClick={() => handleReject(u.id, u.fullName)} style={{ padding: '0.35rem 0.625rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700 }}>✕</button>
                             </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
             </div>
             <div style={{ padding: '1rem', borderTop: '1px solid rgba(0, 0, 0, 0.05)', textAlign: 'center' }}>
                <button onClick={() => navigate('/users')} style={{ fontSize: '0.75rem', color: 'var(--primary-light)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 700 }}>QUẢN LÝ TẤT CẢ NGƯỜI DÙNG →</button>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}