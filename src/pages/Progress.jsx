import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

export default function Progress() {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState('')
  const [percent, setPercent] = useState(100)
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [progresses, setProgresses] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [hoursSpent, setHoursSpent] = useState(0) // ✅ MỚI
  const { userId, role } = useAuth()

  useEffect(() => {
    if (role !== null) {
      fetchProgresses()
      if (role === 'User') fetchMyTasks()
    }
  }, [role])

  const fetchMyTasks = async () => {
    try {
      const res = await api.get('/tasks', { params: { page: 1, size: 100, myTasks: true } })
      setTasks((res.data.data || []).filter(t => t.status !== 'Approved'))
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProgresses = async () => {
    try {
      const res = await api.get('/progress', { params: { page: 1, size: 100 } })
      const all = res.data.data || []
      if (role === 'User') {
        setProgresses(all.filter(p => p.userId === userId))
      } else {
        setProgresses(all)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTask) { toast.error('Vui lòng chọn công việc!'); return }
    if (!file) { toast.error('Bắt buộc đính kèm file minh chứng kết quả!'); return }
    setLoading(true)
    try {
      let fileId = null
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await api.post('/Upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        fileId = uploadRes.data?.id
      }

      await api.post('/progress', {
        taskId: selectedTask,
        userId,
        percent: parseInt(percent),
        description,
        fileId,
        hoursSpent: parseFloat(hoursSpent) || 0 // ✅ MỚI
      })

      toast.success('✅ Gửi báo cáo tiến độ thành công!')
      setSelectedTask('')
      setPercent(100)
      setDescription('')
      setHoursSpent(0) // ✅ MỚI
      setFile(null)
      fetchProgresses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi báo cáo thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const displayedProgresses = filterStatus
    ? progresses.filter(p => p.status === filterStatus)
    : progresses

  const getProgressColor = (p) => {
    if (p >= 100) return 'linear-gradient(90deg, #10b981, #059669)'
    if (p >= 70) return 'linear-gradient(90deg, #4f46e5, #06b6d4)'
    if (p >= 40) return 'linear-gradient(90deg, #f59e0b, #d97706)'
    return 'linear-gradient(90deg, #ef4444, #dc2626)'
  }

  return (
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title">
              {role === 'Manager' ? '📊 Giám sát tiến độ' : '📝 Báo cáo công việc'}
            </h2>
            <p className="section-subtitle">
              {role === 'Manager'
                ? 'Theo dõi tình hình thực hiện công việc của phòng ban'
                : 'Cập nhật và theo dõi tiến độ các công việc được giao'}
            </p>
          </div>
          {role === 'Manager' && (
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="input-modern"
              style={{ width: 'auto', minWidth: '180px' }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Submitted">Chờ duyệt</option>
              <option value="Approved">Đã duyệt</option>
              <option value="Rejected">Bị từ chối</option>
            </select>
          )}
        </div>

        {role === 'User' && (
          <div className="glass-panel animate-slide-up" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '1.25rem' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '2px' }} />
              Gửi báo cáo mới
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Chọn công việc *
                  </label>
                  <select
                    value={selectedTask}
                    onChange={e => setSelectedTask(e.target.value)}
                    className="input-modern"
                    required
                  >
                    <option value="">-- Chọn công việc --</option>
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  {tasks.length === 0 && (
                    <p style={{ fontSize: '0.7rem', color: 'var(--warning)', marginTop: '0.5rem' }}>⚠️ Hiện không có công việc nào đang thực hiện</p>
                  )}
                  
                  {selectedTask && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.1)', borderRadius: '0.75rem' }}>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Chi tiết yêu cầu</p>
                      {(() => {
                        const t = tasks.find(x => x.id === selectedTask)
                        if (!t) return null
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{t.description || "Không có mô tả"}</p>
                            {t.dueDate && (
                              <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>⏰ Hạn chót: <b>{new Date(t.dueDate).toLocaleDateString('vi-VN')}</b></p>
                            )}
                            {t.files?.length > 0 && (
                              <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.25rem' }}>Tài liệu gốc:</p>
                                {t.files.map(f => (
                                  <a key={f.id} href={`${api.defaults.baseURL}/upload/${f.id}`} target="_blank" rel="noreferrer"
                                     style={{ display: 'block', color: 'var(--accent)', fontSize: '0.75rem', textDecoration: 'none' }}>
                                    📎 {f.fileName}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Tiến độ hoàn thành * (%)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={percent}
                      onChange={e => setPercent(e.target.value)}
                      className="input-modern"
                      style={{ width: '80px' }}
                      required
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={percent}
                      onChange={e => setPercent(e.target.value)}
                      style={{ flex: 1, accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontWeight: 800, color: 'var(--primary-light)', width: '40px' }}>{percent}%</span>
                  </div>
                  <div style={{ marginTop: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      File minh chứng
                    </label>
                    <input
                      type="file"
                      onChange={e => setFile(e.target.files[0])}
                      className="input-modern"
                      style={{ padding: '0.5rem' }}
                    />
                    {file && <p style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '0.25rem' }}>📎 {file.name}</p>}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Thời gian thực hiện (Số giờ) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="48"
                    value={hoursSpent}
                    onChange={e => setHoursSpent(e.target.value)}
                    className="input-modern"
                    placeholder="VD: 2.5"
                    required
                  />
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>💡 Nhập số giờ bạn đã thực sự bỏ ra cho đợt cập nhật này.</p>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Nội dung báo cáo
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-modern"
                  rows={3}
                  placeholder="Mô tả chi tiết những gì bạn đã làm..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={loading || tasks.length === 0}
                  className="btn-primary"
                  style={{ minWidth: '160px', padding: '0.875rem' }}
                >
                  {loading ? '⏳ Đang gửi...' : '📤 Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="glass-panel animate-fade-in" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>
               📋 {role === 'Manager' ? 'Báo cáo của phòng ban' : 'Lịch sử báo cáo của tôi'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{displayedProgresses.length} bản ghi</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>Công việc</th>
                  {role === 'Manager' && <th>Nhân viên</th>}
                  <th>Tiến độ</th>
                  <th>Minh chứng</th>
                  <th>Số giờ</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Nhận xét của sếp</th>
                  <th style={{ paddingRight: '1.5rem' }}>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {displayedProgresses.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'Manager' ? 8 : 7} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                      <p>Chưa có dữ liệu báo cáo nào</p>
                    </td>
                  </tr>
                ) : (
                  displayedProgresses.map(p => (
                    <tr key={p.id}>
                      <td style={{ paddingLeft: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{p.taskTitle || '—'}</td>
                      {role === 'Manager' && (
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{p.userFullName}</div>
                          <div style={{ color: 'var(--accent)', fontSize: '0.6rem', fontFamily: 'monospace' }}>{p.userEmployeeCode}</div>
                        </td>
                      )}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <div className="progress-track" style={{ width: '60px' }}>
                            <div className="progress-fill" style={{ width: `${p.percent}%`, background: getProgressColor(p.percent) }} />
                          </div>
                          <span style={{ fontWeight: 800, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>{p.percent}%</span>
                        </div>
                      </td>
                      <td>
                        {p.files?.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {p.files.map(f => (
                              <button key={f.id} onClick={async () => {
                                try {
                                  // Secure download using API with Bearer token
                                  const res = await api.get(`/upload/${f.id}`, { responseType: 'blob' });
                                  const url = window.URL.createObjectURL(new Blob([res.data]));
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.setAttribute('download', f.fileName || 'download');
                                  document.body.appendChild(link);
                                  link.click();
                                  link.parentNode.removeChild(link);
                                } catch (error) {
                                  console.error("Download failed", error);
                                  toast.error("Không thể tải file, vui lòng thử lại sau.");
                                }
                              }} style={{ color: 'var(--accent)', fontSize: '0.75rem', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                                📎 Tải về
                              </button>
                            ))}
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.8125rem' }}>{p.hoursSpent || 0}h</td>
                      <td style={{ maxWidth: '200px' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.description || '—'}
                        </p>
                      </td>
                      <td><StatusBadge status={p.status} submittedLabel="Chờ duyệt" /></td>
                      <td>
                        {p.reviewComment ? (
                          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, fontStyle: 'italic', background: 'rgba(79, 70, 229, 0.05)', padding: '0.4rem', borderRadius: '0.5rem', border: '1px dashed var(--primary-light)' }}>
                            💬 {p.reviewComment}
                          </div>
                        ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>}
                      </td>
                      <td style={{ paddingRight: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
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
    </div>
  )
}
