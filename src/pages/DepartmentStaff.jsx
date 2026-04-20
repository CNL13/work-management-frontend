import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import RoleBadge from '../components/RoleBadge'

export default function DepartmentStaff() {
  const [members, setMembers] = useState([])
  const [myUnit, setMyUnit] = useState(null)
  const [allUsers, setAllUsers] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const { isManager } = useAuth()

  useEffect(() => {
    fetchMyUnit()
  }, [])

  const fetchMyUnit = async () => {
    try {
      const res = await api.get('/units/my-unit')
      setMyUnit(res.data)
      fetchMembers(res.data.id)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMembers = async (unitId) => {
    try {
      const res = await api.get(`/units/${unitId}/users`)
      setMembers(res.data || [])
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

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!selectedUserId || !myUnit) return
    try {
      await api.post(`/units/${myUnit.id}/members`, { userId: selectedUserId })
      toast.success('Đã thêm nhân viên vào phòng!')
      setSelectedUserId('')
      setShowAdd(false)
      fetchMembers(myUnit.id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thêm thất bại.')
    }
  }

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Xóa ${memberName} khỏi phòng?`)) return
    try {
      await api.delete(`/units/${myUnit.id}/members/${memberId}`)
      toast.success(`Đã xóa ${memberName} khỏi phòng!`)
      fetchMembers(myUnit.id)
    } catch (err) {
      toast.error('Xóa thất bại.')
    }
  }

  const availableUsers = allUsers.filter(
    u => u.role === 'User' && 
         (!u.unitId || u.unitId === '00000000-0000-0000-0000-000000000000') && 
         !members.find(m => m.id === u.id)
  )

  return (
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="animate-slide-left">
            <h2 className="section-title">🏘️ Nhân sự phòng</h2>
            {myUnit && (
              <p style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} className="ping-dot" />
                {myUnit.name}
              </p>
            )}
          </div>
          {isManager && (
            <button
              onClick={() => {
                setShowAdd(!showAdd)
                if (!showAdd) fetchAllUsers()
              }}
              className="btn-primary animate-slide-right"
            >
              {showAdd ? '✕ Đóng' : '+ Thêm nhân viên'}
            </button>
          )}
        </div>

        {showAdd && isManager && (
          <div className="glass-panel animate-scale-in" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '1rem', borderLeft: '4px solid var(--primary)' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              ➕ Thêm nhân viên vào phòng
            </h3>
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-modern"
                style={{ flex: 1, minWidth: '280px' }}
                required
              >
                <option value="">-- Chọn nhân viên đang trống --</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.username} ({u.employeeCode || 'No code'})
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary" style={{ minWidth: '120px' }}>
                Xác nhận thêm
              </button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary">
                Hủy
              </button>
            </form>
            {availableUsers.length === 0 && (
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                💡 Không tìm thấy nhân viên nào chưa có phòng ban.
              </p>
            )}
          </div>
        )}

        <div className="glass-panel animate-fade-in" style={{ borderRadius: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, color: 'var(--text-primary)' }}>
               👥 Danh sách thành viên
            </h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              <span style={{ color: 'var(--primary-light)' }}>{members.length}</span> nhân sự
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th style={{ paddingLeft: '1.5rem' }}>Mã NV</th>
                  <th>Họ và tên</th>
                  <th>Username</th>
                  <th>Số điện thoại</th>
                  <th>Chức vụ</th>
                  {isManager && <th style={{ paddingRight: '1.5rem', textAlign: 'right' }}>Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                      <p>Chưa có nhân viên nào trực thuộc</p>
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id}>
                      <td style={{ paddingLeft: '1.5rem', fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {m.employeeCode || '—'}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{m.fullName || '—'}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{m.username}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{m.phoneNumber || '—'}</td>
                      <td><RoleBadge role={m.role} /></td>
                      {isManager && (
                        <td style={{ paddingRight: '1.5rem', textAlign: 'right' }}>
                          {m.role !== 'Manager' ? (
                            <button
                              onClick={() => handleRemoveMember(m.id, m.fullName || m.username)}
                              className="btn-danger"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '0.5rem' }}
                            >
                              Gỡ bỏ
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quản lý</span>
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