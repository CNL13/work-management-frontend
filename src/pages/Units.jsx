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
      toast.error('Thao tác thất bại.')
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
      toast.error('Xóa thất bại.')
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
      toast.error('Xóa thành viên thất bại.')
    }
  }

  // ✅ User — chỉ xem phòng của mình
  if (!isAdmin && !isManager) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Phòng của tôi</h2>
          {!myUnit ? (
            <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">
              Bạn chưa được gán vào phòng nào
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 border-b bg-blue-50">
                <h3 className="text-lg font-semibold text-blue-700">{myUnit.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Danh sách thành viên</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Mã NV</th>
                    <th className="px-4 py-3 text-left">Họ tên</th>
                    <th className="px-4 py-3 text-left">Vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-6 text-gray-400">Chưa có thành viên</td></tr>
                  ) : (
                    members.map(m => (
                      <tr key={m.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-400 text-xs font-mono">{m.employeeCode || '—'}</td>
                        <td className="px-4 py-3 font-medium">{m.fullName || m.username}</td>
                        <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ✅ Admin — quản lý đơn vị + xem thành viên (không thêm/xóa thành viên)
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="p-6 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Quản lý đơn vị</h2>
            <button
              onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '' }) }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Thêm đơn vị
            </button>
          </div>



          {/* Form tạo/sửa */}
          {showForm && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {editId ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị mới'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên đơn vị</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên đơn vị"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                    {editId ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null) }}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Danh sách đơn vị */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-3 border-b bg-blue-50">
                <h3 className="font-semibold text-blue-700">Danh sách đơn vị</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Tên đơn vị</th>
                    <th className="px-4 py-3 text-left">Trưởng phòng</th>
                    <th className="px-4 py-3 text-left">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {units.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-6 text-gray-400">Chưa có đơn vị nào</td></tr>
                  ) : (
                    units.map((unit) => {
                      // ✅ Tìm manager của phòng này
                      const manager = allUsers.find(u => u.role === 'Manager' && u.unitId === unit.id)
                      return (
                        <tr
                          key={unit.id}
                          className={`border-t hover:bg-gray-50 cursor-pointer ${selectedUnit === unit.id ? 'bg-blue-50' : ''}`}
                          onClick={() => fetchMembers(unit.id)}
                        >
                          <td className="px-4 py-3 font-medium">{unit.name}</td>
                          <td className="px-4 py-3 text-sm">
                            {manager ? (
                              <span className="text-purple-700 font-medium">
                                {manager.fullName || manager.username}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs italic">Chưa có</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => { setEditId(unit.id); setForm({ name: unit.name }); setShowForm(true) }}
                                className="text-blue-600 hover:underline text-xs font-medium"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(unit.id)}
                                className="text-red-500 hover:underline text-xs font-medium"
                              >
                                Xóa
                              </button>
                              <button
                                onClick={() => fetchMembers(unit.id)}
                                className="text-green-600 hover:underline text-xs font-medium"
                              >
                                Xem
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Panel xem thành viên — Admin chỉ xem, không thêm/xóa */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-4 py-3 border-b bg-blue-50">
                <h3 className="font-semibold text-blue-700">
                  {selectedUnit
                    ? `Thành viên: ${units.find(u => u.id === selectedUnit)?.name || ''}`
                    : 'Chọn đơn vị để xem thành viên'}
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Mã NV</th>
                    <th className="px-4 py-3 text-left">Họ tên</th>
                    <th className="px-4 py-3 text-left">Vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  {!selectedUnit ? (
                    <tr><td colSpan={3} className="text-center py-6 text-gray-400">Chọn đơn vị bên trái</td></tr>
                  ) : members.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-6 text-gray-400">Chưa có thành viên</td></tr>
                  ) : (
                    members.map(m => (
                      <tr key={m.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3 min-w-[100px]">
                          <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                            {m.employeeCode || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-800">{m.fullName || m.username}</td>
                        <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
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

  // ✅ Manager — quản lý thành viên phòng mình
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý đơn vị</h2>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b bg-blue-50">
              <h3 className="font-semibold text-blue-700">Danh sách đơn vị</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Tên đơn vị</th>
                  <th className="px-4 py-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr
                    key={unit.id}
                    className={`border-t hover:bg-gray-50 cursor-pointer ${selectedUnit === unit.id ? 'bg-blue-50' : ''}`}
                    onClick={() => fetchMembers(unit.id)}
                  >
                    <td className="px-4 py-3 font-medium">{unit.name}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => fetchMembers(unit.id)} className="text-green-600 hover:underline text-xs font-medium">
                        Xem thành viên
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Panel thành viên — Manager có thể thêm/xóa */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b bg-blue-50 flex justify-between items-center">
              <h3 className="font-semibold text-blue-700">
                {selectedUnit
                  ? `Thành viên: ${units.find(u => u.id === selectedUnit)?.name || ''}`
                  : 'Chọn đơn vị để xem thành viên'}
              </h3>
              {selectedUnit && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 font-semibold"
                >
                  + Thêm
                </button>
              )}
            </div>

            {showAddMember && selectedUnit && (
              <form onSubmit={handleAddMember} className="p-4 border-b bg-gray-50 flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {allUsers
                    .filter(u => u.role === 'User' && !members.find(m => m.id === u.id))
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.username} ({u.employeeCode})
                      </option>
                    ))}
                </select>
                <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold">Thêm</button>
                <button type="button" onClick={() => setShowAddMember(false)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-semibold">Hủy</button>
              </form>
            )}

            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Mã NV</th>
                  <th className="px-4 py-3 text-left">Họ tên</th>
                  <th className="px-4 py-3 text-left">Vai trò</th>
                  <th className="px-4 py-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {!selectedUnit ? (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-400">Chọn đơn vị bên trái</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-400">Chưa có thành viên</td></tr>
                ) : (
                  members.map(m => (
                    <tr key={m.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          {m.employeeCode || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{m.fullName || m.username}</td>
                      <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
                      <td className="px-4 py-3">
                        {m.role !== 'Manager' && (
                          <button
                            onClick={() => handleRemoveMember(selectedUnit, m.id)}
                            className="text-red-500 hover:underline text-xs font-medium"
                          >
                            Xóa
                          </button>
                        )}
                      </td>
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