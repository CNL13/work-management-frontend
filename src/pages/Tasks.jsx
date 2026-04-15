import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [myUnit, setMyUnit] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', dueDate: '', userIds: [], unitIds: []
  })
  const [file, setFile] = useState(null)
  const [editId, setEditId] = useState(null)
  const { isManager } = useAuth()
  const size = 10

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', { params: { keyword, status, page, size } })
      setTasks(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMyUnit = async () => {
    try {
      const res = await api.get('/units/my-unit')
      setMyUnit(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchTasks()
    if (isManager) {
      fetchUsers()
      fetchMyUnit()
    }
  }, [page, status])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
        unitIds: myUnit ? [myUnit.id] : form.unitIds
      }
      if (editId) {
        await api.put(`/tasks/${editId}`, payload)
        toast.success('Cập nhật task thành công!')
      } else {
        const res = await api.post('/tasks', payload)
        const taskId = res.data?.id
        if (file && taskId) {
          const formData = new FormData()
          formData.append('file', file)
          await api.post(`/Upload?progressId=${taskId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
        }
        toast.success('Tạo task thành công!')
      }
      setForm({ title: '', description: '', dueDate: '', userIds: [], unitIds: [] })
      setFile(null)
      setEditId(null)
      setShowForm(false)
      fetchTasks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thao tác thất bại.')
    }
  }

  const handleEdit = (task) => {
    setEditId(task.id)
    setForm({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '', // ✅ format cho input date
      userIds: [],
      unitIds: []
    })
    setFile(null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa task này?')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Đã xóa task!')
      fetchTasks()
    } catch {
      toast.error('Xóa thất bại.')
    }
  }

  const handleRemind = async (id) => {
    try {
      await api.post(`/tasks/${id}/remind`)
      toast.success('Đã gửi thông báo đôn đốc tiến độ tới các nhân viên!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gửi nhắc nhở thất bại.')
    }
  }

  const toggleUser = (uid) => {
    setForm(prev => ({
      ...prev,
      userIds: prev.userIds.includes(uid)
        ? prev.userIds.filter(id => id !== uid)
        : [...prev.userIds, uid]
    }))
  }

  // ✅ Tính trạng thái deadline
  const getDueDateBadge = (dueDate, status) => {
    if (!dueDate) return null
    if (status === 'Approved') return null // đã xong, không cần hiện

    const now = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return (
      <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
        ⚠️ Quá hạn {Math.abs(diffDays)} ngày
      </span>
    )
    if (diffDays === 0) return (
      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold">
        🔥 Hết hạn hôm nay
      </span>
    )
    if (diffDays <= 3) return (
      <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-semibold">
        ⏰ Còn {diffDays} ngày
      </span>
    )
    return (
      <span className="text-gray-400 text-xs">
        {due.toLocaleDateString('vi-VN')}
      </span>
    )
  }



  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Danh sách công việc</h2>
            {isManager && myUnit && (
              <p className="text-sm text-gray-500 mt-1">
                Phòng: <span className="font-semibold text-blue-600">{myUnit.name}</span>
              </p>
            )}
          </div>
          {isManager && (
            <button
              onClick={() => {
                setShowForm(true)
                setEditId(null)
                setForm({ title: '', description: '', dueDate: '', userIds: [], unitIds: [] })
                setFile(null)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              + Tạo task mới
            </button>
          )}
        </div>

        {/* Form tạo/sửa task */}
        {showForm && isManager && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              {editId ? 'Chỉnh sửa task' : `Tạo task mới — ${myUnit?.name || ''}`}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề task"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Mô tả công việc..."
                />
              </div>

              {/* ✅ Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline <span className="text-gray-400 text-xs">(không bắt buộc)</span>
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!editId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giao cho nhân viên phòng {myUnit?.name}
                    </label>
                    <div className="border border-gray-200 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                      {users.filter(u => u.role === 'User').map(u => (
                        <label key={u.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.userIds.includes(u.id)}
                            onChange={() => toggleUser(u.id)}
                            className="accent-blue-600"
                          />
                          <span className="text-sm text-gray-700">
                            {u.fullName || u.username}
                            <span className="text-gray-400 text-xs ml-1">({u.employeeCode})</span>
                          </span>
                        </label>
                      ))}
                      {users.filter(u => u.role === 'User').length === 0 && (
                        <p className="text-sm text-gray-400">Không có nhân viên nào trong phòng</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tài liệu đính kèm
                    </label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
                    />
                    {file && <p className="text-xs text-gray-500 mt-1">Đã chọn: {file.name}</p>}
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                  {editId ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditId(null); setFile(null) }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm task..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1) }}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NotStarted">Chưa bắt đầu</option>
            <option value="InProgress">Đang thực hiện</option>
            <option value="Submitted">Đã nộp báo cáo</option>
            <option value="Approved">Đã phê duyệt</option>
            <option value="Rejected">Bị từ chối</option>
          </select>
          <button
            onClick={() => { setPage(1); fetchTasks() }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tìm kiếm
          </button>
        </div>

        {/* Task Grid (Modern UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {tasks.length === 0 ? (
            <div className="col-span-full text-center py-20 glass-card rounded-2xl">
              <p className="text-gray-400">Không có task nào được tìm thấy</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div 
                key={task.id} 
                className={`glass-card rounded-2xl p-5 flex flex-col h-full relative overflow-hidden ${
                  task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Approved'
                    ? 'border-red-200'
                    : ''
                }`}
              >
                {/* Status Bar */}
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 opacity-40"></div>

                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-800 leading-tight pr-4">
                    {task.title}
                  </h3>
                  <StatusBadge status={task.status} />
                </div>

                <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                  {task.description || 'Không có mô tả'}
                </p>

                {/* Info Section */}
                <div className="mt-auto space-y-3">
                  {/* Deadline & Date */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                        Hạn chót
                      </span>
                      {getDueDateBadge(task.dueDate, task.status) || (
                        <span className="text-gray-300 text-xs italic">Không có</span>
                      )}
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                        Ngày tạo
                      </span>
                      <span className="text-gray-600 text-xs font-medium">
                        {task.createdAt ? new Date(task.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Assignees */}
                  <div className="flex flex-col">
                     <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">
                        Người thực hiện
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {task.assignees?.length > 0 ? (
                          task.assignees.map(a => (
                            <div key={a.id} className="group relative flex items-center bg-white border border-gray-100 px-2 py-1 rounded-lg shadow-sm hover:border-blue-200 transition-colors">
                              <span className="text-xs font-semibold text-gray-700 leading-tight">
                                {a.fullName}
                              </span>
                              <span className="hidden group-hover:block absolute -top-8 left-0 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 shadow-lg">
                                MNV: {a.employeeCode}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs italic">Chưa gán</span>
                        )}
                      </div>
                  </div>

                  {/* Actions (Manager only) */}
                  {isManager && (
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                      {/* Chỉ đôn đốc khi task chưa hoàn thành */}
                      {task.status !== 'Approved' && task.status !== 'Rejected' && (
                        <button 
                          onClick={() => handleRemind(task.id)} 
                          className="flex-1 bg-yellow-50 text-yellow-600 font-bold py-2 rounded-lg text-sm hover:bg-yellow-100 transition-colors flex items-center justify-center gap-1"
                          title="Gửi thông báo nhắc nhở tiến độ cho nhân viên"
                        >
                          🔔 Đôn đốc
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(task)} 
                        className="flex-1 bg-blue-50 text-blue-600 font-bold py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                      >
                        ✏️ Sửa
                      </button>
                      {/* Không cho xóa task đã duyệt */}
                      {task.status !== 'Approved' && (
                        <button 
                          onClick={() => handleDelete(task.id)} 
                          className="flex-1 bg-red-50 text-red-500 font-bold py-2 rounded-lg text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                        >
                          🗑️ Xóa
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 text-gray-600">
            Trang {page} / {Math.ceil(total / size) || 1}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= Math.ceil(total / size)}
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Tiếp
          </button>
        </div>
      </div>
    </div>
  )
}