import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">🏦 Phishing Bank</span>
              <span className="ml-2 text-sm opacity-80">Onde o Seu Dinheiro é Nosso Dinheiro</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="hover:text-accent transition">Dashboard</Link>
              <Link to="/extrato" className="hover:text-accent transition">Extrato</Link>
              <Link to="/transferir" className="hover:text-accent transition">Transferir</Link>
              <span className="text-sm">{user?.nome}</span>
              <button onClick={handleLogout} className="bg-secondary px-4 py-2 rounded hover:opacity-90">
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
