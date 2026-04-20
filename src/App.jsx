import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import Login from './pages/Login'
import Register from './pages/Register'
import Tasks from './pages/Tasks'
import TaskDetail from './pages/TaskDetail'
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
import MyHistory from './pages/MyHistory'

function PrivateRoute({ children, adminOnly = false, managerOnly = false, adminOrManager = false, noAdmin = false }) {
  const { token, role } = useAuth()

  if (!token) return <Navigate to="/login" />
  if (adminOnly && role !== 'Admin') return <Navigate to="/dashboard" />
  if (managerOnly && role !== 'Manager') return <Navigate to="/tasks" />
  if (adminOrManager && role !== 'Admin' && role !== 'Manager') return <Navigate to="/tasks" />
  if (noAdmin && role === 'Admin') return <Navigate to="/admin" />

  return children
}

function App() {
  return (
    <AuthProvider>
      {/* Background Blobs for specific "Living" feel */}
      <div className="blob" style={{ width: '400px', height: '400px', background: 'rgba(79, 70, 229, 0.1)', top: '-100px', left: '-100px' }} />
      <div className="blob" style={{ width: '300px', height: '300px', background: 'rgba(6, 182, 212, 0.08)', bottom: '10%', right: '-50px', animationDelay: '-5s' }} />
      <div className="blob" style={{ width: '500px', height: '500px', background: 'rgba(139, 92, 246, 0.05)', top: '40%', left: '30%', animationDelay: '-10s' }} />
      
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

          {/* Manager + User (Admin không cần xem) */}
          <Route path="/tasks" element={<PrivateRoute noAdmin><Tasks /></PrivateRoute>} />
          <Route path="/tasks/:id" element={<PrivateRoute noAdmin><TaskDetail /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute noAdmin><Progress /></PrivateRoute>} />

          {/* Manager only */}
          <Route path="/review" element={<PrivateRoute managerOnly><Review /></PrivateRoute>} />
          <Route path="/department-staff" element={<PrivateRoute managerOnly><DepartmentStaff /></PrivateRoute>} />

          {/* Tất cả hoặc hạn chế */}
          <Route path="/performance" element={<PrivateRoute noAdmin><Performance /></PrivateRoute>} />
          <Route path="/my-history" element={<PrivateRoute noAdmin><MyHistory /></PrivateRoute>} />
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