import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'

export default function Review() {
  const [tasks, setTasks] = useState([])       // ✅ thêm để lấy tên task
  const [progresses, setProgresses] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchProgresses()
  }, [])

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks', { params: { page: 1, size: 100 } })
      setTasks(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProgresses = async () => {
    try {
      const res = await api.get('/progress', { params: { page: 1, size: 100 } })
      setProgresses(res.data.data || [])
    } catch (err) {
      console.error(err)
    }
  }

  // ✅ Lấy tên task từ taskId
  const getTaskTitle = (taskId) => {
    const task = tasks.find(t => t.id === taskId)
    return task ? task.title : taskId
  }

  const handleReview = async (approve) => {
    if (!selectedId) return
    setLoading(true)
    try {
      await api.post('/review', {
        progressId: selectedId,
        approve,
        comment
      })
      toast.success(approve ? '✓ Đã phê duyệt báo cáo!' : '✗ Đã từ chối báo cáo!')
      setSelectedId(null)
      setComment('')
      fetchProgresses()
    } catch (err) {
      toast.error('Thao tác thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const pendingProgresses = progresses.filter(p => p.status === 'Submitted')



  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-display">Phê duyệt báo cáo</h2>
          <div className="flex gap-2">
            <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-500 shadow-sm">
              {progresses.length} Tổng số báo cáo
            </span>
          </div>
        </div>

        {/* Báo cáo chờ duyệt */}
        <div className="glass-card rounded-2xl overflow-hidden mb-8 animate-fade-in">
          <div className="px-6 py-4 border-b bg-yellow-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
              <h3 className="text-lg font-bold text-gray-700">Công việc chờ phê duyệt</h3>
            </div>
            <span className="bg-yellow-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm shadow-yellow-200 uppercase tracking-wider">
              {pendingProgresses.length} Chờ xử lý
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left w-12">Chọn</th>
                  <th className="px-6 py-4 text-left">Công việc / Người gửi</th>
                  <th className="px-6 py-4 text-left">Tiến độ</th>
                  <th className="px-6 py-4 text-left">Minh chứng</th> {/* ✅ MỚI */}
                  <th className="px-6 py-4 text-left">Mô tả</th>
                  <th className="px-6 py-4 text-left">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 italic-gray-400">
                {pendingProgresses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400">
                      Hiện tại không có báo cáo nào cần phê duyệt
                    </td>
                  </tr>
                ) : (
                  pendingProgresses.map((p) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${selectedId === p.id ? 'bg-blue-50/80 shadow-inner' : ''}`}
                      onClick={() => setSelectedId(p.id)}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="radio"
                          checked={selectedId === p.id}
                          onChange={() => setSelectedId(p.id)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 pointer-events-none"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800">{getTaskTitle(p.taskId)}</span>
                          <div className="flex items-center gap-1 mt-1 text-[10px]">
                            <span className="text-gray-500 font-medium">{p.userFullName}</span>
                            <span className="text-blue-500 font-mono bg-blue-50 px-1 rounded">{p.userEmployeeCode}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5 flex-shrink-0">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${p.percent}%` }} />
                          </div>
                          <span className="font-bold text-gray-700 whitespace-nowrap">{p.percent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {p.files?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {p.files.map(f => {
                              const isImage = f.fileName.match(/\.(jpg|jpeg|png|gif)$/i);
                              return (
                                <a 
                                  key={f.id}
                                  href={`${api.defaults.baseURL}/upload/${f.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="group relative flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:border-blue-300 transition-colors shadow-sm"
                                  title={f.fileName}
                                >
                                  {isImage ? (
                                    <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                                      <img src={`${api.defaults.baseURL}/upload/${f.id}`} alt="preview" className="object-cover w-full h-full" />
                                    </div>
                                  ) : (
                                    <span className="text-lg">📄</span>
                                  )}
                                  <span className="text-blue-600 group-hover:text-blue-800 text-xs font-bold leading-tight">
                                    Kiểm tra
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-[10px] italic">Không có</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-[150px]">{p.description}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} submittedLabel="Chờ duyệt" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel (Floating Effect) */}
        {selectedId && (
          <div className="glass-card rounded-2xl p-6 mb-8 border-l-4 border-blue-600 animate-fade-in shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">✍️</span>
              <span>Phê duyệt báo cáo của:</span>
              <span className="text-blue-600">
                {(() => {
                  const p = pendingProgresses.find(x => x.id === selectedId)
                  return p ? `${p.userFullName} — ${getTaskTitle(p.taskId)}` : selectedId?.substring(0, 8) + '...'
                })()}
              </span>
            </h3>
            <div className="mb-6">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Ghi chú / Phản hồi cho nhân viên
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 transition-all font-medium text-gray-700"
                rows={3}
                placeholder="Ví dụ: Công việc hoàn thành tốt, hoặc Cần bổ sung thêm thông tin..."
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => handleReview(true)}
                disabled={loading}
                className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 font-bold shadow-lg shadow-green-100 transition-all disabled:opacity-50 h-12"
              >
                {loading ? '...' : '✓ Duyệt và Hoàn thành'}
              </button>
              <button
                onClick={() => handleReview(false)}
                disabled={loading}
                className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 font-bold shadow-lg shadow-red-100 transition-all disabled:opacity-50 h-12"
              >
                {loading ? '...' : '✗ Từ chối báo cáo'}
              </button>
              <button
                onClick={() => { setSelectedId(null); setComment('') }}
                className="px-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-all h-12"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Lịch sử tất cả báo cáo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in delay-200">
          <div className="px-6 py-4 border-b bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Lịch sử toàn bộ báo cáo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/30 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left">Công việc</th>
                  <th className="px-6 py-4 text-left">Người báo cáo</th>
                  <th className="px-6 py-4 text-left">Tiến độ</th>
                  <th className="px-6 py-4 text-left">Tài liệu</th>
                  <th className="px-6 py-4 text-left">Trạng thái</th>
                  <th className="px-6 py-4 text-left">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {progresses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400 italic">Chưa có dữ liệu</td>
                  </tr>
                ) : (
                  progresses.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{getTaskTitle(p.taskId)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs">
                          <span className="font-bold text-gray-700">{p.userFullName}</span>
                          <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1 rounded w-fit">
                            {p.userEmployeeCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-blue-600">{p.percent}%</td>
                      <td className="px-6 py-4">
                        {p.files?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.files.map(f => (
                               <a 
                                 key={f.id}
                                 href={`${api.defaults.baseURL}/upload/${f.id}`}
                                 target="_blank"
                                 rel="noreferrer"
                                 className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded hover:bg-blue-50 hover:border-blue-200 transition-colors text-blue-600 text-[10px] font-bold max-w-[120px]"
                                 title={f.fileName}
                               >
                                📎 <span className="truncate">{f.fileName}</span>
                               </a>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} submittedLabel="Chờ duyệt" />
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-[10px] font-medium font-mono">
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