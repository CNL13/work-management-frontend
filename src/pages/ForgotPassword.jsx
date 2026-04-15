import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Quên mật khẩu?
        </h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Vì lý do bảo mật, việc đặt lại mật khẩu chỉ có thể được thực hiện bởi{' '}
          <span className="font-semibold text-blue-600">Quản trị viên (Admin)</span>.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-blue-700 font-semibold mb-2">📋 Hướng dẫn:</p>
          <ol className="text-sm text-blue-600 space-y-1 list-decimal list-inside">
            <li>Liên hệ Quản trị viên (Admin) của hệ thống</li>
            <li>Cung cấp <strong>Tên đăng nhập</strong> hoặc <strong>Mã nhân viên</strong></li>
            <li>Admin sẽ đặt lại mật khẩu mới cho bạn</li>
          </ol>
        </div>

        <Link
          to="/login"
          className="inline-block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          ← Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  )
}