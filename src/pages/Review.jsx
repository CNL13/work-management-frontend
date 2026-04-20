import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'

export default function Review() {
  const [tasks, setTasks] = useState([])
  const [progresses, setProgresses] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchProgresses()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', { params: { page: 1, size: 100 } })
      setTasks(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProgresses = async () => {
    try {
      const res = await api.get('/progress', { params: { page: 1, size: 100 } })
      setProgresses(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const getTaskTitle = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    return task ? task.title : taskId
  }

  const handleReview = async (approve) => {
    if (!selectedId) return
    setLoading(true)
    try {
      await api.post('/review', {
        progressId: selectedId,
        approve,
        comment,
      })
      toast.success(approve ? '✓ Đã phê duyệt báo cáo thành công!' : '✗ Đã từ chối báo cáo!')
      setSelectedId(null)
      setComment('')
      fetchProgresses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const pendingProgresses = progresses.filter(p => p.status === 'Submitted')

  return (
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1450px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="animate-slide-left">
            <h2 className="section-title" style={{ fontSize: '1.85rem' }}>✅ Trung tâm Phê duyệt</h2>
            <p className="section-subtitle">Thẩm định và đánh giá tiến độ thực hiện công việc của nhân sự</p>
          </div>
          <div style={{ display: 'flex', gap: '0.875rem' }} className="animate-fade-in">
            <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
               <span className="ping-dot" style={{ color: '#f59e0b' }}>●</span>
               <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#fcd34d' }}>{pendingProgresses.length} ĐANG CHỜ</span>
            </div>
            <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.625rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(99, 102, 241, 0.05)' }}>
               <span style={{ fontSize: '1.1rem' }}>📋</span>
               <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: '#a5b4fc' }}>{progresses.length} LỊCH SỬ</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
          
          <div className="flex flex-col gap-8">
            <div className="glass-panel" style={{ borderRadius: '1.75rem', overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.3)' }}>
                  <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <span className="animate-float-premium">⏳</span> Báo cáo mới nhận
                  </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '2rem' }}>Thành viên</th>
                      <th>Nhiệm vụ</th>
                      <th style={{ textAlign: 'center' }}>Tiến độ</th>
                      <th>Mô tả</th>
                      <th style={{ textAlign: 'center' }}>Minh chứng</th>
                      <th style={{ paddingRight: '2rem', textAlign: 'right' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="stagger-children">
                    {pendingProgresses.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '10rem 2rem' }}>
                          <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.2 }}>✨</div>
                          <p style={{ fontWeight: 800, color: 'var(--text-muted)', fontSize: '1rem' }}>Hệ thống đã xử lý hết báo cáo</p>
                        </td>
                      </tr>
                    ) : (
                      pendingProgresses.map((p, i) => (
                        <tr
                          key={p.id}
                          onClick={() => setSelectedId(p.id)}
                          style={{ 
                            cursor: 'pointer', 
                            background: selectedId === p.id ? 'rgba(79,70,229,0.08)' : 'transparent', 
                            borderLeft: selectedId === p.id ? '4px solid var(--primary-light)' : '4px solid transparent',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            animationDelay: `${i * 0.05}s`
                          }}
                        >
                          <td style={{ paddingLeft: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                               <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: '0.75rem' }}>{p.userFullName?.[0] || 'U'}</div>
                               <div>
                                 <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.userFullName}</div>
                                 <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.userEmployeeCode}</div>
                               </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getTaskTitle(p.taskId)}</div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div className="progress-track" style={{ width: '40px', height: '6px' }}>
                                <div className="progress-fill" style={{ width: `${p.percent}%`, background: 'linear-gradient(90deg, #4f46e5, #06b6d4)' }} />
                              </div>
                              <span style={{ fontWeight: 900, color: 'var(--primary-light)', fontSize: '0.8rem' }}>{p.percent}%</span>
                            </div>
                          </td>
                          <td>
                             <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                               {p.description || '—'}
                             </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {p.files?.length > 0 ? (
                              <button
                                onClick={e => { e.stopPropagation(); window.open(`${api.defaults.baseURL}/upload/${p.files[0].id}`, '_blank') }}
                                className="hover-glow"
                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 900, cursor: 'pointer' }}
                              >
                                TÀI LIỆU
                              </button>
                            ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
                          </td>
                          <td style={{ paddingRight: '2rem', textAlign: 'right' }}>
                             <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: selectedId === p.id ? '5px solid var(--primary-light)' : '2px solid rgba(0, 0, 0, 0.1)', display: 'inline-block', transition: 'all 0.2s' }} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-panel animate-fade-in" style={{ borderRadius: '1.75rem', overflow: 'hidden', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', background: 'rgba(0, 0, 0, 0.3)' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>📜 Lịch sử xét duyệt</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '2rem' }}>Thành viên</th>
                      <th>Nhiệm vụ</th>
                      <th style={{ textAlign: 'center' }}>Kết quả</th>
                      <th style={{ textAlign: 'right', paddingRight: '2rem' }}>Thời điểm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progresses.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Chưa có bản ghi nào</td></tr>
                    ) : (
                      progresses.map((p, i) => (
                        <tr key={p.id}>
                          <td style={{ paddingLeft: '2rem' }}>{p.userFullName}</td>
                          <td style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{getTaskTitle(p.taskId)}</td>
                          <td style={{ textAlign: 'center' }}>
                             <StatusBadge status={p.status} submittedLabel="Chờ duyệt" />
                          </td>
                          <td style={{ paddingRight: '2rem', textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {p.updatedAt ? new Date(p.updatedAt + "Z").toLocaleString('vi-VN') : '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 sticky top-24">
            {selectedId ? (
              <div className="glass-panel animate-scale-in" style={{ padding: '2rem', borderRadius: '1.75rem', border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(255, 255, 255, 0.6)' }}>
                {/* Employee Report Detail */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(79,70,229,0.05)', borderRadius: '1rem', border: '1px solid rgba(79,70,229,0.1)' }}>
                   <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary-light)', marginBottom: '0.5rem' }}>
                      💬 Lời nhắn từ nhân viên:
                   </label>
                   <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                      {progresses.find(p => p.id === selectedId)?.description || '(Không có mô tả)'}
                   </p>
                </div>

                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.15rem' }}>
                  📝 Phản hồi thẩm định
                </h3>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
                    Nhận xét chuyên môn
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input-modern"
                    rows={4}
                    placeholder="Viết ghi chú phê duyệt hoặc lý do từ chối..."
                    style={{ borderRadius: '1rem', background: 'rgba(0,0,0,0.2)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button onClick={() => handleReview(true)} disabled={loading} className="btn-primary" style={{ padding: '1rem', borderRadius: '1rem', fontSize: '0.9rem', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}>
                    {loading ? '...' : '✓ CHẤP THUẬN BÁO CÁO'}
                  </button>
                  <button onClick={() => handleReview(false)} disabled={loading} className="btn-danger" style={{ padding: '1rem', borderRadius: '1rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                    {loading ? '...' : '✕ TỪ CHỐI & YÊU CẦU LÀM LẠI'}
                  </button>
                  <button onClick={() => setSelectedId(null)} className="btn-secondary" style={{ padding: '0.875rem', borderRadius: '1rem', border: 'none', background: 'transparent', color: 'var(--text-muted)', fontWeight: 800 }}>
                    HỦY THAO TÁC
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '2.5rem 2rem', borderRadius: '1.75rem', textAlign: 'center', background: 'rgba(0, 0, 0, 0.2)', border: '1px dashed rgba(0, 0, 0, 0.06)' }}>
                 <div style={{ fontSize: '3rem', marginBottom: '1.5rem', opacity: 0.3 }} className="animate-float-premium">📬</div>
                 <h4 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.75rem' }}>Chưa chọn báo cáo</h4>
                 <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Chọn một bản ghi bên trái để bắt đầu quy trình phê duyệt hoặc từ chối tiến độ.</p>
              </div>
            )}

            <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.75rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
               <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>💡</span> QUY TẮC PHÊ DUYỆT
               </h4>
               <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                 <li style={{ display: 'flex', gap: '0.5rem' }}><b>•</b> Việc phê duyệt sẽ cộng điểm thưởng trực tiếp vào KPI của nhân sự.</li>
                 <li style={{ display: 'flex', gap: '0.5rem' }}><b>•</b> Từ chối sẽ yêu cầu nhân sự nộp lại báo cáo mới kèm chỉnh sửa.</li>
                 <li style={{ display: 'flex', gap: '0.5rem' }}><b>•</b> Manager nên phản hồi chi tiết để nhân sự rút kinh nghiệm.</li>
               </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
