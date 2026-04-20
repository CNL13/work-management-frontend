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
      console.error('Dashboard error:', err)
      console.error('Status:', err.response?.status)
      console.error('Data:', err.response?.data)
      alert(err.response?.data?.message || `Lỗi dashboard: ${err.response?.status || err.message}`)
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
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'conic-gradient(from 0deg, var(--primary-light), transparent)', animation: 'spin-slow 1s linear infinite' }} />
        <div className="skeleton" style={{ width: '200px', height: '14px', marginTop: '1.5rem' }} />
      </div>
    </div>
  )

  if (!data) return (
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
         <p style={{ color: 'var(--danger)', fontSize: '1.2rem', fontWeight: 800 }}>⚠️ Dữ liệu chưa kịp đồng bộ!</p>
         <button onClick={fetchDashboard} className="btn-primary" style={{ marginTop: '1rem' }}>Thử lại ngay</button>
      </div>
    </div>
  )

  const StatIcon = ({ icon, color }) => (
    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `rgba(${color}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', border: `1px solid rgba(${color}, 0.25)`, boxShadow: `0 0 20px rgba(${color}, 0.1)` }}>
      {icon}
    </div>
  )

  const renderManagerDashboard = () => {
    const primaryStats = [
      { label: 'Nhân sự phòng', value: data.totalMembers, icon: '👥', color: '99, 102, 241' },
      { label: 'Tổng nhiệm vụ', value: data.totalTasks, icon: '📝', color: '6, 182, 212' },
      { label: 'Báo cáo mới', value: data.reportSubmitted, icon: '🛎️', color: '245, 158, 11' },
      { label: 'Hoàn thành', value: data.taskApproved, icon: '🏆', color: '16, 185, 129' },
    ]

    const subStats = [
      { label: 'Chưa bắt đầu', value: data.taskPending, icon: '🔘', color: '148, 163, 184' },
      { label: 'Đang thực thi', value: data.taskInProgress, icon: '⚡', color: '59, 130, 246' },
      { label: 'Cần sửa đổi', value: data.taskRejected, icon: '❌', color: '239, 68, 68' },
    ]

    return (
      <div style={{ padding: '2rem', maxWidth: '1450px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div className="animate-slide-left">
            <h1 className="section-title" style={{ fontSize: '1.85rem' }}>📊 Phân tích Hiệu năng Quản trị</h1>
            <p className="section-subtitle">Phòng ban: <span style={{ color: 'var(--accent)', fontWeight: 800 }}>{data.unitName}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }} className="animate-fade-in">
            <button onClick={() => handleExport('tasks')} disabled={exporting === 'tasks'} className="btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.875rem' }}>
              {exporting === 'tasks' ? '...' : '📥 Công việc (.xlsx)'}
            </button>
            <button onClick={() => handleExport('progress')} disabled={exporting === 'progress'} className="btn-primary animate-float-premium" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.875rem' }}>
              {exporting === 'progress' ? '...' : '🚀 Xuất báo cáo Tiến độ'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 stagger-children">
          {primaryStats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>{stat.label}</p>
                  <p className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{stat.value}</p>
                </div>
                <StatIcon icon={stat.icon} color={stat.color} />
              </div>
              <div style={{ marginTop: '1rem', height: '4px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div className="progress-fill" style={{ width: '100%', background: `linear-gradient(90deg, transparent, rgb(${stat.color}), transparent)`, opacity: 0.4 }} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 animate-fade-in">
          {/* Main Table Section */}
          <div className="glass-panel" style={{ borderRadius: '1.75rem', overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
             <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>📈 Theo dõi Hiệu năng Nhân viên</h3>
                <span className="badge badge-purple">LIVE UPDATES</span>
             </div>
             <div style={{ overflowX: 'auto' }}>
               <table className="modern-table">
                 <thead>
                   <tr>
                      <th style={{ paddingLeft: '2rem' }}>Thành viên</th>
                      <th style={{ textAlign: 'center' }}>Trạng thái nộp</th>
                      <th style={{ textAlign: 'center' }}>Duyệt / Tổng</th>
                      <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Hiệu suất</th>
                   </tr>
                 </thead>
                 <tbody className="stagger-children">
                    {data.memberProgresses.map((m, i) => {
                       const rate = m.totalTasks > 0 ? Math.round((m.approvedTasks / m.totalTasks) * 100) : 0
                       return (
                         <tr key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                           <td style={{ paddingLeft: '2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                 <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '0.75rem' }}>{m.fullName?.[0]}</div>
                                 <div>
                                   <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.fullName}</div>
                                   <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.userEmployeeCode || '—'}</div>
                                 </div>
                              </div>
                           </td>
                           <td style={{ textAlign: 'center' }}>
                              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{m.submittedTasks} chờ xử lý</span>
                           </td>
                           <td style={{ textAlign: 'center' }}>
                              <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{m.approvedTasks}</span>
                              <span style={{ color: 'var(--text-muted)', margin: '0 0.25rem' }}>/</span>
                              <span style={{ color: 'var(--text-muted)' }}>{m.totalTasks}</span>
                           </td>
                           <td style={{ paddingRight: '2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                                 <div className="progress-track" style={{ width: '100px', height: '8px' }}>
                                    <div className="progress-fill" style={{ width: `${rate}%`, background: rate > 80 ? 'var(--success)' : rate > 40 ? 'var(--primary)' : 'var(--warning)', boxShadow: rate > 50 ? '0 0 10px rgba(79, 70, 229, 0.4)' : 'none' }} />
                                 </div>
                                 <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)', minWidth: '40px' }}>{rate}%</span>
                              </div>
                           </td>
                         </tr>
                       )
                    })}
                 </tbody>
               </table>
             </div>
          </div>

          {/* Right Summary Column */}
          <div className="flex flex-col gap-6 stagger-children">
             <div className="glass-panel hover-glow" style={{ padding: '2rem', borderRadius: '1.75rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', filter: 'blur(30px)' }} />
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.1rem' }}>🎯 Tổng quan Mục tiêu</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   {subStats.map((st, i) => (
                      <div key={i} className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(0, 0, 0, 0.05)', background: 'rgba(0, 0, 0, 0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                           <span style={{ fontSize: '1.4rem' }}>{st.icon}</span>
                           <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{st.label}</span>
                         </div>
                         <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)' }}>{st.value}</span>
                      </div>
                   ))}
                </div>
             </div>

             <div className="glass-panel animate-pulse-glow" style={{ padding: '2rem', borderRadius: '1.75rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(6,182,212,0.05) 100%)', border: '1px solid rgba(79,70,229,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                   <span style={{ fontSize: '1.2rem' }}>💡</span>
                   <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>Khuyên nghị</p>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  Hiện đang có <b style={{ color: 'var(--warning)' }}>{data.reportSubmitted}</b> báo cáo mới cần duyệt. Hãy ưu tiên xử lý để đảm bảo vòng đời công việc không bị gián đoạn.
                </p>
             </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAdminDashboard = () => {
    const adminStats = [
      { label: 'Nhiệm vụ Hệ thống', value: data.totalTasks, icon: '📋', color: '59, 130, 246' },
      { label: 'Người dùng Hoạt động', value: data.totalUsers, icon: '👤', color: '139, 92, 246' },
      { label: 'Số lượng Phòng ban', value: data.totalUnits, icon: '🏢', color: '16, 185, 129' },
      { label: 'Yêu cầu chờ xử lý', value: data.reportSubmitted, icon: '⏳', color: '245, 158, 11' },
    ]

    return (
      <div style={{ padding: '2rem', maxWidth: '1450px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="animate-slide-left">
            <h1 className="section-title" style={{ fontSize: '1.85rem' }}>🛡️ Trung tâm Điều hành Hệ thống</h1>
            <p className="section-subtitle">Chế độ xem Quản trị viên (Global Monitoring)</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }} className="animate-fade-in">
             <button onClick={() => handleExport('tasks')} className="btn-secondary" style={{ padding: '0.75rem 1.5rem' }}>Xuất Tasks</button>
             <button onClick={() => handleExport('progress')} className="btn-primary animate-float-premium" style={{ padding: '0.75rem 1.5rem' }}>Phân tích Toàn cục</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 stagger-children">
          {adminStats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div>
                   <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{stat.label}</p>
                   <p className="gradient-text" style={{ fontSize: '2.4rem', fontWeight: 900, margin: '0.25rem 0' }}>{stat.value}</p>
                 </div>
                 <StatIcon icon={stat.icon} color={stat.color} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-1 gap-8 stagger-children">
           <div className="glass-panel" style={{ borderRadius: '1.75rem', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem' }}>🏢 Phân tích Hiệu suất các Phòng ban</h3>
                 <span className="badge badge-blue">GLOBAL VIEW</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '2rem' }}>Tên Phòng ban</th>
                      <th style={{ textAlign: 'center' }}>Hoàn thành / Tổng cộng</th>
                      <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Trạng thái Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.unitSummaries.map((unit, i) => {
                      const rate = unit.totalTasks > 0 ? Math.round((unit.approvedTasks / unit.totalTasks) * 100) : 0
                      return (
                        <tr key={i} style={{ animationDelay: `${i * 0.05}s` }}>
                          <td style={{ paddingLeft: '2rem' }}>
                             <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem' }}>{unit.unitName}</div>
                             <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Mã đơn vị: {unit.unitCode || '—'}</div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.1rem' }}>{unit.approvedTasks}</span>
                            <span style={{ color: 'var(--text-muted)', margin: '0 0.4rem', fontSize: '1rem' }}>/</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{unit.totalTasks}</span>
                          </td>
                          <td style={{ paddingRight: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                              <div className="progress-track" style={{ width: '150px', height: '10px' }}>
                                <div className="progress-fill" style={{ width: `${rate}%`, background: 'linear-gradient(90deg, #6366f1, #06b6d4)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)' }} />
                              </div>
                              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--primary-light)', minWidth: '45px' }}>{rate}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
           </div>

           <div className="glass-panel animate-slide-up" style={{ padding: '2.5rem', borderRadius: '2rem', background: 'var(--bg-card)', border: '1px solid var(--glass-border)', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ padding: '8px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>📊</span>
                  Phân phối Trạng thái Công việc (Toàn hệ thống)
                </h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'linear-gradient(180deg, #6366f1, #4f46e5)' }} /> Ổn định
                   </div>
                </div>
              </div>

              <div style={{ 
                height: '350px', 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'flex-end', 
                gap: '2rem', 
                padding: '1.5rem 1.5rem 0.5rem', 
                background: 'rgba(248, 250, 252, 0.4)',
                borderRadius: '1.5rem',
                border: '1px solid rgba(0,0,0,0.03)',
              }}>
                 {/* Background Grid Lines */}
                 <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem 0 0.5rem', pointerEvents: 'none' }}>
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.04)', borderTop: i === 3 ? '1.5px solid rgba(0,0,0,0.1)' : 'none' }} />
                    ))}
                 </div>

                 {[
                   { l: 'Chưa khởi động', v: data.taskPending, c: 'linear-gradient(180deg, #94a3b8, #475569)', shadow: 'rgba(71, 85, 105, 0.3)' },
                   { l: 'Đang triển khai', v: data.taskInProgress, c: 'linear-gradient(180deg, #6366f1, #4f46e5)', shadow: 'rgba(79, 70, 229, 0.3)' },
                   { l: 'Đã hoàn tất', v: data.taskApproved, c: 'linear-gradient(180deg, #10b981, #059669)', shadow: 'rgba(16, 185, 129, 0.3)' },
                   { l: 'Bị từ chối', v: data.taskRejected, c: 'linear-gradient(180deg, #ef4444, #dc2626)', shadow: 'rgba(239, 68, 68, 0.3)' },
                 ].map((bar, i) => {
                   const maxVal = Math.max(data.taskPending, data.taskInProgress, data.taskApproved, data.taskRejected, 1);
                   const h = (bar.v / maxVal) * 85; // Max height 85%
                   return (
                    <div key={i} style={{ 
                      flex: 1, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'flex-end', 
                      alignItems: 'center', 
                      gap: '0.75rem', 
                      position: 'relative', 
                      zIndex: 1 
                    }}>
                        <div style={{ 
                          fontSize: '1.1rem', 
                          fontWeight: 900, 
                          color: 'var(--text-primary)', 
                          background: 'white',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          marginBottom: '4px',
                          border: '1px solid rgba(0,0,0,0.02)'
                        }}>
                          {bar.v}
                        </div>
                        <div className="hover-scale" style={{ 
                          width: '100%', 
                          maxWidth: '80px',
                          height: `${Math.max(h, 4)}%`, // Minimum height 4% for visibility
                          background: bar.c, 
                          borderRadius: '16px 16px 8px 8px', 
                          boxShadow: `0 15px 35px ${bar.shadow}`,
                          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                           {/* Glass Shine Effect */}
                           <div style={{ position: 'absolute', top: 0, left: '10%', right: '70%', height: '100%', background: 'rgba(255,255,255,0.15)', transform: 'skewX(-15deg)' }} />
                        </div>
                        <span style={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 800, 
                          color: 'var(--text-secondary)', 
                          textAlign: 'center', 
                          marginTop: '0.5rem',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center'
                        }}>{bar.l}</span>
                    </div>
                   )
                 })}
              </div>
              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#6366f1' }} /> Dữ liệu trực tuyến
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#10b981' }} /> Hiệu suất tối ưu
                 </div>
              </div>
           </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container page-enter">
      <Navbar />
      {role === 'Manager' ? renderManagerDashboard() : renderAdminDashboard()}
    </div>
  )
}
