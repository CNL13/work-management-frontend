import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import RoleBadge from '../components/RoleBadge'

export default function Units() {
  const { isAdmin, isManager } = useAuth()

  const [units, setUnits] = useState([])
  const [myUnit, setMyUnit] = useState(null)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [members, setMembers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [form, setForm] = useState({ name: '' })
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')

  useEffect(() => {
    if (isAdmin || isManager) {
      fetchUnits()
      fetchAllUsers()
    }
    if (!isAdmin) fetchMyUnit()
  }, [])

  const fetchUnits = async () => {
    try {
      const res = await api.get('/units')
      setUnits(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyUnit = async () => {
    try {
      const res = await api.get('/units/my-unit')
      setMyUnit(res.data)
      if (res.data?.id) fetchMembers(res.data.id)
    } catch (err) {}
  }

  const fetchMembers = async (unitId) => {
    try {
      const res = await api.get(`/units/${unitId}/users`)
      setMembers(res.data || [])
      setSelectedUnit(unitId)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/users')
      setAllUsers(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editId) {
        await api.put(`/units/${editId}`, form)
        toast.success('Cập nhật đơn vị thành công!')
      } else {
        await api.post('/units', form)
        toast.success('Thêm đơn vị thành công!')
      }
      setForm({ name: '' })
      setEditId(null)
      setShowForm(false)
      fetchUnits()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đơn vị này?')) return
    try {
      await api.delete(`/units/${id}`)
      toast.success('Xóa đơn vị thành công!')
      if (selectedUnit === id) { setSelectedUnit(null); setMembers([]) }
      fetchUnits()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại.')
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!selectedUserId || !selectedUnit) return
    try {
      await api.post(`/units/${selectedUnit}/members`, { userId: selectedUserId })
      toast.success('Đã thêm thành viên!')
      setSelectedUserId('')
      setShowAddMember(false)
      fetchMembers(selectedUnit)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thêm thất bại.')
    }
  }

  const handleRemoveMember = async (unitId, memberId) => {
    if (!window.confirm('Xóa thành viên này khỏi đơn vị?')) return
    try {
      await api.delete(`/units/${unitId}/members/${memberId}`)
      toast.success('Đã xóa thành viên!')
      fetchMembers(unitId)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thành viên thất bại.')
    }
  }

  // --- RENDERING HELPERS ---

  const renderUnitsTable = () => (
    <div className="glass-panel animate-slide-left" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>Danh sách đơn vị</h3>
        <span className="badge badge-blue">{units.length} phòng</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.5rem' }}>Tên đơn vị</th>
              <th>Quản lý</th>
              {isAdmin && <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {units.length === 0 ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Chưa có đơn vị</td></tr>
            ) : (
              units.map((unit) => {
                const manager = allUsers.find(u => u.role === 'Manager' && u.unitId === unit.id)
                const isActive = selectedUnit === unit.id
                return (
                  <tr
                    key={unit.id}
                    onClick={() => fetchMembers(unit.id)}
                    style={{ 
                      cursor: 'pointer', 
                      background: isActive ? 'rgba(79,70,229,0.1)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary-light)' : '3px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <td style={{ paddingLeft: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{unit.name}</td>
                    <td style={{ color: 'var(--primary-light)', fontSize: '0.8125rem' }}>
                      {manager ? manager.fullName : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>Chưa có</span>}
                    </td>
                    {isAdmin && (
                      <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                          <button onClick={() => { setEditId(unit.id); setForm({ name: unit.name }); setShowForm(true) }} style={{ color: 'var(--primary-light)', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Sửa</button>
                          <button onClick={() => handleDelete(unit.id)} style={{ color: 'var(--danger)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Xóa</button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderMembersTable = (isEditable = false) => (
    <div className="glass-panel animate-slide-right" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>👤</span>
          <span>Thành viên: {units.find(u => u.id === selectedUnit)?.name || ''}</span>
        </h3>
        {isEditable && selectedUnit && (
          <button onClick={() => setShowAddMember(!showAddMember)} className="btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
            {showAddMember ? '✕ Đóng' : '+ Thêm'}
          </button>
        )}
      </div>

      {showAddMember && isEditable && selectedUnit && (
        <div className="animate-slide-down" style={{ padding: '1rem', background: 'rgba(0, 0, 0, 0.02)', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
          <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="input-modern"
              style={{ padding: '0.4rem' }}
              required
            >
              <option value="">-- Chọn nhân viên --</option>
              {allUsers
                .filter(u => u.role === 'User' && !members.find(m => m.id === u.id))
                .map(u => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.employeeCode})</option>
                ))}
            </select>
            <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem' }}>Thêm</button>
          </form>
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ paddingLeft: '1.5rem' }}>Mã NV</th>
              <th>Họ tên</th>
              <th>Vai trò</th>
              {isEditable && <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {!selectedUnit ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Hãy chọn một đơn vị</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chưa có thành viên nào</td></tr>
            ) : (
              members.map(m => (
                <tr key={m.id}>
                  <td style={{ paddingLeft: '1.5rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.7rem' }}>{m.employeeCode || '—'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.fullName || m.username}</td>
                  <td><RoleBadge role={m.role} /></td>
                  {isEditable && (
                    <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                      {m.role !== 'Manager' && (
                        <button onClick={() => handleRemoveMember(selectedUnit, m.id)} className="btn-danger" style={{ padding: '3px 8px', fontSize: '0.7rem', borderRadius: '4px' }}>Xóa</button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  // --- FINAL RENDER ---

  return (
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ padding: '1.75rem 2rem', maxWidth: '1300px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title">🏛️ Quản lý Đơn vị</h2>
            <p className="section-subtitle">Tổ chức phòng ban và quản lý nhân sự trực thuộc</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '' }) }}
              className="btn-primary animate-slide-right"
            >
              {showForm ? '✕ Đóng form' : '+ Thêm đơn vị'}
            </button>
          )}
        </div>

        {/* Form create/edit (Admin only) */}
        {showForm && isAdmin && (
          <div className="glass-panel animate-scale-in" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '1rem', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              {editId ? '📝 Chỉnh sửa thông tin đơn vị' : '➕ Tạo đơn vị phòng ban mới'}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ name: e.target.value })}
                className="input-modern"
                style={{ flex: 1, minWidth: '300px' }}
                placeholder="Ví dụ: Phòng Kỹ thuật, Tổ Hành chính..."
                required
              />
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                {editId ? 'Cập nhật' : 'Tạo mới ngay'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary">Hủy</button>
            </form>
          </div>
        )}

        {/* User View — Just see my unit */}
        {!isAdmin && !isManager ? (
           <div style={{ maxWidth: '800px', margin: '0 auto' }}>
             {!myUnit ? (
               <div className="glass-panel animate-pulse-glow" style={{ padding: '4rem', textAlign: 'center', borderRadius: '1.5rem' }}>
                 <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Bạn chưa được gán vào đơn vị nào. Vui lòng liên hệ Admin.</p>
               </div>
             ) : (
               renderMembersTable(false)
             )}
           </div>
        ) : (
          /* Admin & Manager View — Split grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            {renderUnitsTable()}
            {renderMembersTable(isManager)}
          </div>
        )}

      </div>
    </div>
  )
}