import { useState, useEffect } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'react-toastify'
import api from '../../services/api'
import KanbanColumn from './KanbanColumn'
import KanbanTaskCard from './KanbanTaskCard'

const COLUMNS = [
  { id: 'NotStarted', title: 'Chưa bắt đầu' },
  { id: 'InProgress', title: 'Đang thực hiện' },
  { id: 'Submitted', title: 'Chờ duyệt' },
  { id: 'Approved', title: 'Hoàn thành' },
  { id: 'Rejected', title: 'Từ chối' },
]

export default function KanbanView({ initialTasks, isManager, onRefresh, onRemind, onEdit, onDelete }) {
  const [tasks, setTasks] = useState(initialTasks)
  const [activeTask, setActiveTask] = useState(null)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Chỉ cho phép kéo thả nếu là Quản lý. Nếu là nhân viên, khóa tính năng này bằng cách đặt khoảng cách kích hoạt cực lớn.
        distance: isManager ? 8 : 99999,
      },
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task)
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isOverAColumn = COLUMNS.some(c => c.id === overId)
    const isOverATask = tasks.some(t => t.id === overId)

    if (isOverAColumn) {
       setTasks(prev => {
         return prev.map(t => t.id === activeId ? { ...t, status: overId } : t)
       })
    } else if (isOverATask) {
       const overTask = tasks.find(t => t.id === overId)
       if (overTask && overTask.status !== active.data.current?.status) {
          setTasks(prev => {
            return prev.map(t => t.id === activeId ? { ...t, status: overTask.status } : t)
          })
       }
    }
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTaskObj = tasks.find(t => t.id === active.id)
    const overId = over.id

    // Xác định Status mới
    let newStatus = activeTaskObj.status
    if (COLUMNS.some(c => c.id === overId)) {
      newStatus = overId
    } else {
      const overTask = tasks.find(t => t.id === overId)
      if (overTask) newStatus = overTask.status
    }

    const oldIndex = tasks.findIndex(t => t.id === active.id)
    let newIndex = tasks.findIndex(t => t.id === overId)
    if (newIndex === -1) {
       const colTasks = tasks.filter(t => t.status === newStatus)
       if (colTasks.length > 0) newIndex = tasks.findIndex(t => t.id === colTasks[colTasks.length - 1].id)
       else newIndex = oldIndex
    }

    const reorderedTasks = arrayMove(tasks, oldIndex, newIndex)
    const finalList = reorderedTasks.map(t => t.id === active.id ? { ...t, status: newStatus } : t)
    
    setTasks(finalList)

    const originalTask = initialTasks.find(t => t.id === active.id)
    try {
      if (newStatus !== originalTask.status) {
        await api.patch(`/tasks/${active.id}/status`, `"${newStatus}"`, {
           headers: { 'Content-Type': 'application/json' }
        })
        toast.success(`Đã di chuyển: ${activeTaskObj.title}`)
      }

      const columnTasks = finalList.filter(t => t.status === newStatus)
      await Promise.all(columnTasks.map((t, index) => 
        api.put(`/tasks/${t.id}/reorder`, index, { headers: { 'Content-Type': 'application/json' } })
      ))
      
      onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đồng bộ vị trí.')
      setTasks(initialTasks)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div style={{
        display: 'flex', gap: '1rem', overflowX: 'auto',
        paddingBottom: '1.5rem', height: 'calc(100vh - 350px)', minHeight: '500px',
      }}>
        {COLUMNS.map(col => (
          <KanbanColumn 
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={tasks.filter(t => t.status === col.id)}
            isManager={isManager}
            onRemind={onRemind}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{
        sideEffects: defaultDropAnimationSideEffects({
          styles: {
            active: {
              opacity: '0.5',
            },
          },
        }),
      }}>
        {activeTask ? (
          <KanbanTaskCard 
            task={activeTask}
            isManager={isManager}
            onRemind={onRemind}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
