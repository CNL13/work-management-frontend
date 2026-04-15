import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'

export default function Progress() {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState('')
  const [percent, setPercent] = useState(50)
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [progresses, setProgresses] = useState([])
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const { userId, role } = useAuth()

  useEffect(() => {
    if (role !== null) {
      fetchProgresses()
      // Chỉ User mới cần danh sách task để nộp báo cáo
      if (role === 'User') fetchMyTasks()
    }
  }, [role])

  const fetchMyTasks = async () => {
    try {
      const res = await api.get('/tasks', { params: { page: 1, size: 100, myTasks: true } })
      // Chỉ hiện task chưa hoàn thành
      setTasks((res.data.data || []).filter(t => t.status !== 'Approved'))
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProgresses = async () => {
    try {
      const res = await api.get('/progress', { params: { page: 1, size: 100 } })
      const all = res.data.data || []
      // Backend đã lọc theo phòng cho Manager; User lọc theo chính mình
      if (role === 'User') {
        setProgresses(all.filter(p => p.userId === userId))
      } else {
        setProgresses(all)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedTask) { toast.error('Vui lòng chọn công việc!'); return }
    setLoading(true)
    try {
      let fileId = null
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const uploadRes = await api.post('/Upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        fileId = uploadRes.data?.id
      }

      await api.post('/progress', {
        taskId: selectedTask,
        userId,
        percent: parseInt(percent),
        description,
        fileId
      })

      toast.success('✅ Gửi báo cáo tiến độ thành công!')
      setSelectedTask('')
      setPercent(50)
      setDescription('')
      setFile(null)
      fetchProgresses()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi báo cáo thất bại.')
    } finally {
      setLoading(false)
    }
  }

  const displayedProgresses = filterStatus
    ? progresses.filter(p => p.status === filterStatus)
    : progresses

  const getProgressColor = (p) => {
    if (p >= 100) return 'from-green-500 to-emerald-500'
    if (p >= 70) return 'from-blue-500 to-indigo-500'
    if (p >= 40) return 'from-yellow-400 to-orange-400'
    return 'from-red-400 to-rose-400'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {role === 'Manager' ? '📊 Giám sát tiến độ' : '📝 Báo cáo tiến độ'}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {role === 'Manager'
                ? 'Theo dõi tình hình thực hiện công việc của phòng ban'
                : 'Cập nhật và theo dõi tiến độ các công việc được giao'}
            </p>
          </div>
          {role === 'Manager' && (
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Submitted">Chờ duyệt</option>
              <option value="Approved">Đã duyệt</option>
              <option value="Rejected">Bị từ chối</option>
            </select>
          )}
        </div>

        {/* Form báo cáo — CHỈ DÀNH CHO NHÂN VIÊN (User) */}
        {role === 'User' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
              Gửi báo cáo tiến độ mới
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Chọn công việc *
                  </label>
                  <select
                    value={selectedTask}
                    onChange={e => setSelectedTask(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    required
                  >
                    <option value="">-- Chọn công việc --</option>
                    {tasks.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                  {tasks.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">⚠️ Bạn chưa được giao công việc nào</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    % Hoàn thành — <span className="text-blue-600 font-bold">{percent}%</span>
                  </label>
                  <input
                    type="range" min="0" max="100" step="5"
                    value={percent}
                    onChange={e => setPercent(e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Mô tả chi tiết công việc đã làm
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  rows={3}
                  placeholder="Hôm nay bạn đã hoàn thành những gì?..."
                />
              </div>

              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    File minh chứng (ảnh, tài liệu...)
                  </label>
                  <input
                    type="file"
                    onChange={e => setFile(e.target.files[0])}
                    className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:border-blue-400 transition-all cursor-pointer"
                  />
                  {file && <p className="text-xs text-gray-500 mt-1">📎 {file.name}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading || tasks.length === 0}
                  className="w-full md:w-auto bg-blue-600 text-white px-10 py-3 rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200 disabled:opacity-50 transition-all"
                >
                  {loading ? '⏳ Đang gửi...' : '📤 Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lịch sử tiến độ */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">
              {role === 'Manager' ? '📋 Báo cáo của phòng ban' : '📋 Lịch sử báo cáo của tôi'}
            </h3>
            <span className="text-xs text-gray-400 font-medium">{displayedProgresses.length} báo cáo</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-left">Công việc</th>
                  {role === 'Manager' && <th className="px-6 py-4 text-left">Nhân viên</th>}
                  <th className="px-6 py-4 text-left">% Hoàn thành</th>
                  <th className="px-4 py-4 text-left">Minh chứng</th>
                  <th className="px-6 py-4 text-left">Mô tả</th>
                  <th className="px-6 py-4 text-left">Trạng thái</th>
                  <th className="px-6 py-4 text-left">Ngày gửi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedProgresses.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'Manager' ? 7 : 6} className="text-center py-16 text-gray-400 italic">
                      {filterStatus ? 'Không có báo cáo nào với trạng thái này' : 'Chưa có báo cáo nào'}
                    </td>
                  </tr>
                ) : (
                  displayedProgresses.map(p => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800 max-w-[180px]">
                        <span className="truncate block">{p.taskTitle || '—'}</span>
                      </td>
                      {role === 'Manager' && (
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-700 text-xs">{p.userFullName}</span>
                            <span className="text-[10px] font-mono text-blue-500 bg-blue-50 px-1 rounded w-fit">{p.userEmployeeCode}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-gray-100 rounded-full h-2">
                            <div
                              className={`bg-gradient-to-r ${getProgressColor(p.percent)} h-2 rounded-full`}
                              style={{ width: `${p.percent}%` }}
                            />
                          </div>
                          <span className="font-bold text-gray-700 text-xs">{p.percent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {p.files?.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {p.files.map(f => (
                              <a key={f.id} href={`${api.defaults.baseURL}/upload/${f.id}`}
                                target="_blank" rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-[10px] font-bold flex items-center gap-1 underline underline-offset-2">
                                📎 {f.fileName.length > 15 ? f.fileName.substring(0, 12) + '...' : f.fileName}
                              </a>
                            ))}
                          </div>
                        ) : <span className="text-gray-300 text-[10px] italic">Không có</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs max-w-[180px]">
                        <p className="line-clamp-2">{p.description || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} submittedLabel="Chờ duyệt" />
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-[10px] font-medium">
                        {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString('vi-VN') : '—'}
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