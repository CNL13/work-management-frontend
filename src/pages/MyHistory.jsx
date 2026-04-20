import { useState, useEffect } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'

export default function MyHistory() {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | Approved | Rejected | Submitted | InProgress
  const size = 15

  useEffect(() => {
    fetchHistory()
  }, [page])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const res = await api.get('/progress/my-history', { params: { page, size } })
      setRecords(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / size)

  const filteredRecords = filter === 'all'
    ? records
    : records.filter(r => r.status === filter)

  // Nhóm theo phòng ban
  const groupByUnit = () => {
    const groups = {}
    filteredRecords.forEach(r => {
      const unit = r.unitName || '—'
      if (!groups[unit]) groups[unit] = []
      groups[unit].push(r)
    })
    return groups
  }

  const unitGroups = groupByUnit()

  // Stats
  const stats = {
    total: records.length,
    approved: records.filter(r => r.status === 'Approved').length,
    rejected: records.filter(r => r.status === 'Rejected').length,
    submitted: records.filter(r => r.status === 'Submitted').length,
    inProgress: records.filter(r => r.status === 'InProgress').length,
  }

  const filters = [
    { key: 'all', label: 'Tất cả', count: stats.total, color: '#6366f1' },
    { key: 'Approved', label: 'Đã duyệt', count: stats.approved, color: '#10b981' },
    { key: 'Rejected', label: 'Bị từ chối', count: stats.rejected, color: '#ef4444' },
    { key: 'Submitted', label: 'Chờ duyệt', count: stats.submitted, color: '#f59e0b' },
    { key: 'InProgress', label: 'Đang làm', count: stats.inProgress, color: '#06b6d4' },
  ]

  return (
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }} className="animate-slide-left">
          <h2 className="section-title" style={{ fontSize: '1.85rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '2rem' }}>📚</span> Lịch sử công việc cá nhân
          </h2>
          <p className="section-subtitle">
            Toàn bộ báo cáo và kết quả phê duyệt từ tất cả phòng ban bạn đã từng công tác
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }} className="animate-fade-in">
          {filters.map((f, i) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="glass-card"
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                border: filter === f.key ? `2px solid ${f.color}` : '1px solid rgba(0, 0, 0, 0.06)',
                borderRadius: '1.25rem',
                background: filter === f.key ? `${f.color}10` : 'rgba(255,255,255,0.6)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textAlign: 'left',
                animationDelay: `${i * 0.05}s`,
                transform: filter === f.key ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: f.color, fontFamily: 'Outfit, sans-serif' }}>
                {f.count}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {f.label}
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="animate-float-premium" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>⏳</div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Đang tải lịch sử...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem', borderRadius: '1.75rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem', opacity: 0.2 }}>📭</div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>
              {filter === 'all' ? 'Chưa có báo cáo nào' : `Không có báo cáo "${filters.find(f => f.key === filter)?.label}"`}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Dữ liệu sẽ xuất hiện khi bạn nộp báo cáo tiến độ công việc.
            </p>
          </div>
        ) : (
          Object.entries(unitGroups).map(([unitName, items]) => (
            <div key={unitName} className="glass-panel animate-fade-in" style={{ borderRadius: '1.75rem', overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid rgba(0, 0, 0, 0.08)' }}>
              
              {/* Unit Header */}
              <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.3)' }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.625rem', margin: 0 }}>
                  <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem' }}>🏢</span>
                  {unitName}
                </h3>
                <span className="glass-card" style={{ padding: '0.35rem 0.875rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  {items.length} bản ghi
                </span>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '2rem', width: '30%' }}>Công việc</th>
                      <th style={{ textAlign: 'center', width: '10%' }}>Tiến độ</th>
                      <th style={{ width: '20%' }}>Mô tả</th>
                      <th style={{ textAlign: 'center', width: '10%' }}>Trạng thái</th>
                      <th style={{ width: '18%' }}>Nhận xét của sếp</th>
                      <th style={{ textAlign: 'right', paddingRight: '2rem', width: '12%' }}>Ngày gửi</th>
                    </tr>
                  </thead>
                  <tbody className="stagger-children">
                    {items.map((p, i) => (
                      <tr key={p.id} style={{ animationDelay: `${i * 0.03}s` }}>
                        <td style={{ paddingLeft: '2rem' }}>
                          <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{p.taskTitle}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                            👤 {p.userFullName} ({p.userEmployeeCode})
                          </div>
                          {p.hoursSpent > 0 && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>⏱ {p.hoursSpent}h thực tế</div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="progress-track" style={{ width: '40px', height: '6px' }}>
                              <div className="progress-fill" style={{
                                width: `${p.percent}%`,
                                background: p.percent >= 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #4f46e5, #06b6d4)'
                              }} />
                            </div>
                            <span style={{ fontWeight: 900, fontSize: '0.75rem', color: p.percent >= 100 ? '#10b981' : 'var(--primary-light)' }}>{p.percent}%</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                            {p.description || '—'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <StatusBadge status={p.status} submittedLabel="Chờ duyệt" />
                        </td>
                        <td>
                          {p.reviewComment ? (
                            <div style={{ fontSize: '0.75rem', color: p.status === 'Approved' ? '#10b981' : '#ef4444', fontWeight: 700, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.status === 'Approved' ? '✓' : '✗'} {p.reviewComment}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>
                        <td style={{ paddingRight: '2rem', textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {p.updatedAt ? new Date(p.updatedAt + "Z").toLocaleString('vi-VN') : '—'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }} className="animate-fade-in">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="glass-card"
              style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1, border: '1px solid rgba(0,0,0,0.08)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}
            >
              ← Trước
            </button>
            <div className="glass-card" style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', fontWeight: 800, fontSize: '0.8rem', color: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              {page} / {totalPages}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="glass-card"
              style={{ padding: '0.5rem 1rem', borderRadius: '0.75rem', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, border: '1px solid rgba(0,0,0,0.08)', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}
            >
              Sau →
            </button>
          </div>
        )}

        {/* Info Panel */}
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem 2rem', borderRadius: '1.5rem', marginTop: '2rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
          <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💡</span> THÔNG TIN
          </h4>
          <ul style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li style={{ display: 'flex', gap: '0.5rem' }}><b>•</b> Trang này hiển thị toàn bộ lịch sử báo cáo từ <b>tất cả phòng ban</b> bạn đã từng công tác.</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}><b>•</b> Dữ liệu được nhóm theo phòng ban để dễ tra cứu khi cần khen thưởng hoặc đánh giá.</li>
            <li style={{ display: 'flex', gap: '0.5rem' }}><b>•</b> Khi chuyển phòng hoặc thay đổi chức vụ, lịch sử công việc <b>không bao giờ bị xóa</b>.</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
