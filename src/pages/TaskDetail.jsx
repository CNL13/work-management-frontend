import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import TaskComments from '../components/tasks/TaskComments'

export default function TaskDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [history, setHistory] = useState([])
  const [progresses, setProgresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    fetchTaskDetails()
  }, [id])

  const fetchTaskDetails = async () => {
    try {
      const [taskRes, historyRes, progRes] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get(`/tasks/${id}/history`),
        api.get(`/progress/task/${id}`)
      ])
      
      setTask(taskRes.data)
      setHistory(historyRes.data)
      setProgresses(progRes.data)
    } catch (err) {
      console.error(err)
      if (err.response?.status === 403) {
        setForbidden(true)
        toast.error('Bạn không có quyền truy cập công việc này', { toastId: 'forbiddenTask' })
      } else {
        toast.error('Không thể tải chi tiết công việc', { toastId: 'errorTask' })
      }
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async (file) => {
    try {
      const res = await api.get(`/upload/${file.id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.fileName || 'download')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (error) {
      toast.error("Không thể tải file")
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⏳ Đang tải...</div>
    </div>
  )

  if (forbidden) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel p-8" style={{ textAlign: 'center', borderRadius: '1rem', maxWidth: '400px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⛔</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--error)', marginBottom: '0.5rem', fontFamily: 'Outfit, sans-serif' }}>
            Truy cập bị từ chối
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Bạn không được phân công hoặc không có thẩm quyền để xem chi tiết công việc này.
          </p>
          <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '2rem', width: '100%' }}>
            Quay lại trang trước
          </button>
        </div>
      </div>
    </div>
  )

  if (!task) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>❌ Không tìm thấy công việc</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', gap: '2rem' }}>
        
        {/* Main Info */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-panel p-6" style={{ borderRadius: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                  ← Quay lại
                </button>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {task.title}
                </h1>
              </div>
              <StatusBadge status={task.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Thời hạn</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TG Dự kiến</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{task.estimatedHours}h</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TG Thực tế</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{task.actualHours || 0}h</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Mô tả công việc</h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', background: 'var(--bg-surface)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--glass-border)' }}>
                {task.description || 'Không có mô tả'}
              </div>
            </div>

            {task.files?.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Tài liệu đính kèm</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {task.files.map(f => (
                    <button key={f.id} onClick={() => downloadFile(f)} className="glass-panel ripple" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', cursor: 'pointer', background: 'var(--bg-surface)' }}>
                      📎 <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>{f.fileName}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {task.assignees?.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Thành viên tham gia</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {task.assignees.map(a => (
                    <span key={a.id} style={{ padding: '0.35rem 0.75rem', borderRadius: '2rem', background: 'var(--primary-light)', color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>
                      {a.fullName} ({a.employeeCode})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <TaskComments taskId={task.id} taskCreatedBy={task.createdBy} />
          </div>

        </div>

        {/* Sidebar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Lịch sử báo cáo (Progress) */}
          <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--glass-border)', fontWeight: 800, color: 'var(--text-primary)' }}>
              📈 Báo cáo tiến độ ({progresses.length})
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {progresses.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Chưa có báo cáo</div>
              ) : (
                progresses.map(p => (
                  <div key={p.id} style={{ background: 'var(--bg-main)', borderRadius: '0.75rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{p.userFullName}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                       <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px' }}>
                          <div style={{ width: `${p.percent}%`, height: '100%', background: 'var(--success)', borderRadius: '3px' }} />
                       </div>
                       <span style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--success)' }}>{p.percent}%</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.description}</div>
                    {p.reviewComment && (
                      <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(79, 70, 229, 0.05)', borderRadius: '0.5rem', fontSize: '0.75rem', color: 'var(--primary)', borderLeft: '3px solid var(--primary)', fontStyle: 'italic' }}>
                        💬 Sếp nhận xét: {p.reviewComment}
                      </div>
                    )}
                    {p.files?.length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        {p.files.map(f => (
                           <button key={f.id} onClick={() => downloadFile(f)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: 0, fontSize: '0.75rem' }}>📎 Tải minh chứng</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lịch sử chỉnh sửa (Audit Logs) */}
          <div className="glass-panel" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--glass-border)', fontWeight: 800, color: 'var(--text-primary)' }}>
              📜 Lịch sử thay đổi ({history.length})
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {history.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Không có lịch sử</div>
              ) : (
                history.map(h => (
                  <div key={h.id} style={{ fontSize: '0.8125rem', display: 'flex', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)', marginTop: '4px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--text-primary)' }}>Đã cập nhật <b>{h.fieldName}</b></div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '2px 0' }}>Từ: {h.oldValue}</div>
                      <div style={{ color: 'var(--success)', fontSize: '0.75rem' }}>Thành: {h.newValue}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem', marginTop: '4px' }}>{new Date(h.changedAt).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
