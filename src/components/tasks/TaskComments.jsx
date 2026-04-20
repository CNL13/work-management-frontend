import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import * as signalR from '@microsoft/signalr'
import api, { API_BASE_URL } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function TaskComments({ taskId, taskCreatedBy, onClose }) {
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const { userId, token, isAdminOrManager } = useAuth()
  const scrollRef = useRef(null)
  const [connection, setConnection] = useState(null)
  const [subTasks, setSubTasks] = useState([]) // ✅ MỚI
  const [newSubTask, setNewSubTask] = useState('') // ✅ MỚI
  const [subTaskLoading, setSubTaskLoading] = useState(false) // ✅ MỚI

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const handleMouseDown = (e) => {
    isDragging.current = true
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y })
  }

  const handleMouseUp = () => {
    isDragging.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL.replace('/api', '')}/discussionHub`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build()
    setConnection(newConnection)
  }, [token])

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          connection.invoke('JoinTaskGroup', taskId)
          connection.on('ReceiveComment', (newComment) => {
            setComments(prev => prev.find(c => c.id === newComment.id) ? prev : [...prev, newComment])
            markSeen() // Tự động đánh dấu đã xem khi nhận tin mới
          })
          connection.on('UpdateReaction', () => fetchComments())
          connection.on('UpdateSeen', () => fetchComments()) // ✅ MỚI: Cập nhật danh sách người đã xem

          // ✅ MỚI: Đồng bộ Sub-tasks
          connection.on('ReceiveSubTaskAdded', (subTask) => {
            setSubTasks(prev => prev.find(s => s.id === subTask.id) ? prev : [...prev, subTask])
          })
          connection.on('ReceiveSubTaskToggled', (id, isCompleted) => {
            setSubTasks(prev => prev.map(s => s.id === id ? { ...s, isCompleted } : s))
          })
          connection.on('ReceiveSubTaskDeleted', (id) => {
            setSubTasks(prev => prev.filter(s => s.id !== id))
          })
        })
        .catch(e => console.log('SignalR Error: ', e))
      return () => { connection.stop() }
    }
  }, [connection, taskId])

  useEffect(() => { 
    fetchComments()
    fetchSubTasks() // ✅ MỚI
    markSeen() // ✅ MỚI: Đánh dấu đã xem khi mở chat
  }, [taskId])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [comments])

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${taskId}`)
      setComments(res.data || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const markSeen = async () => {
    try {
      await api.post(`/comments/task/${taskId}/seen`)
    } catch (err) { console.error('Mark seen error:', err) }
  }

  const fetchSubTasks = async () => {
    try {
      const res = await api.get(`/subtasks/task/${taskId}`)
      setSubTasks(res.data || [])
    } catch (err) { console.error(err) }
  }

  const handleAddSubTask = async (e) => {
    e.preventDefault()
    if (!newSubTask.trim()) return
    setSubTaskLoading(true)
    try {
      await api.post('/subtasks', { taskId, title: newSubTask })
      setNewSubTask('')
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi khi thêm việc con') }
    finally { setSubTaskLoading(false) }
  }

  const handleToggleSubTask = async (subId) => {
    try {
      await api.patch(`/subtasks/${subId}/toggle`)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi cập nhật') }
  }

  const handleDeleteSubTask = async (subId) => {
    if (!window.confirm('Xóa việc con này?')) return
    try {
      await api.delete(`/subtasks/${subId}`)
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi xóa') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    try {
      await api.post('/comments', { taskId, content })
      setContent('')
      // Ngay sau khi gửi, đánh dấu đã xem để đồng bộ local
      markSeen()
    } catch (err) { toast.error(err.response?.data?.message || 'Gửi thất bại.') }
  }

  const handleReact = async (commentId, emoji) => {
    try {
      await api.post(`/comments/${commentId}/react`, JSON.stringify(emoji), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (err) { console.error(err) }
  }

  const isOwnMessage = (commentUserId) => {
    if (!commentUserId || !userId) return false
    return commentUserId.toString().toLowerCase().trim() === userId.toString().toLowerCase().trim()
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  }

  const [activeComment, setActiveComment] = useState(null)
  const longPressTimer = useRef(null)

  const handleTouchStart = (e, comment) => {
    longPressTimer.current = setTimeout(() => {
      setActiveComment({ id: comment.id, myReaction: comment.myReaction })
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current)
  }

  const handleReactAndClose = async (commentId, emoji) => {
    await handleReact(commentId, emoji)
    setActiveComment(null)
  }

  const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡']

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    // Đảm bảo JS hiểu đây là giờ UTC nếu backend không gửi kèm 'Z'
    const utcStr = dateStr.endsWith('Z') || dateStr.includes('+') ? dateStr : dateStr + 'Z'
    const date = new Date(utcStr)
    
    const today = new Date()
    const isToday = date.getDate() === today.getDate() && 
                    date.getMonth() === today.getMonth() && 
                    date.getFullYear() === today.getFullYear()
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    if (isToday) {
      return `Hôm nay ${timeStr}`
    }
    
    return `${date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} ${timeStr}`
  }

  return (
    <div 
      onClick={() => setActiveComment(null)}
      style={onClose ? {
        position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', pointerEvents: 'auto'
      } : {
        width: '100%', height: '520px', display: 'flex'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-surface)', width: onClose ? '95%' : '100%', maxWidth: onClose ? '460px' : 'none', flex: 1, borderRadius: '24px', 
          boxShadow: onClose ? '0 30px 60px -12px rgba(0, 0, 0, 0.3)' : 'none', display: 'grid', gridTemplateRows: 'auto 1fr auto', 
          position: 'relative', overflow: 'hidden', border: '1px solid var(--glass-border)',
          transform: (onClose && !isDragging.current) ? `translate(${position.x}px, ${position.y}px)` : 'none',
          transition: (onClose && !isDragging.current) ? 'transform 0.1s ease-out' : 'none'
        }}
      >
        <div onMouseDown={onClose ? handleMouseDown : undefined} style={{
          padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: 'var(--bg-surface)', cursor: onClose ? 'move' : 'default', userSelect: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>💬</span>
            <h3 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-primary)' }}>THẢO LUẬN</h3>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>✕</button>
          )}
        </div>

        {/* ✅ MỚI: Khu vực Sub-tasks Checklist */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff', maxHeight: '180px', overflowY: 'auto' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b' }}>📌 CÔNG VIỆC CON ({subTasks.filter(s => s.isCompleted).length}/{subTasks.length})</span>
           </div>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {subTasks.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', group: 'true' }}>
                   <input 
                      type="checkbox" 
                      checked={s.isCompleted} 
                      onChange={() => handleToggleSubTask(s.id)} 
                      style={{ cursor: 'pointer', accentColor: '#10B981', width: '16px', height: '16px' }} 
                   />
                   <span style={{ 
                      fontSize: '0.85rem', flex: 1, 
                      textDecoration: s.isCompleted ? 'line-through' : 'none',
                      color: s.isCompleted ? '#94a3b8' : '#1e293b'
                   }}>
                      {s.title}
                   </span>
                   {(isAdminOrManager || userId === taskCreatedBy) && (
                     <button onClick={() => handleDeleteSubTask(s.id)} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.8rem' }} className="hover:text-red-500">✕</button>
                   )}
                </div>
              ))}
               {(isAdminOrManager || userId === taskCreatedBy) && (
                 <form onSubmit={handleAddSubTask} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                   <input 
                     type="text" 
                     value={newSubTask} 
                     onChange={e => setNewSubTask(e.target.value)}
                     placeholder="+ Thêm đầu việc..." 
                     style={{ flex: 1, fontSize: '0.8rem', border: 'none', background: '#f8fafc', padding: '0.4rem 0.75rem', borderRadius: '8px' }}
                   />
                 </form>
               )}
           </div>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
             <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>Đang tải...</div>
          ) : (
            comments.map((c, index) => {
              const mine = isOwnMessage(c.userId)
              // Chỉ hiện danh sách "Đã xem" nếu có người xem và (người xem > 1 hoặc người xem không phải chính mình)
              const othersSeen = c.seenByUserFullNames?.filter(name => name !== 'Unknown') || []
              
              return (
                <div key={c.id} style={{
                  display: 'flex', alignItems: 'flex-end', flexDirection: mine ? 'row-reverse' : 'row', gap: '0.6rem',
                  marginBottom: (c.reactions?.length > 0 || othersSeen.length > 0) ? '18px' : '0'
                }}>
                  {!mine && (
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#6366f1', color: 'white', 
                      fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {getInitials(c.userFullName)}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                    {!mine && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px', marginLeft: '4px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b' }}>{c.userFullName}</span>
                        <span style={{ fontSize: '0.55rem', color: '#94a3b8' }}>{formatTime(c.createdAt)}</span>
                      </div>
                    )}
                    
                    <div className="message-wrapper" style={{ position: 'relative' }}>
                      <div 
                        onMouseDown={(e) => handleTouchStart(e, c)}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                        style={{
                          padding: '0.75rem 1.1rem', borderRadius: '20px', fontSize: '0.9rem',
                          backgroundColor: mine ? '#0084ff' : '#f0f2f5', color: mine ? 'white' : 'black',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer', userSelect: 'none',
                          zIndex: 1
                        }}
                      >
                        {c.content}
                      </div>

                      {/* Tooltip hiện người đã xem khi rê chuột vào tin nhắn */}
                      {othersSeen.length > 0 && (
                        <div className="seen-hover-names" style={{ [mine ? 'right' : 'left']: '5px' }}>
                          Đã xem: {othersSeen.join(', ')}
                        </div>
                      )}

                      {mine && (
                        <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '2px', marginRight: '4px', textAlign: 'right' }}>
                          {formatTime(c.createdAt)}
                        </div>
                      )}

                      {/* Reactions */}
                      <div style={{
                         position: 'absolute', bottom: mine ? '-12px' : '-16px', [mine ? 'left' : 'right']: '5px',
                         display: 'flex', alignItems: 'center', gap: '6px', zIndex: 5
                      }}>
                        {c.reactions?.length > 0 && (
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {c.reactions.map(r => (
                              <div key={r.emoji} className="reaction-stat-pill" style={{
                                backgroundColor: 'white', padding: '1px 6px', borderRadius: '10px', border: '1px solid #e2e8f0',
                                fontSize: '0.65rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '2px',
                                position: 'relative'
                              }}>
                                {r.emoji} <span>{r.count}</span>
                                <div className="reaction-hover-names">{r.userFullNames?.join(', ')}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {activeComment && (
          <div style={{
            position: 'absolute', zIndex: 1000, bottom: '80px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: 'white', padding: '10px 15px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            display: 'flex', gap: '12px', border: '1px solid #f0f0f0', animation: 'popIn 0.2s ease-out', alignItems: 'center'
          }}>
            {REACTIONS.map(emoji => (
              <span key={emoji} onClick={() => handleReactAndClose(activeComment.id, emoji)} style={{
                cursor: 'pointer', fontSize: '1.6rem', transition: 'transform 0.1s',
                backgroundColor: activeComment.myReaction === emoji ? '#f0f4ff' : 'transparent', borderRadius: '50%', padding: '2px'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >{emoji}</span>
            ))}
            <span onClick={() => handleReactAndClose(activeComment.id, activeComment.myReaction)}
              style={{ cursor: 'pointer', fontSize: '1rem', color: '#94a3b8', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '50%', marginLeft: '5px' }}
            >✖</span>
          </div>
        )}

        <div style={{ padding: '1.25rem', borderTop: '1px solid #f1f5f9', backgroundColor: 'white' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập tin nhắn..." style={{ flex: 1, padding: '0.75rem 1.25rem', borderRadius: '24px', border: 'none', backgroundColor: '#f0f2f5', outline: 'none' }} autoFocus />
            <button type="submit" disabled={!content.trim()} style={{ background: 'none', border: 'none', color: '#0084ff', fontSize: '1.5rem', cursor: 'pointer' }}>▶️</button>
          </form>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes popIn { from { transform: translateX(-50%) scale(0.9); opacity: 0; } to { transform: translateX(-50%) scale(1); opacity: 1; } }
          .reaction-stat-pill:hover .reaction-hover-names { display: block; }
          .message-wrapper:hover .seen-hover-names { display: block; }
          .reaction-hover-names, .seen-hover-names {
            position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.85); color: white; padding: 4px 8px; borderRadius: 6px; font-size: 0.65rem;
            white-space: nowrap; display: none; z-index: 100; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            pointer-events: none;
          }
          /* Custom tooltip position specifically for the message bubble */
          .seen-hover-names {
            top: 100%; bottom: auto; left: auto; transform: none; margin-top: 5px;
          }
        `}} />
      </div>
    </div>
  )
}
