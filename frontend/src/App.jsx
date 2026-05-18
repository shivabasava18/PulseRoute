import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Emergencies from './pages/Emergencies'
import Ambulances from './pages/Ambulances'
import Hospitals from './pages/Hospitals'
import Analytics from './pages/Analytics'

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/emergency"  element={<ProtectedRoute><Emergencies /></ProtectedRoute>} />
          <Route path="/ambulances" element={<ProtectedRoute allowedRoles={['admin','dispatcher']}><Ambulances /></ProtectedRoute>} />
          <Route path="/hospitals"  element={<ProtectedRoute><Hospitals /></ProtectedRoute>} />
          <Route path="/analytics"  element={<ProtectedRoute allowedRoles={['admin','dispatcher']}><Analytics /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function AuthLayout() {
  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*"         element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function Router() {
  const { user } = useAuth()
  return user ? <AppLayout /> : <AuthLayout />
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
