import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import Navbar from '../components/Navbar'
import SkeletonLoader from '../components/SkeletonLoader'
import TaskCard from '../components/tasks/TaskCard'
import TaskForm from '../components/tasks/TaskForm'
import TaskFilters from '../components/tasks/TaskFilters'
import TaskPagination from '../components/tasks/TaskPagination'
import KanbanView from '../components/tasks/KanbanView'
import TaskComments from '../components/tasks/TaskComments' // ✅ MỚI

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [myUnit, setMyUnit] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState(null)
  const [initialFormData, setInitialFormData] = useState(null)
  const [viewMode, setViewMode] = useState('list') // ✅ MỚI: 'list' | 'kanban'
  const [commentTaskId, setCommentTaskId] = useState(null) // ✅ MỚI: Quản lý thảo luận tập trung
  
  const { isManager } = useAuth()
  const size = viewMode === 'list' ? 10 : 100 // Tăng size khi xem Kanban để thấy toàn bộ thẻ

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/tasks', { params: { keyword, status, page, size } })
      setTasks(res.data.data || [])
      setTotal(res.data.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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
  }, [page, status, keyword])

  const handleEdit = (task) => {
    setEditId(task.id)
    setInitialFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
      estimatedHours: task.estimatedHours || 0,
      userIds: [],
      unitIds: []
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa task này?')) return
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Đã xóa task!')
      fetchTasks()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xóa thất bại.')
    }
  }

  const handleRemind = async (id) => {
    try {
      await api.post(`/tasks/${id}/remind`)
      toast.success('Đã gửi thông báo đôn đốc tiến độ!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gửi nhắc nhở thất bại.')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditId(null)
    setInitialFormData(null)
    fetchTasks()
  }

  return (
    <div className="page-container page-enter">
      <Navbar />
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div className="animate-slide-left">
            <h2 className="section-title">📋 Dashboard Công việc</h2>
            <p className="section-subtitle">
              {isManager && myUnit ? (
                <>Quản lý mục tiêu phòng <b>{myUnit.name}</b></>
              ) : (
                <>Theo dõi các nhiệm vụ được giao trực tiếp cho bạn</>
              )}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* ✅ Nút chuyển chế độ xem: Giờ đây ai cũng nhìn thấy */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
               <button 
                 onClick={() => setViewMode('list')}
                 className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
               >
                 📄 Danh sách
               </button>
               <button 
                 onClick={() => setViewMode('kanban')}
                 className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
               >
                 📊 Bảng tiến độ
               </button>
            </div>

            {/* ✅ Nút Tạo task: Vẫn chỉ dành cho Manager */}
            {isManager && (
              <button
                onClick={() => {
                  setShowForm(!showForm)
                  if (showForm) {
                    setEditId(null)
                    setInitialFormData(null)
                  }
                }}
                className="btn-primary animate-float-premium"
                style={{ boxShadow: '0 10px 30px rgba(99, 102, 241, 0.4)' }}
              >
                {showForm ? '✕ Đóng form' : '+ Tạo nhiệm vụ mới'}
              </button>
            )}
          </div>
        </div>

        {showForm && isManager && (
          <TaskForm 
            editId={editId}
            initialData={initialFormData}
            users={users}
            myUnit={myUnit}
            onClose={() => { setShowForm(false); setEditId(null); }}
            onSuccess={handleFormSuccess}
          />
        )}

        <TaskFilters 
          keyword={keyword}
          setKeyword={setKeyword}
          status={status}
          setStatus={setStatus}
          setPage={setPage}
          onFetch={fetchTasks}
        />

        {viewMode === 'kanban' ? (
          <div className="mt-8 animate-fade-in">
            <KanbanView 
              initialTasks={tasks}
              isManager={isManager}
              onRefresh={fetchTasks}
              onRemind={handleRemind}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children animate-fade-in">
            {loading ? (
               <SkeletonLoader count={3} />
            ) : tasks.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '6rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.3 }}>📬</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Không có công việc nào phù hợp với bộ lọc hiện tại</p>
              </div>
            ) : (
              tasks.map((task) => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  isManager={isManager}
                  onRemind={handleRemind}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onComment={setCommentTaskId} // ✅ MỚI
                  apiBaseUrl={api.defaults.baseURL}
                />
              ))
            )}
          </div>
        )}

        {viewMode === 'list' && (
          <TaskPagination 
            page={page}
            setPage={setPage}
            total={total}
            size={size}
          />
        )}

        {/* ✅ MỚI: Modal thảo luận toàn cục */}
        {commentTaskId && (
          <TaskComments 
            taskId={commentTaskId} 
            onClose={() => setCommentTaskId(null)} 
          />
        )}
      </div>
    </div>
  )
}