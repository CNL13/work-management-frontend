import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import RoleBadge from '../components/RoleBadge'

export default function Users() {
  const [users, setUsers] = useState([])
  const [units, setUnits] = useState([])
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState({ username: '', fullName: '', role: 'User', unitId: null })
  const [showForm, setShowForm] = useState(false)

  const [keyword, setKeyword] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterUnit, setFilterUnit] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  const { isAdmin } = useAuth()

  useEffect(() => {
    fetchUsers()
    fetchUnits()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data || [])
      setIsSearching(false)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUnits = async () => {
    try {
      const res = await api.get('/units')
      setUnits(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = async (e) => {
    e?.preventDefault()
    try {
      const params = {}
      if (keyword) params.keyword = keyword
      if (filterRole) params.role = filterRole
      if (filterUnit) params.unitId = filterUnit

      const res = await api.get('/users/search', { params })
      setUsers(res.data || [])
      setIsSearching(true)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReset = () => {
    setKeyword('')
    setFilterRole('')
    setFilterUnit('')
    setIsSearching(false)
    fetchUsers()
  }

  const handleEdit = (user) => {
    setEditId(user.id)
    setForm({
      username: user.username,
      fullName: user.fullName || '',
      role: user.role,
      unitId: user.unitId || null
    })
    setShowForm(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      // ✅ TÍNH TOÁN DỮ LIỆU BÀN GIAO: Tìm sếp cũ nếu có xung đột
      let handoverData = {};
      if (form.role === 'Manager' && form.unitId) {
        const oldM = users.find(u => u.unitId === form.unitId && u.role === 'Manager' && u.id !== editId);
        if (oldM) {
          handoverData = {
            oldManagerId: oldM.id,
            oldManagerAction: form.oldManagerAction || 'Demote',
            oldManagerNewUnitId: form.oldManagerNewUnitId
          };
        }
      }

      await api.put(`/users/${editId}`, {
        role: form.role,
        unitId: form.unitId,
        ...handoverData
      })
      toast.success('Cập nhật người dùng thành công!')
      setShowForm(false)
      setEditId(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('Xóa người dùng thành công!')
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại.')
    }
  }

  const handleResetPassword = async (user) => {
    const newPassword = window.prompt(
      `Nhập mật khẩu mới cho "${user.fullName || user.username}":\n(Tối thiểu 6 ký tự)`,
      ''
    )
    if (!newPassword) return
    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }
    try {
      await api.post('/auth/reset-password', {
        username: user.username,
        newPassword
      })
      toast.success(`Đã đặt lại mật khẩu cho "${user.fullName || user.username}"!`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại!')
    }
  }

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId)
    return unit ? unit.name : '—'
  }

  // ✅ HELPER: Tìm sếp cũ để hiển thị cảnh báo
  const getOldManager = () => {
    if (form.role !== 'Manager' || !form.unitId) return null;
    return users.find(u => u.unitId === form.unitId && u.role === 'Manager' && u.id !== editId);
  }

  const oldM = getOldManager();

  return (
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ padding: '1.75rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title">👥 Quản lý người dùng</h2>
            <p className="section-subtitle">Danh sách tất cả tài khoản trong hệ thống</p>
          </div>
        </div>

        <div className="glass-panel animate-slide-down" style={{ padding: '1.25rem', marginBottom: '1.5rem', borderRadius: '1rem' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Tìm kiếm
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tên, mã NV, username..."
                className="input-modern"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Chức vụ
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input-modern"
                style={{ width: '140px' }}
              >
                <option value="">Tất cả</option>
                <option value="Manager">Trưởng phòng</option>
                <option value="User">Nhân viên</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                Phòng ban
              </label>
              <select
                value={filterUnit}
                onChange={(e) => setFilterUnit(e.target.value)}
                className="input-modern"
                style={{ width: '200px' }}
              >
                <option value="">Tất cả phòng</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn-primary" style={{ padding: '0.7rem 1.25rem' }}>
                🔍 Tìm kiếm
              </button>
              {isSearching && (
                <button type="button" onClick={handleReset} className="btn-secondary" style={{ padding: '0.7rem' }}>
                  ✕
                </button>
              )}
            </div>
          </form>
          {isSearching && (
            <p style={{ fontSize: '0.7rem', color: 'var(--primary-light)', marginTop: '0.75rem', fontWeight: 600 }}>
               Tìm thấy {users.length} kết quả phù hợp
            </p>
          )}
        </div>

        {showForm && isAdmin && (
          <div className="glass-panel animate-scale-in" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              ✏️ Chỉnh sửa người dùng
            </h3>
            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Họ và tên</label>
                  <input type="text" value={form.fullName} disabled className="input-modern" style={{ opacity: 0.6 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Username</label>
                  <input type="text" value={form.username} disabled className="input-modern" style={{ opacity: 0.6 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Vai trò</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="input-modern"
                  >
                    <option value="User">Nhân viên</option>
                    <option value="Manager">Trưởng phòng</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {(form.role === 'Manager' || form.role === 'User') && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      Phòng ban
                    </label>
                    <select
                      value={form.unitId || ''}
                      onChange={(e) => setForm({ ...form, unitId: e.target.value || null })}
                      className="input-modern"
                    >
                      <option value="">-- Chọn phòng ban / Chưa gán --</option>
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* ✅ MỚI: SECTION XỬ LÝ SẾP CŨ KHI BỔ NHIỆM SẾP MỚI */}
              {oldM && (
                <div className="animate-fade-in" style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1rem', borderRadius: '0.75rem', border: '1px dashed var(--warning)' }}>
                   <p style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 700, marginBottom: '0.75rem' }}>
                     ⚠️ XUNG ĐỘT: <strong>{oldM.fullName || oldM.username}</strong> đang là Trưởng phòng này. Bạn muốn xử lý sếp cũ ra sao?
                   </p>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" value="Demote" checked={form.oldManagerAction !== 'Transfer' && form.oldManagerAction !== 'Remove'} onChange={() => setForm({...form, oldManagerAction: 'Demote'})} />
                        Hạ cấp thành Nhân viên (tại phòng hiện tại)
                      </label>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" value="Transfer" checked={form.oldManagerAction === 'Transfer'} onChange={() => setForm({...form, oldManagerAction: 'Transfer'})} />
                        Chuyển sang phòng ban khác (làm Nhân viên)
                      </label>
                      {form.oldManagerAction === 'Transfer' && (
                        <select 
                          className="input-modern" 
                          style={{ marginLeft: '1.5rem', fontSize: '0.75rem', padding: '0.4rem' }}
                          value={form.oldManagerNewUnitId || ''}
                          onChange={(e) => setForm({...form, oldManagerNewUnitId: e.target.value})}
                          required
                        >
                          <option value="">-- Chọn phòng ban mới --</option>
                          {units.filter(u => u.id !== form.unitId).map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                          ))}
                        </select>
                      )}
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input type="radio" value="Remove" checked={form.oldManagerAction === 'Remove'} onChange={() => setForm({...form, oldManagerAction: 'Remove'})} />
                        Gỡ bỏ khỏi phòng ban (về trạng thái Chưa gán)
                      </label>
                   </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-primary">Cập nhật</button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary">Hủy</button>
              </div>
            </form>
          </div>
        )}

        <div className="glass-panel animate-fade-in" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>Mã NV</th>
                  <th>Họ và tên</th>
                  <th>Username</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Phòng ban</th>
                  {isAdmin && <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                       <p>Không có dữ liệu người dùng</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ paddingLeft: '1.5rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {user.employeeCode || '—'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {keyword && user.fullName?.toLowerCase().includes(keyword.toLowerCase()) ? (
                          <span style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>{user.fullName}</span>
                        ) : (
                          user.fullName || '—'
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{user.username}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{user.phoneNumber || '—'}</td>
                      <td><RoleBadge role={user.role} /></td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {user.unitId ? getUnitName(user.unitId) : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>Chưa gán</span>}
                      </td>
                      {isAdmin && (
                        <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                          {user.role !== 'Admin' ? (
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                               <button onClick={() => handleEdit(user)} title="Sửa" style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)', color: 'var(--primary-light)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                 Sửa
                               </button>
                               <button onClick={() => handleResetPassword(user)} title="Reset Pass" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: 'var(--warning)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                 Reset MK
                               </button>
                               <button onClick={() => handleDelete(user.id)} title="Xóa" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem' }}>
                                 Xóa
                               </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mặc định</span>
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
      </div>
    </div>
  )
}