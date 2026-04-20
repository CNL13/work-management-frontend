export default function RoleBadge({ role }) {
  if (role === 'Admin') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.625rem', borderRadius: '9999px',
      fontSize: '0.7rem', fontWeight: 700,
      background: 'rgba(239,68,68,0.15)', color: '#fca5a5',
      border: '1px solid rgba(239,68,68,0.3)',
    }}>
      🛡️ Admin
    </span>
  )
  if (role === 'Manager') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.625rem', borderRadius: '9999px',
      fontSize: '0.7rem', fontWeight: 700,
      background: 'rgba(245,158,11,0.15)', color: '#fcd34d',
      border: '1px solid rgba(245,158,11,0.3)',
    }}>
      👑 Trưởng phòng
    </span>
  )
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.625rem', borderRadius: '9999px',
      fontSize: '0.7rem', fontWeight: 700,
      background: 'rgba(79,70,229,0.15)', color: '#a5b4fc',
      border: '1px solid rgba(79,70,229,0.3)',
    }}>
      👤 Nhân viên
    </span>
  )
}
