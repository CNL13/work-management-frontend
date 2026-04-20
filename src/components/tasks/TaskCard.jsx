import StatusBadge from '../StatusBadge'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TaskComments from './TaskComments'
import { toast } from 'react-toastify'
import api from '../../services/api'

export default function TaskCard({ task, isManager, onRemind, onEdit, onDelete, onComment, apiBaseUrl }) {
  const navigate = useNavigate();

  const getDueDateBadge = (createdAt, dueDate, status) => {
    const createdDateStr = createdAt 
      ? new Date(createdAt + "Z").toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }) 
      : '—'
    
    const createdLabel = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
          📥 Giao: {createdDateStr}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, display: 'block' }}>
          👤 Người giao: {task.createdByName || '—'}
        </span>
      </div>
    )

    if (!dueDate) return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {createdLabel}
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chưa đặt hạn</span>
      </div>
    )

    if (status === 'Approved') return (
       <div style={{ display: 'flex', flexDirection: 'column' }}>
        {createdLabel}
         <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 700 }}>✅ Đã hoàn tất</span>
      </div>
    )

    const now = new Date()
    const due = new Date(dueDate)
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24))

    let badge = null
    if (diffDays < 0) badge = (
      <span className="badge badge-red ping-dot">
        ⚠️ Quá hạn {Math.abs(diffDays)} ngày
      </span>
    )
    else if (diffDays === 0) badge = (
      <span className="badge badge-yellow">
         🔥 Hết hạn hôm nay
      </span>
    )
    else if (diffDays <= 3) badge = (
      <span className="badge badge-yellow" style={{ opacity: 0.8 }}>
         ⏰ Còn {diffDays} ngày
      </span>
    )
    else badge = (
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        📅 Hạn: {due.toLocaleDateString('vi-VN')}
      </span>
    )

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {createdLabel}
        {badge}
      </div>
    )
  }

  return (
    <div className="glass-card hover-glow" style={{ padding: '1.5rem', borderRadius: '1.5rem', borderLeft: '4px solid var(--primary-light)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
         <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4 }}>{task.title}</h3>
         <StatusBadge status={task.status} />
      </div>

      {task.unitName && (
        <div style={{ marginBottom: '1rem' }}>
          <span style={{ 
            fontSize: '0.65rem', 
            fontWeight: 800, 
            color: 'var(--primary-dark)', 
            background: 'rgba(99, 102, 241, 0.1)', 
            padding: '2px 8px', 
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.02rem',
            border: '1px solid rgba(99, 102, 241, 0.1)'
          }}>
            🏢 {task.unitName}
          </span>
        </div>
      )}
      
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {task.description || 'Không có hướng dẫn chi tiết đính kèm.'}
      </p>

      {/* ✅ MỚI: Tiến độ chi tiết */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
         {task.subTasks?.length > 0 && (
           <div>
             <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                <span>CHECKLIST VIỆC CON ({task.subTasks.filter(s => s.isCompleted).length}/{task.subTasks.length})</span>
                <span>{Math.round((task.subTasks.filter(s => s.isCompleted).length / task.subTasks.length) * 100)}%</span>
             </div>
             <div style={{ height: '6px', width: '100%', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--success)', width: `${(task.subTasks.filter(s => s.isCompleted).length / task.subTasks.length) * 100}%`, transition: 'width 0.5s ease' }} />
             </div>
           </div>
         )}

         {task.estimatedHours > 0 && (
           <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                <span>THEO DÕI THỜI GIAN</span>
                <span style={{ color: task.actualHours > task.estimatedHours ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {task.actualHours} giờ / {task.estimatedHours} giờ dự kiến
                </span>
             </div>
             <div style={{ height: '6px', width: '100%', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: task.actualHours > task.estimatedHours ? 'var(--danger)' : 'var(--primary-light)', 
                  width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%`, 
                  transition: 'width 0.5s ease' 
                }} />
             </div>
           </div>
         )}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.875rem 0', borderTop: '1px solid rgba(0, 0, 0, 0.06)', alignItems: 'flex-start' }}>
           {getDueDateBadge(task.createdAt, task.dueDate, task.status)}
           {task.files?.length > 0 && (
             <div style={{ display: 'flex', gap: '0.4rem' }}>
               {task.files.map(f => (
                 <button 
                   key={f.id} 
                   onClick={async (e) => {
                     e.stopPropagation();
                     try {
                        const res = await api.get(`/upload/${f.id}`, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', f.fileName || 'download');
                        document.body.appendChild(link);
                        link.click();
                        link.parentNode.removeChild(link);
                     } catch(err) {
                        toast.error("Lỗi tải file");
                     }
                   }}
                   title={f.fileName} 
                   style={{ background: 'none', border: 'none', cursor: 'pointer', ...{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' } }} 
                   onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(6,182,212,0.2)'} 
                   onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(6,182,212,0.1)'}
                 >
                   📎
                 </button>
               ))}
             </div>
           )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
           {task.assignees?.map(a => (
             <span key={a.id} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-dark)', background: '#e0e7ff', padding: '0.2rem 0.6rem', border: '1px solid #c7d2fe', borderRadius: '6px' }}>
               👤 {a.fullName || a.username}
             </span>
           ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
          {isManager && task.status !== 'Approved' && (
            <>
              <button onClick={() => onRemind(task.id)} className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', fontWeight: 800, color: '#d97706', borderColor: 'rgba(217,119,6,0.3)' }}>🔔 Nhắc</button>
              <button onClick={() => onEdit(task)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>Sửa</button>
              <button onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) onDelete(task.id) }} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.2)' }}>Xóa</button>
            </>
          )}
          <button 
            onClick={() => navigate(`/tasks/${task.id}`)} 
            className="btn-primary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', flex: isManager ? 'none' : 1 }}
          >
            📋 Chi tiết
          </button>
        </div>


      </div>
    </div>
  )
}
