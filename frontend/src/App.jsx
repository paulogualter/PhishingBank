import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Landing from './pages/Landing'
import AbrirConta from './pages/AbrirConta'
import Dashboard from './pages/Dashboard'
import Statement from './pages/Statement'
import Transfer from './pages/Transfer'
import Account from './pages/Account'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/abrir-conta" element={<AbrirConta />} />
        <Route path="/app" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="extrato" element={<Statement />} />
          <Route path="transferir" element={<Transfer />} />
          <Route path="conta" element={<Account />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
