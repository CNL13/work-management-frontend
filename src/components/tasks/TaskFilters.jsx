export default function TaskFilters({ keyword, setKeyword, status, setStatus, setPage, onFetch }) {
  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '1rem', borderRadius: '1.25rem', marginBottom: '2.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        <input 
          type="text" 
          value={keyword} 
          onChange={(e) => setKeyword(e.target.value)} 
          className="input-modern shadow-inner" 
          style={{ paddingLeft: '2.5rem' }} 
          placeholder="Tìm nhanh theo tên hoặc mô tả..." 
        />
      </div>
      <select 
        value={status} 
        onChange={(e) => { setStatus(e.target.value); setPage(1) }} 
        className="input-modern hover-glow" 
        style={{ width: '200px' }}
      >
        <option value="">Tất cả trạng thái</option>
        <option value="NotStarted">Chưa bắt đầu</option>
        <option value="InProgress">Đang làm</option>
        <option value="Submitted">Đã báo cáo</option>
        <option value="Approved">Đã xong</option>
        <option value="Rejected">Xem lại</option>
      </select>
      <button onClick={onFetch} className="btn-primary" style={{ minWidth: '120px' }}>Lọc dữ liệu</button>
    </div>
  )
}
