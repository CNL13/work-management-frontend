import { useEffect, useState } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const levelConfig = {
  'Xuất sắc': { text: '#10b981', border: 'rgba(16, 185, 129, 0.4)', bar: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', icon: '✨' },
  'Tốt':      { text: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)', bar: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', icon: '✅' },
  'Trung bình':{ text: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)', bar: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', icon: '⚡' },
  'Yếu':      { text: '#ef4444', border: 'rgba(239, 68, 68, 0.4)', bar: '#ef4444', glow: 'rgba(239, 68, 68, 0.5)', icon: '🔴' },
}

function ScoreRing({ score, level }) {
  const cfg = levelConfig[level] || levelConfig['Tốt']
  const pct = Math.min(score, 100)
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="animate-float-premium" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '160px', height: '160px' }}>
      <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(0, 0, 0, 0.03)" strokeWidth="14" />
        <circle
          cx="80" cy="80" r={r} fill="none"
          stroke={cfg.bar}
          strokeWidth="14"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.8s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: `drop-shadow(0 0 12px ${cfg.glow})` }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <span style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{score}</span>
        <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginTop: '-4px' }}>KPI Point</span>
      </div>
    </div>
  )
}

function StatBox({ label, value, sub, color = 'var(--primary-light)' }) {
  return (
    <div className="glass-card stat-card" style={{ padding: '1.25rem', textAlign: 'center', minWidth: '120px' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 900, color: color }}>{value}</div>
      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '0.25rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

function KpiCard({ data, isMe = false, rank }) {
  const cfg = levelConfig[data.level] || levelConfig['Tốt']
  const pct = Math.min(data.score, 100)

  return (
    <div className="glass-panel hover-glow animate-fade-in" style={{ 
      padding: '1.5rem', 
      borderRadius: '1.5rem', 
      border: isMe ? '2px solid var(--primary-light)' : `1px solid rgba(0, 0, 0, 0.08)`,
      boxShadow: isMe ? '0 0 30px rgba(79, 70, 229, 0.2)' : 'none',
      position: 'relative'
    }}>
      {rank && rank <= 3 && (
        <div style={{ position: 'absolute', top: '-12px', left: '-12px', width: '36px', height: '36px', background: rank === 1 ? 'linear-gradient(135deg, #ffd700, #b8860b)' : rank === 2 ? 'linear-gradient(135deg, #c0c0c0, #808080)' : 'linear-gradient(135deg, #cd7f32, #8b4513)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1rem', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', border: '2px solid rgba(0, 0, 0, 0.2)' }}>
          {rank}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0, 0, 0, 0.03)', border: '1px solid rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👤</div>
          <div>
            <p style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1rem', margin: 0 }}>{data.fullName}</p>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{data.employeeCode || '—'}</p>
          </div>
        </div>
        <div style={{ 
          background: `rgba(${cfg.bar === '#10b981' ? '16, 185, 129' : cfg.bar === '#3b82f6' ? '59, 130, 246' : '245, 158, 11'}, 0.1)`,
          color: cfg.text,
          border: `1px solid ${cfg.border}`,
          padding: '0.35rem 0.75rem',
          borderRadius: '10px',
          fontSize: '0.7rem',
          fontWeight: 900,
          textTransform: 'uppercase'
        }}>
          {cfg.icon} {data.level}
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>
           <span>Chỉ số: {data.score}</span>
           <span className="gradient-text">{pct}%</span>
        </div>
        <div className="progress-track" style={{ height: '8px' }}>
          <div className="progress-fill" style={{ width: `${pct}%`, background: cfg.bar, boxShadow: `0 0 10px ${cfg.glow}` }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div style={{ background: 'rgba(0, 0, 0, 0.03)', padding: '0.625rem', borderRadius: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '1rem' }}>{data.totalTasks}</div>
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>TASKS</div>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.625rem', borderRadius: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontWeight: 900, color: '#10b981', fontSize: '1rem' }}>+{data.bonusPoints}</div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(16, 185, 129, 0.8)', textTransform: 'uppercase', fontWeight: 700 }}>BONUS</div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '0.625rem', borderRadius: '0.75rem', textAlign: 'center' }}>
          <div style={{ fontWeight: 900, color: '#ef4444', fontSize: '1rem' }}>-{data.penaltyPoints}</div>
          <div style={{ fontSize: '0.6rem', color: 'rgba(239, 68, 68, 0.8)', textTransform: 'uppercase', fontWeight: 700 }}>LOST</div>
        </div>
      </div>

      {data.isAtRisk && (
        <div className="animate-pulse-glow" style={{ marginTop: '1.25rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '0.875rem', fontSize: '0.75rem', color: '#fca5a5', display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span> 
          <span style={{ lineHeight: 1.4 }}>{data.warningMessage}</span>
        </div>
      )}
    </div>
  )
}

export default function Performance() {
  const { role, userId } = useAuth()
  const [myKpi, setMyKpi] = useState(null)
  const [unitKpi, setUnitKpi] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mine')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (userId) {
        const res = await api.get(`/users/performance/${userId}`)
        setMyKpi(res.data)
      }
      if (role === 'Manager' || role === 'Admin') {
        const res2 = await api.get('/users/performance/unit')
        setUnitKpi(res2.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const canViewUnit = role === 'Manager' || role === 'Admin'

  return (
    <div className="page-container page-enter">
      <Navbar />

      <div style={{ padding: '2rem', maxWidth: '1300px', margin: '0 auto' }}>
        <div className="animate-slide-left" style={{ marginBottom: '3rem' }}>
          <h1 className="section-title" style={{ fontSize: '1.85rem' }}>🎯 Phân tích KPI & Hiệu suất</h1>
          <p className="section-subtitle">Dữ liệu phân tích chi tiết mức độ đóng góp và hoàn thành mục tiêu</p>
        </div>

        {canViewUnit && (
          <div className="glass-panel" style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255, 255, 255,0.6)', padding: '0.4rem', borderRadius: '1rem', width: 'fit-content', marginBottom: '2.5rem', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <button
              onClick={() => setTab('mine')}
              className={tab === 'mine' ? 'btn-primary' : 'btn-secondary'}
              style={{ border: 'none', background: tab === 'mine' ? undefined : 'transparent', padding: '0.625rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 800 }}
            >
              👤 Chỉ số cá nhân
            </button>
            <button
              onClick={() => setTab('unit')}
              className={tab === 'unit' ? 'btn-primary' : 'btn-secondary'}
              style={{ border: 'none', background: tab === 'unit' ? undefined : 'transparent', padding: '0.625rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 800 }}
            >
              🏆 Bảng vàng thi đua
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '10rem 0' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'conic-gradient(from 0deg, var(--primary-light), transparent)', animation: 'spin-slow 0.8s linear infinite', margin: '0 auto' }} />
            <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.05em' }}>ĐANG TỔNG HỢP DỮ LIỆU KPI...</p>
          </div>
        ) : (
          <>
            {/* Cá nhân View */}
            {(tab === 'mine' || !canViewUnit) && myKpi && (
              <div className="animate-slide-up">
                <div className="glass-panel" style={{ padding: '3rem 2.5rem', borderRadius: '2rem', border: '1px solid rgba(0, 0, 0, 0.1)', background: 'rgba(255, 255, 255, 0.4)', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '6px', background: 'linear-gradient(90deg, #4f46e5, #06b6d4, #4f46e5)', backgroundSize: '200% 100%', animation: 'shimmer 3s infinite linear' }} />
                  
                  <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', justifyContent: 'center' }}>
                    <ScoreRing score={myKpi.score} level={myKpi.level} />

                    <div style={{ flex: 1, minWidth: '320px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>{myKpi.fullName}</h2>
                          <div className="animate-bounce-in" style={{ padding: '4px 12px', background: levelConfig[myKpi.level]?.border, color: levelConfig[myKpi.level]?.text, borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900 }}>{levelConfig[myKpi.level]?.icon} {myKpi.level}</div>
                       </div>
                       <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '1.5rem', letterSpacing: '0.05em' }}>Mã nhân sự: {myKpi.employeeCode}</p>
                       
                       <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(0, 0, 0, 0.05)', background: 'rgba(0, 0, 0, 0.02)' }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                            {myKpi.isManagerKpi ? (
                              <>Phương thức đánh giá Trưởng phòng: [Trung bình phòng <b>{Math.round(myKpi.unitAverageScore)}</b> × 70%] + [Cá nhân <b>{myKpi.personalScore}</b> × 30%]</>
                            ) : (
                              <>Điểm KPI của bạn được tính dựa trên số lượng công việc hoàn thành và thời gian thực hiện so với hạn chốt.</>
                            )}
                          </p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 stagger-children">
                       <StatBox label="Nhiệm vụ" value={myKpi.totalTasks} />
                       <StatBox label="Đúng hạn" value={myKpi.completedOnTime} color="#10b981" />
                       <StatBox label="Trễ hạn" value={myKpi.completedLate} color="#f59e0b" />
                       <StatBox label="Bị từ chối" value={myKpi.rejectedReports} color="#ef4444" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 stagger-children">
                   {/* Breakdown card */}
                   <div className="glass-panel hover-glow" style={{ padding: '2rem', borderRadius: '1.75rem' }}>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>🏆 Chi tiết biến động điểm số</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cơ sở KPI</span>
                            <span style={{ fontWeight: 900, color: 'var(--text-primary)' }}>100</span>
                         </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Thành tích công việc (+)</span>
                            <span style={{ fontWeight: 900, color: '#10b981' }}>+{myKpi.bonusPoints}</span>
                         </div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Khấu trừ vi phạm (-)</span>
                            <span style={{ fontWeight: 900, color: '#ef4444' }}>-{myKpi.penaltyPoints}</span>
                         </div>
                         {myKpi.reviewPenaltyPoints > 0 && (
                           <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SLA Duyệt báo cáo (Admin/Mgr)</span>
                              <span style={{ fontWeight: 900, color: '#ef4444' }}>-{myKpi.reviewPenaltyPoints}</span>
                           </div>
                         )}
                         <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem' }}>
                            <span style={{ fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.1rem' }}>CHỈ SỐ CUỐI CÙNG</span>
                            <span className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 900 }}>{myKpi.score}</span>
                         </div>
                      </div>
                   </div>

                   {/* Scale card */}
                   <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.75rem' }}>
                      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>📏 Xếp loại Tiêu chuẩn</h3>
                      <div className="flex flex-col gap-3">
                         {Object.entries(levelConfig).map(([name, cfg]) => {
                           const isCurrent = myKpi.level === name
                           return (
                             <div key={name} className={isCurrent ? 'animate-pulse-glow' : ''} style={{ 
                               display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '1rem', 
                               background: isCurrent ? `rgba(0, 0, 0, 0.05)` : 'rgba(0, 0, 0, 0.02)',
                               border: isCurrent ? `1px solid ${cfg.border}` : '1px solid transparent',
                               transition: 'all 0.3s'
                             }}>
                               <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `rgba(${cfg.bar === '#10b981' ? '16, 185, 129' : cfg.bar === '#3b82f6' ? '59, 130, 246' : '245, 158, 11'}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', border: `1px solid ${cfg.border}` }}>{cfg.icon}</div>
                               <div style={{ flex: 1 }}>
                                 <p style={{ fontSize: '0.85rem', fontWeight: 900, color: cfg.bar, margin: 0 }}>{name}</p>
                                 <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700 }}>
                                    {name === 'Xuất sắc' ? 'Đạt trên 90 điểm' : name === 'Tốt' ? 'Đạt từ 75 đến 89 điểm' : name === 'Trung bình' ? 'Đạt từ 60 đến 74 điểm' : 'Dưới 60 điểm'}
                                 </p>
                               </div>
                               {isCurrent && <span className="badge badge-blue">HIỆN TẠI</span>}
                             </div>
                           )
                         })}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Thứ hạng phòng View */}
            {tab === 'unit' && canViewUnit && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                   <div>
                     <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, color: 'var(--text-primary)', fontSize: '1.25rem', margin: 0 }}>🏆 Vinh danh Nhân sự tiêu biểu</h2>
                     <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Cập nhật bảng xếp hạng thi đua tuần/tháng</p>
                   </div>
                   <span className="badge badge-purple" style={{ padding: '0.4rem 1rem' }}>{unitKpi.length} THÀNH VIÊN</span>
                </div>

                {unitKpi.length === 0 ? (
                  <div className="glass-panel" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                     <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Dữ liệu xếp hạng đang được hệ thống xử lý...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
                     {unitKpi.map((d, i) => (
                       <div key={d.userId} className="animate-float-premium" style={{ animationDelay: `${i * 0.15}s`, animationDuration: `${6 + i}s` }}>
                          <KpiCard data={d} isMe={d.userId === userId} rank={i + 1} />
                       </div>
                     ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
