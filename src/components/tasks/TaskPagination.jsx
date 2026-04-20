export default function TaskPagination({ page, setPage, total, size }) {
  const totalPages = Math.ceil(total / size) || 1

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '3rem' }}>
      <button 
        onClick={() => setPage(p => Math.max(1, p - 1))} 
        disabled={page === 1} 
        className="btn-secondary" 
        style={{ opacity: page === 1 ? 0.3 : 1 }}
      >
        ←
      </button>
      <span style={{ background: 'rgba(0, 0, 0, 0.05)', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700 }}>
        {page} / {totalPages}
      </span>
      <button 
        onClick={() => setPage(p => p + 1)} 
        disabled={page >= totalPages} 
        className="btn-secondary" 
        style={{ opacity: page >= totalPages ? 0.3 : 1 }}
      >
        →
      </button>
    </div>
  )
}
