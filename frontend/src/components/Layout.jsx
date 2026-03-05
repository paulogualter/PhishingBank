import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const navLinks = [
    { to: '/app', label: 'Dashboard' },
    { to: '/app/extrato', label: 'Extrato' },
    { to: '/app/transferir', label: 'Transferir' },
    { to: '/app/conta', label: 'Minha Conta' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center min-w-0">
              <span className="text-lg sm:text-xl font-bold truncate">🏦 Phishing Bank</span>
              <span className="ml-2 text-xs sm:text-sm opacity-80 hidden md:inline truncate">
                Onde o Seu Dinheiro é Nosso Dinheiro
              </span>
            </div>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-4 xl:gap-6">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="hover:text-accent transition whitespace-nowrap">
                  {label}
                </Link>
              ))}
              {user?.conta && (
                <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded truncate max-w-[120px]">
                  Ag. {user.conta.agency} | Cc. {user.conta.number}
                </span>
              )}
              <span className="text-sm truncate max-w-[100px]">{user?.nome}</span>
              <button onClick={handleLogout} className="bg-white/10 px-4 py-2 rounded hover:bg-white/20 transition whitespace-nowrap">
                Sair
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition"
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile dropdown menu */}
          {menuOpen && (
            <div className="lg:hidden border-t border-white/20 py-4 space-y-2">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 px-4 hover:bg-white/10 rounded-lg transition"
                >
                  {label}
                </Link>
              ))}
              {user?.conta && (
                <div className="px-4 py-2 text-xs font-mono text-white/80">
                  Ag. {user.conta.agency} | Cc. {user.conta.number}
                </div>
              )}
              <div className="px-4 py-2 text-sm text-white/90">{user?.nome}</div>
              <button
                onClick={handleLogout}
                className="w-full text-left py-2 px-4 hover:bg-white/10 rounded-lg transition"
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
