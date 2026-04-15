import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import Progress from './pages/Progress'
import Review from './pages/Review'
import Units from './pages/Units'
import Users from './pages/Users'
import ForgotPassword from './pages/ForgotPassword'
import Admin from './pages/Admin'
import DepartmentStaff from './pages/DepartmentStaff'
import Dashboard from './pages/Dashboard'
import ChangePassword from './pages/ChangePassword'
import Profile from './pages/Profile'
import Performance from './pages/Performance'

function PrivateRoute({ children, adminOnly = false, managerOnly = false, adminOrManager = false }) {
  const { token, role } = useAuth()

  if (!token) return <Navigate to="/login" />
  if (adminOnly && role !== 'Admin') return <Navigate to="/admin" />
  if (managerOnly && role !== 'Manager') return <Navigate to="/tasks" />
  if (adminOrManager && role !== 'Admin' && role !== 'Manager') return <Navigate to="/tasks" />

  return children
}

function App() {
  return (
    <AuthProvider>
      <ToastContainer position="bottom-right" />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin only */}
          <Route path="/admin" element={<PrivateRoute adminOnly><Admin /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute adminOnly><Users /></PrivateRoute>} />

          {/* Admin + Manager */}
          <Route path="/dashboard" element={<PrivateRoute adminOrManager><Dashboard /></PrivateRoute>} />

          {/* Tất cả role (Units có logic hiển thị riêng cho từng role) */}
          <Route path="/units" element={<PrivateRoute><Units /></PrivateRoute>} />

          {/* Manager + User */}
          <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />

          {/* Manager only */}
          <Route path="/review" element={<PrivateRoute managerOnly><Review /></PrivateRoute>} />
          <Route path="/department-staff" element={<PrivateRoute managerOnly><DepartmentStaff /></PrivateRoute>} />

          {/* Tất cả role */}
          <Route path="/performance" element={<PrivateRoute><Performance /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

          <Route path="*" element={<RoleRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function RoleRedirect() {
  const { token, role } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (role === 'Admin') return <Navigate to="/admin" />
  return <Navigate to="/tasks" />
}

export default App