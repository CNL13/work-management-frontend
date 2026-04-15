import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import RoleBadge from '../components/RoleBadge'

export default function DepartmentStaff() {
  const [members, setMembers] = useState([])
  const [myUnit, setMyUnit] = useState(null)
  const [allUsers, setAllUsers] = useState([])  // user chưa có phòng
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

  // User chưa trong phòng này
  const availableUsers = allUsers.filter(
    u => u.role === 'User' && !members.find(m => m.id === u.id)
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Nhân sự phòng</h2>
            {myUnit && (
              <p className="text-sm text-blue-600 font-semibold mt-1">
                {myUnit.name}
              </p>
            )}
          </div>
          {isManager && (
            <button
              onClick={() => {
                setShowAdd(true)
                fetchAllUsers()
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Thêm nhân viên
            </button>
          )}
        </div>



        {/* Form thêm nhân viên */}
        {showAdd && isManager && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Thêm nhân viên vào phòng</h3>
            <form onSubmit={handleAddMember} className="flex gap-3">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Chọn nhân viên --</option>
                {availableUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.username} ({u.employeeCode})
                  </option>
                ))}
                {availableUsers.length === 0 && (
                  <option disabled>Không có nhân viên nào khả dụng</option>
                )}
              </select>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setSelectedUserId('') }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Hủy
              </button>
            </form>
          </div>
        )}

        {/* Danh sách nhân sự */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-700">
              Danh sách nhân sự ({members.length} người)
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-blue-50 text-blue-700">
              <tr>
                <th className="px-4 py-3 text-left">Mã NV</th>
                <th className="px-4 py-3 text-left">Họ và tên</th>
                <th className="px-4 py-3 text-left">Tên đăng nhập</th>
                <th className="px-4 py-3 text-left">Chức vụ</th>
                {isManager && <th className="px-4 py-3 text-left">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    Chưa có nhân viên nào trong phòng
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                      {m.employeeCode || '—'}
                    </td>
                    <td className="px-4 py-3 font-medium">{m.fullName || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{m.username}</td>
                    <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
                    {isManager && (
                      <td className="px-4 py-3">
                        {/* ✅ Không cho xóa Manager khỏi phòng */}
                        {m.role !== 'Manager' ? (
                          <button
                            onClick={() => handleRemoveMember(m.id, m.fullName || m.username)}
                            className="text-red-500 hover:underline text-sm font-medium"
                          >
                            Xóa khỏi phòng
                          </button>
                        ) : (
                          <span className="text-gray-300 text-xs italic">—</span>
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
  )
}