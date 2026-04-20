import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'

export default function KanbanTaskCard({ task, isManager, onRemind, onEdit, onDelete }) {
  const navigate = useNavigate()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 1
  }

  // Deadline
  const getDueLabel = () => {
    if (!task.dueDate || task.status === 'Approved') return null
    const now = new Date()
    const due = new Date(task.dueDate)
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { text: `⚠️ Quá hạn ${Math.abs(diffDays)} ngày`, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
    if (diffDays === 0) return { text: '🔥 Hết hạn hôm nay', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
    if (diffDays <= 3) return { text: `⏰ Còn ${diffDays} ngày`, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
    return { text: `📅 ${due.toLocaleDateString('vi-VN')}`, color: 'var(--text-muted)', bg: 'transparent' }
  }

  const dueLabel = getDueLabel()
  const completedSubs = task.subTasks?.filter(s => s.isCompleted).length || 0
  const totalSubs = task.subTasks?.length || 0
  const hasTime = task.estimatedHours > 0
  const timeOver = hasTime && task.actualHours > task.estimatedHours

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`group ${isDragging ? 'rotate-1' : ''}`}
    >
      <div
        onClick={() => navigate(`/tasks/${task.id}`)}
        style={{
          background: 'var(--bg-card, #fff)',
          borderRadius: '0.875rem',
          border: '1px solid var(--glass-border, rgba(0,0,0,0.06))',
          borderLeft: '3px solid var(--primary-light, #6366f1)',
          padding: '0.875rem 1rem',
          cursor: 'grab',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          display: 'flex', flexDirection: 'column', gap: '0.625rem',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >

        {/* Tiêu đề */}
        <h5 style={{
          margin: 0, fontSize: '0.8125rem', fontWeight: 800,
          color: 'var(--text-primary)', lineHeight: 1.45,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {task.title}
        </h5>

        {task.unitName && (
          <div style={{ marginTop: '-0.2rem' }}>
            <span style={{ 
              fontSize: '0.55rem', fontWeight: 800, 
              color: 'var(--primary-dark)', background: '#eef2ff', 
              padding: '1px 6px', borderRadius: '4px',
              border: '1px solid #e0e7ff', textTransform: 'uppercase'
            }}>
              🏢 {task.unitName}
            </span>
          </div>
        )}

        {/* Mô tả */}
        <p style={{
          margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary, #64748b)',
          lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>
          {task.description || 'Không có mô tả'}
        </p>

        {/* Checklist việc con - thanh tiến độ */}
        {totalSubs > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>☑ Việc con</span>
              <span style={{ color: completedSubs === totalSubs ? '#10b981' : undefined }}>
                {completedSubs}/{totalSubs} ({Math.round((completedSubs / totalSubs) * 100)}%)
              </span>
            </div>
            <div style={{ height: '4px', background: 'var(--glass-border, #f1f5f9)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                background: completedSubs === totalSubs ? '#10b981' : 'var(--primary-light, #6366f1)',
                width: `${(completedSubs / totalSubs) * 100}%`,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}

        {/* Thời gian - thanh tiến độ */}
        {hasTime && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontWeight: 800, marginBottom: '4px',
              color: timeOver ? '#ef4444' : 'var(--text-muted)'
            }}>
              <span>⏱ Thời gian</span>
              <span>{task.actualHours} / {task.estimatedHours}h</span>
            </div>
            <div style={{ height: '4px', background: 'var(--glass-border, #f1f5f9)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '4px',
                background: timeOver ? '#ef4444' : 'var(--primary-light, #6366f1)',
                width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%`,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        )}

        {/* Deadline & CreatedAt badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              📥 Giao: {task.createdAt ? new Date(task.createdAt + "Z").toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }) : '—'}
            </span>
            <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: 800 }}>
              👤 Người giao: {task.createdByName || '—'}
            </span>
          </div>
          {dueLabel && (
            <div>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: dueLabel.color, background: dueLabel.bg,
                padding: '3px 8px', borderRadius: '6px',
                display: 'inline-block',
              }}>
                {dueLabel.text}
              </span>
            </div>
          )}
          {!dueLabel && !task.dueDate && (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>Chưa đặt hạn</span>
          )}
        </div>

        {/* Assignees - avatar + tên */}
        {task.assignees?.length > 0 && (
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', paddingTop: '0.375rem', borderTop: '1px solid var(--glass-border, rgba(0,0,0,0.04))' }}>
            {task.assignees.map(a => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(99,102,241,0.08)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: '12px', padding: '2px 8px 2px 2px',
              }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  color: 'white', fontSize: '0.5rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {a.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--primary-dark, #4338ca)' }}>
                  {a.fullName || a.username}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Hover actions */}
        {isManager && task.status !== 'Approved' && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{
            display: 'flex', gap: '0.3rem',
          }}>
            <button
              onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onRemind(task.id); }}
              style={{ flex: 1, padding: '4px', fontSize: '0.6rem', fontWeight: 700, color: '#d97706', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.15s' }}
            >🔔 Nhắc</button>
            <button
              onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(task); }}
              style={{ padding: '4px 8px', fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--glass, rgba(0,0,0,0.02))', border: '1px solid var(--glass-border)', borderRadius: '6px', cursor: 'pointer' }}
            >✏️ Sửa</button>
            <button
              onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); if(window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) onDelete(task.id); }}
              style={{ padding: '4px 8px', fontSize: '0.6rem', fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer' }}
            >🗑️ Xóa</button>
          </div>
        )}

      </div>
    </div>
  )
}
