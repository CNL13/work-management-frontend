import { createContext, useContext, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext()

function parseToken(token) {
  try {
    const payload = jwtDecode(token)
    const role =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload['role'] || null
    const userId = payload['id'] || payload['sub'] || null
    const username =
      payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      payload['unique_name'] || ''
    const fullName = payload['fullName'] || ''
    const employeeCode = payload['employeeCode'] || ''
    return { role, userId, username, fullName, employeeCode }
  } catch {
    return { role: null, userId: null, username: '', fullName: '', employeeCode: '' }
  }
}

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [info, setInfo] = useState(() => {
    const t = localStorage.getItem('token')
    return t ? parseToken(t) : { role: null, userId: null, username: '', fullName: '', employeeCode: '' }
  })

  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setInfo(parseToken(newToken))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setInfo({ role: null, userId: null, username: '', fullName: '', employeeCode: '' })
  }

  // ✅ Hàm mới: Cập nhật thông tin hiển thị ngay lập tức
  const updateUserInfo = (newData) => {
    setInfo((prev) => ({
      ...prev,
      ...newData
    }))
  }

  const isAdmin = info.role === 'Admin'
  const isManager = info.role === 'Manager'
  const isAdminOrManager = isAdmin || isManager

  return (
    <AuthContext.Provider value={{
      token,
      ...info, // Giải nén info để lấy trực tiếp fullName, role, userId...
      isAdmin,
      isManager,
      isAdminOrManager,
      login,
      logout,
      updateUserInfo // ✅ Export hàm này ra
    }}>
      {children}
    </AuthContext.Provider>
  )
}