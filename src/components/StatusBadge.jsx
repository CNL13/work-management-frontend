export default function StatusBadge({ status, submittedLabel = 'Đã nộp' }) {
  const config = {
    Approved:   { label: 'Đã phê duyệt', icon: '✅', style: { background: 'rgba(16,185,129,0.1)', color: '#047857', border: '1px solid rgba(16,185,129,0.2)' } },
    Rejected:   { label: 'Bị từ chối',   icon: '❌', style: { background: 'rgba(239,68,68,0.1)',  color: '#b91c1c', border: '1px solid rgba(239,68,68,0.2)' } },
    Submitted:  { label: submittedLabel,  icon: '📤', style: { background: 'rgba(245,158,11,0.1)', color: '#b45309', border: '1px solid rgba(245,158,11,0.2)' } },
    InProgress: { label: 'Đang thực hiện', icon: '⚡', style: { background: 'rgba(99,102,241,0.1)', color: '#4338ca', border: '1px solid rgba(99,102,241,0.2)' } },
    NotStarted: { label: 'Chưa bắt đầu',  icon: '⏳', style: { background: 'rgba(100,116,139,0.1)', color: '#334155', border: '1px solid rgba(100,116,139,0.2)' } },
  }

  const item = config[status] || { label: status, icon: '•', style: { background: 'rgba(100,116,139,0.15)', color: 'var(--text-muted)', border: '1px solid rgba(100,116,139,0.3)' } }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.2rem 0.625rem',
      borderRadius: '9999px',
      fontSize: '0.7rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
      ...item.style,
    }}>
      <span style={{ fontSize: '0.75rem' }}>{item.icon}</span>
      {item.label}
    </span>
  )
}
