import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'
import Navbar from '../components/Navbar'

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
      {children}
    </label>
  )
}

function PasswordInput({ name, value, onChange, placeholder, show, onToggle }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
        <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </span>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        className="input-modern"
        style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
        placeholder={placeholder}
      />
      <button type="button" onClick={onToggle} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-muted)' }}>
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  )
}

export default function ChangePassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [shows, setShows] = useState({ old: false, new: false, confirm: false })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const toggleShow = (key) => setShows(p => ({ ...p, [key]: !p[key] }))

  // Password strength
  const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' }
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    const map = [
      { label: 'Rất yếu', color: '#ef4444' },
      { label: 'Yếu', color: '#f97316' },
      { label: 'Trung bình', color: '#f59e0b' },
      { label: 'Mạnh', color: '#10b981' },
      { label: 'Rất mạnh', color: '#06b6d4' },
    ]
    return { score, ...map[score] }
  }
  const strength = getStrength(form.newPassword)

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin!')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu mới không khớp!')
      return
    }
    if (form.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự!')
      return
    }
    try {
      setLoading(true)
      await api.post('/change-password', form)
      toast.success('✅ Đổi mật khẩu thành công!')
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', minHeight: 'calc(100vh - 60px)' }}>
        <div className="animate-scale-in" style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
          {/* Glow */}
          <div style={{ position: 'absolute', inset: '-1px', borderRadius: '1.25rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.4), rgba(6,182,212,0.2))', filter: 'blur(1px)', opacity: 0.5 }} />
          <div style={{ position: 'relative', background: 'rgba(255, 255, 255,0.97)', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '1.25rem', padding: '2.5rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 30px rgba(245,158,11,0.3)', fontSize: '1.75rem' }}>
                🔐
              </div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Đổi mật khẩu</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Nhập mật khẩu cũ và tạo mật khẩu mới</p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <FieldLabel>Mật khẩu hiện tại</FieldLabel>
                <PasswordInput name="oldPassword" value={form.oldPassword} onChange={handleChange} placeholder="Nhập mật khẩu hiện tại" show={shows.old} onToggle={() => toggleShow('old')} />
              </div>
              <div>
                <FieldLabel>Mật khẩu mới</FieldLabel>
                <PasswordInput name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Tối thiểu 6 ký tự" show={shows.new} onToggle={() => toggleShow('new')} />
                {/* Strength indicator */}
                {form.newPassword && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                      {[0,1,2,3].map(i => (
                        <div key={i} style={{ flex: 1, height: '3px', borderRadius: '9999px', background: i < strength.score ? strength.color : 'rgba(0, 0, 0, 0.1)', transition: 'background 0.3s ease' }} />
                      ))}
                    </div>
                    <p style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 600 }}>Độ mạnh: {strength.label}</p>
                  </div>
                )}
              </div>
              <div>
                <FieldLabel>Xác nhận mật khẩu mới</FieldLabel>
                <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Nhập lại mật khẩu mới" show={shows.confirm} onToggle={() => toggleShow('confirm')} />
                {/* Match indicator */}
                {form.confirmPassword && (
                  <p style={{ fontSize: '0.7rem', marginTop: '0.25rem', color: form.confirmPassword === form.newPassword ? '#6ee7b7' : '#fca5a5', fontWeight: 600 }}>
                    {form.confirmPassword === form.newPassword ? '✅ Mật khẩu khớp' : '❌ Mật khẩu không khớp'}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '0.875rem', marginTop: '2rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Đang xử lý...</>
              ) : (
                <><svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Lưu mật khẩu mới</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}