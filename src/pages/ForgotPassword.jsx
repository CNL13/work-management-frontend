import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', position: 'relative', overflow: 'hidden' }}>
      {/* BG Orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div className="animate-float" style={{ position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.15), transparent 70%)' }} />
        <div className="animate-float" style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%)', animationDelay: '2s' }} />
      </div>

      <div className="animate-slide-up" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '440px' }}>
        <div style={{ position: 'absolute', inset: '-1px', borderRadius: '1.25rem', background: 'linear-gradient(135deg, rgba(79,70,229,0.4), rgba(6,182,212,0.2))', filter: 'blur(1px)', opacity: 0.5 }} />
        <div style={{ position: 'relative', background: 'rgba(255, 255, 255,0.97)', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: '1.25rem', padding: '2.5rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

          {/* Icon */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '0.75rem', filter: 'drop-shadow(0 0 20px rgba(79,70,229,0.5))' }}>🔒</div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Quên mật khẩu?</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Vì lý do bảo mật, việc đặt lại mật khẩu chỉ có thể được thực hiện bởi{' '}
              <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>Quản trị viên (Admin)</span>.
            </p>
          </div>

          {/* Steps */}
          <div style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.2)', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.75rem' }}>
            <p style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.875rem' }}>📋 Hướng dẫn lấy lại mật khẩu:</p>
            <ol style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                'Liên hệ Quản trị viên (Admin) của hệ thống',
                'Cung cấp Tên đăng nhập hoặc Mã nhân viên',
                'Admin sẽ đặt lại mật khẩu mới cho bạn',
              ].map((step, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <Link to="/login" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', padding: '0.875rem' }}>
            <svg style={{ width: '16px', height: '16px', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}