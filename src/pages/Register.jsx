import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'

// ─── Shared animated background ───────────────────────────────
function AuthBg() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      <div className="animate-float" style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)' }} />
      <div className="animate-float" style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%)', animationDelay: '2s' }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />
    </div>
  )
}

// ─── Form Card wrapper ─────────────────────────────────────────
function AuthCard({ children }) {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '480px' }} className="animate-slide-up">
      <div style={{ position: 'absolute', inset: '-1px', borderRadius: '1.25rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.4), rgba(6,182,212,0.2))', filter: 'blur(1px)', opacity: 0.5 }} />
      <div style={{ position: 'relative', background: 'rgba(255, 255, 255,0.97)', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '1.25rem', padding: '2.5rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Field label ───────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
      {children}{required && <span style={{ color: '#f87171', marginLeft: '0.25rem' }}>*</span>}
    </label>
  )
}

export default function Register() {
  const [form, setForm] = useState({ username: '', fullName: '', password: '', role: 'User', unitId: '', phoneNumber: '' })
  const [units, setUnits] = useState([])
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => { fetchUnits() }, [])

  const fetchUnits = async () => {
    try {
      const res = await api.get('/units/public')
      setUnits(res.data || [])
    } catch (err) { console.error(err) }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleRegister = async (e) => {
    e.preventDefault()
    setSuccess('')
    if (form.phoneNumber) {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
      if (!phoneRegex.test(form.phoneNumber)) {
        toast.error('Số điện thoại không hợp lệ! (VD: 0987654321)')
        return
      }
    }
    setLoading(true)
    try {
      const payload = { ...form, unitId: form.unitId || null }
      const res = await api.post('/auth/register', payload)
      setSuccess(res.data || 'Đăng ký thành công! Vui lòng chờ Admin phê duyệt.')
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || 'Đăng ký thất bại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative' }}>
      <AuthBg />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '480px' }} className="animate-slide-up">
        <AuthCard>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '1rem', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 0 30px rgba(79,70,229,0.4)' }}>
              <svg style={{ width: '28px', height: '28px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Tạo tài khoản
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Tài khoản cần được Admin phê duyệt trước khi đăng nhập</p>
          </div>

          {/* Success State */}
          {success && (
            <div className="animate-scale-in" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.875rem', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎉</div>
              <p style={{ color: '#6ee7b7', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>{success}</p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', padding: '0.625rem 1.5rem' }}>
                ← Đăng nhập ngay
              </Link>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} autoComplete="off">
              <input type="text" style={{ display: 'none' }} />
              <input type="password" style={{ display: 'none' }} />

              {/* Full Name */}
              <div>
                <FieldLabel required>Họ và tên</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </span>
                  <input type="text" name="fullName" value={form.fullName} onChange={handleChange} className="input-modern" style={{ paddingLeft: '2.5rem' }} placeholder="Nhập họ và tên" autoComplete="off" required />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <FieldLabel required>Số điện thoại</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </span>
                  <input type="text" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="input-modern" style={{ paddingLeft: '2.5rem' }} placeholder="VD: 0987654321" autoComplete="off" required />
                </div>
              </div>

              {/* Username */}
              <div>
                <FieldLabel required>Tên đăng nhập</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </span>
                  <input type="text" name="username" value={form.username} onChange={handleChange} className="input-modern" style={{ paddingLeft: '2.5rem' }} placeholder="Nhập tên đăng nhập" autoComplete="off" required />
                </div>
              </div>

              {/* Password */}
              <div>
                <FieldLabel required>Mật khẩu</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                    <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </span>
                  <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input-modern" style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }} placeholder="Tối thiểu 6 ký tự" autoComplete="new-password" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Role (readonly) */}
              <div>
                <FieldLabel>Chức vụ</FieldLabel>
                <input type="text" value="Nhân viên" disabled className="input-modern" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>💡 Trưởng phòng sẽ được Admin phân quyền sau khi duyệt</p>
              </div>

              {/* Unit */}
              <div>
                <FieldLabel>Phòng ban <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none', fontSize: '0.65rem' }}>(không bắt buộc)</span></FieldLabel>
                <select name="unitId" value={form.unitId} onChange={handleChange} className="input-modern" style={{ cursor: 'pointer' }}>
                  <option value="">-- Chọn phòng ban --</option>
                  {units.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
                </select>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>💡 Admin có thể gán phòng ban sau khi duyệt</p>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Đang xử lý...</>
                ) : (
                  <><svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> Đăng ký tài khoản</>
                )}
              </button>
            </form>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '1.5rem' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600, textDecoration: 'none' }}>Đăng nhập →</Link>
          </p>
        </AuthCard>
      </div>
    </div>
  )
}
