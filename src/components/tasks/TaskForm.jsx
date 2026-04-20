import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../../services/api'

export default function TaskForm({ editId, initialData, users, myUnit, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', description: '', dueDate: '', userIds: [], unitIds: [], estimatedHours: 0
  })
  const [userSearch, setUserSearch] = useState('')
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm(initialData)
    }
  }, [initialData])

  const toggleUser = (uid) => {
    setForm(prev => ({
      ...prev,
      userIds: prev.userIds.includes(uid)
        ? prev.userIds.filter(id => id !== uid)
        : [...prev.userIds, uid]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editId && !file) {
      toast.error('Bắt buộc phải đính kèm file tài liệu khi khởi tạo nhiệm vụ mới.')
      return
    }

    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('File đính kèm quá lớn. Vui lòng chọn file dưới 10MB.')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
        unitIds: myUnit ? [myUnit.id] : form.unitIds
      }

      if (editId) {
        await api.put(`/tasks/${editId}`, payload)
        // Upload file khi sửa task
        if (file) {
          const formData = new FormData()
          formData.append('file', file)
          await api.post(`/Upload?taskId=${editId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
        toast.success('Cập nhật task thành công!')
      } else {
        const res = await api.post('/tasks', payload)
        const taskId = res.data?.id
        if (file && taskId) {
          const formData = new FormData()
          formData.append('file', file)
          await api.post(`/Upload?taskId=${taskId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
        toast.success('Tạo task thành công!')
      }
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass-panel animate-scale-in" style={{ borderRadius: '1.25rem', padding: '2rem', marginBottom: '2.5rem', border: '1px solid rgba(0, 0, 0, 0.12)' }}>
      <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        {editId ? '✏️ Hiệu chỉnh nhiệm vụ' : '✨ Khởi tạo nhiệm vụ mới'}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Tên nhiệm vụ *</label>
            <input 
              type="text" 
              value={form.title} 
              onChange={(e) => setForm({ ...form, title: e.target.value })} 
              className="input-modern" 
              placeholder="Gói thầu thiết kế..." 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Thời hạn hoàn thành</label>
            <input 
              type="date" 
              value={form.dueDate} 
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })} 
              min={new Date().toISOString().split('T')[0]} 
              className="input-modern" 
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Giờ dự kiến (Hours)</label>
            <input 
              type="number" 
              step="0.5"
              min="0"
              value={form.estimatedHours} 
              onChange={(e) => setForm({ ...form, estimatedHours: parseFloat(e.target.value) || 0 })} 
              className="input-modern" 
              placeholder="VD: 8.5"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mô tả chi tiết</label>
            <textarea 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              className="input-modern" 
              rows={4} 
              placeholder="Nội dung cụ thể..." 
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!editId && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                   <label style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Giao cho (Nhân sự phòng)</label>
                   <input 
                     type="text" 
                     placeholder="🔍 Tìm tên..." 
                     value={userSearch} 
                     onChange={e => setUserSearch(e.target.value)} 
                     style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.1)', background: 'transparent' }} 
                   />
                </div>
                <div className="glass-card" style={{ padding: '1rem', maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {users.filter(u => u.role === 'User' && (u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) || u.username?.toLowerCase().includes(userSearch.toLowerCase()))).map(u => (
                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem', transition: 'background 0.2s' }} className="hover:bg-white/5">
                      <input 
                        type="checkbox" 
                        checked={form.userIds.includes(u.id)} 
                        onChange={() => toggleUser(u.id)} 
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} 
                      />
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        {u.fullName || u.username} <small style={{ color: 'var(--text-muted)' }}>{u.employeeCode}</small>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              {editId ? 'Đính kèm thêm file' : 'Tài liệu yêu cầu (PDF/Docx/Image)'}
            </label>
            <div style={{ position: 'relative' }}>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              <div style={{ padding: '1.5rem', border: '2px dashed rgba(0, 0, 0, 0.1)', borderRadius: '1rem', textAlign: 'center', background: 'rgba(0, 0, 0, 0.02)' }}>
                <span style={{ fontSize: '1.5rem', display: 'block' }}>📁</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{file ? `📎 ${file.name}` : 'Nhấn hoặc kéo thả file vào đây'}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
            <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
              {editId ? (isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi') : (isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo')}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>Hủy bỏ</button>
          </div>
        </div>
      </form>
    </div>
  )
}
