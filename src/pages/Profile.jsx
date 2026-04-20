import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

export default function Profile() {
  const navigate = useNavigate()
  const { updateUserInfo, login } = useAuth()

  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile')
        setForm({
          fullName: res.data.fullName || '',
          email: res.data.email || '',
          phoneNumber: res.data.phoneNumber || ''
        })
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.fullName) {
      toast.error('Họ tên không được để trống!')
      return
    }

    if (form.phoneNumber) {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
      if (!phoneRegex.test(form.phoneNumber)) {
        toast.error('Số điện thoại không hợp lệ! (Ví dụ: 0987654321)')
        return
      }
    }

    try {
      setLoading(true)
      const res = await api.put('/profile', form)
      if (res.data?.token) {
        login(res.data.token)
      } else {
        updateUserInfo({ fullName: form.fullName })
      }
      toast.success('✅ Cập nhật thành công!')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cập nhật thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    {
      name: 'fullName',
      label: 'Họ và tên',
      type: 'text',
      placeholder: 'Nhập họ và tên',
      required: true,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'Nhập địa chỉ email',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'phoneNumber',
      label: 'Số điện thoại',
      type: 'text',
      placeholder: 'VD: 0987654321',
      hint: 'Chỉ nhận số điện thoại Việt Nam 10 chữ số (đầu 03/05/07/08/09)',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      )
    },
  ]

  if (fetching) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <svg className="animate-spin w-8 h-8 mx-auto mb-3" style={{ color: 'var(--primary-light)' }} fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p style={{ fontSize: '0.875rem' }}>Đang tải hồ sơ...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', minHeight: 'calc(100vh - 60px)' }}>
        <div className="animate-scale-in w-full" style={{ maxWidth: '440px' }}>
          {/* Glow wrapper */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: '-1px', borderRadius: '1.25rem',
              background: 'linear-gradient(135deg, rgba(79,70,229,0.4), rgba(6,182,212,0.2))',
              filter: 'blur(1px)', opacity: 0.6,
            }} />
            <div style={{
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '1.25rem',
              padding: '2.5rem 2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {/* Avatar circle */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '1rem',
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.75rem', margin: '0 auto 1rem',
                  boxShadow: '0 0 30px rgba(79,70,229,0.4)',
                }}>
                  👤
                </div>
                <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Hồ sơ cá nhân
                </h1>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Cập nhật thông tin của bạn</p>
              </div>

              {/* Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {fields.map(field => (
                  <div key={field.name}>
                    <label style={{
                      display: 'block', fontSize: '0.7rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      color: 'var(--text-secondary)', marginBottom: '0.5rem',
                    }}>
                      {field.label} {field.required && <span style={{ color: '#f87171' }}>*</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute', left: '0.875rem', top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}>
                        {field.icon}
                      </span>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="input-modern"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                    {field.hint && (
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                        💡 {field.hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Save button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full"
                style={{ marginTop: '2rem', padding: '0.875rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}