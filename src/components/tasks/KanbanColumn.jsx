import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanTaskCard from './KanbanTaskCard'

const COLUMN_STYLES = {
  NotStarted: { accent: '#94a3b8', bg: 'rgba(148,163,184,0.06)' },
  InProgress: { accent: '#6366f1', bg: 'rgba(99,102,241,0.06)' },
  Submitted:  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)' },
  Approved:   { accent: '#10b981', bg: 'rgba(16,185,129,0.06)' },
  Rejected:   { accent: '#ef4444', bg: 'rgba(239,68,68,0.06)' },
}

export default function KanbanColumn({ id, title, tasks, isManager, onRemind, onEdit, onDelete }) {
  const { setNodeRef } = useDroppable({ id })
  const colStyle = COLUMN_STYLES[id] || COLUMN_STYLES.NotStarted

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', flex: 1,
      minWidth: '280px', maxWidth: '360px', height: '100%',
      background: colStyle.bg,
      borderRadius: '1rem',
      border: '1px solid var(--glass-border, rgba(0,0,0,0.04))',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '0.875rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        borderBottom: '1px solid var(--glass-border, rgba(0,0,0,0.04))',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: colStyle.accent, flexShrink: 0,
        }} />
        <h4 style={{
          margin: 0, fontSize: '0.8125rem', fontWeight: 800,
          color: 'var(--text-primary, #1e293b)', flex: 1,
          fontFamily: 'Outfit, sans-serif',
        }}>
          {title}
        </h4>
        <span style={{
          fontSize: '0.6875rem', fontWeight: 800,
          color: colStyle.accent,
          background: `${colStyle.accent}18`,
          padding: '2px 8px', borderRadius: '6px',
        }}>
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div ref={setNodeRef} style={{
        flex: 1, overflowY: 'auto', padding: '0.75rem',
        display: 'flex', flexDirection: 'column', gap: '0.625rem',
      }} className="custom-scrollbar">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanTaskCard 
              key={task.id} 
              task={task}
              isManager={isManager}
              onRemind={onRemind}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div style={{
            height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px dashed var(--glass-border, rgba(0,0,0,0.06))',
            borderRadius: '0.75rem',
            fontSize: '0.6875rem', color: 'var(--text-muted, #cbd5e1)',
            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            Kéo thả vào đây
          </div>
        )}
      </div>
    </div>
  )
}
