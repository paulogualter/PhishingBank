import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

export default function Landing() {
  const [agencia, setAgencia] = useState('')
  const [conta, setConta] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)

  if (token) return <Navigate to="/app" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login-bank', {
        agencia: agencia.replace(/\D/g, '') || '0001',
        conta: conta.trim(),
        senha,
      })
      setAuth(data.access_token, { id: data.user_id, nome: data.nome, conta: data.conta })
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.error === 'conta_nao_encontrada' ? 'Agência e conta não encontrados' : err.response?.data?.error === 'senha_incorreta' ? 'Senha incorreta' : 'Erro ao acessar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 overflow-x-hidden flex flex-col w-full max-w-[100vw]">
      {/* Banner principal / Hero - altura fluida em mobile/tablet para evitar corte */}
      <section className="relative w-full overflow-x-hidden overflow-y-visible">
        <div className="relative w-full min-h-[480px] sm:min-h-[420px] md:min-h-[400px] lg:aspect-[3/1] lg:min-h-[480px]">
          {/* Hero image */}
          <img
            src="/banner.jpeg"
            alt="Phishing Bank"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradiente mais forte à esquerda para legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/20" />
          <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4 px-3 py-4 sm:px-8 sm:py-6 lg:px-16 xl:px-24 lg:py-10 pb-16 sm:pb-16 lg:pb-10 overflow-y-auto overflow-x-hidden">
            {/* Logo e CTA - à esquerda no desktop */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 order-2 lg:order-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500/30 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg">
                  <span className="text-amber-400 font-bold text-xl sm:text-2xl">PB</span>
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
                    Phishing Bank
                  </h1>
                </div>
              </div>
              <Link
                to="/abrir-conta"
                className="inline-flex items-center justify-center px-5 py-2.5 sm:px-6 sm:py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition text-sm w-full sm:w-fit shadow-lg hover:shadow-amber-500/25"
              >
                Abra sua conta
              </Link>
            </div>

            {/* Formulário - à direita no desktop, centralizado em mobile */}
            <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-[320px] lg:max-w-none lg:w-[320px] xl:w-[340px] order-1 lg:order-2 shrink-0 min-w-0 self-center">
            <form onSubmit={handleSubmit} className="bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-700/60 p-3 sm:p-5 shadow-2xl w-full min-w-0 box-border">
              <h2 className="text-sm font-semibold text-white mb-3">Acesse sua conta</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 min-w-0">
                  <div className="min-w-0">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Agência</label>
                    <input
                      type="text"
                      value={agencia}
                      onChange={(e) => setAgencia(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      placeholder="0001"
                      maxLength={4}
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs font-medium text-slate-400 mb-1">Conta</label>
                    <input
                      type="text"
                      value={conta}
                      onChange={(e) => setConta(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      placeholder="10001-1"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Senha</label>
                  <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-800/80 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-2.5 text-sm rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Acessando...' : 'Entrar'}
                </button>
              </div>
              <p className="mt-3 text-center text-slate-500 text-[10px] sm:text-xs">
                Ag. 0001 | Cc. 10001-1 | senha123
              </p>
            </form>
            </div>
          </div>
          {/* Barra do lema - tamanho em evidência, igual ao Phishing Bank */}
          <div className="absolute bottom-0 left-0 right-0 py-4 px-4 sm:py-5 sm:px-6 lg:py-6 bg-slate-800/90 backdrop-blur-xl border-t border-slate-600/50 shadow-[0_-4px_20px_rgba(15,23,42,0.5)]">
            <p className="text-center text-amber-400 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold italic drop-shadow-lg">
              Onde Seu Dinheiro é Nosso Dinheiro!
            </p>
          </div>
        </div>
      </section>

      {/* Seção de serviços bancários - 6 colunas com ícones SVG */}
      <section className="bg-slate-900 border-b border-slate-700/50 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {/* PIX */}
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 group-hover:text-amber-300 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-slate-300 text-xs sm:text-sm font-medium text-center">PIX</span>
            </div>
            {/* Transferências */}
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 group-hover:text-amber-300 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-slate-300 text-xs sm:text-sm font-medium text-center">Transferências</span>
            </div>
            {/* Conta Corrente */}
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 group-hover:text-amber-300 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 10h20" />
                  <path d="M6 14h4" />
                </svg>
              </div>
              <span className="text-slate-300 text-xs sm:text-sm font-medium text-center">Conta Corrente</span>
            </div>
            {/* Cartão */}
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 group-hover:text-amber-300 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20" />
                </svg>
              </div>
              <span className="text-slate-300 text-xs sm:text-sm font-medium text-center">Cartão</span>
            </div>
            {/* Empréstimo */}
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 group-hover:text-amber-300 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v7M12 14v7M16 14v7" />
                </svg>
              </div>
              <span className="text-slate-300 text-xs sm:text-sm font-medium text-center">Empréstimo</span>
            </div>
            {/* Investimentos */}
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/30 transition group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 group-hover:text-amber-300 transition">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <span className="text-slate-300 text-xs sm:text-sm font-medium text-center">Investimentos</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-auto bg-slate-950 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 font-bold">PB</span>
                </div>
                <span className="font-semibold text-white">Phishing Bank</span>
              </div>
              <p className="text-slate-400 text-sm">
                Banco 100% digital. Conta corrente, PIX, transferências e mais.
              </p>
              <p className="text-amber-400/80 text-xs italic mt-1">Onde Seu Dinheiro é Nosso Dinheiro!</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Produtos</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link to="/abrir-conta" className="hover:text-amber-400 transition">Abra sua conta</Link></li>
                <li><a href="#" className="hover:text-amber-400 transition">Conta corrente</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">PIX</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Cartão de crédito</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Institucional</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-amber-400 transition">Sobre nós</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Carreiras</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Imprensa</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Relações com investidores</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Atendimento</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-amber-400 transition">Central de ajuda</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Ouvidoria</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Segurança</a></li>
                <li><a href="#" className="hover:text-amber-400 transition">Canais de denúncia</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center gap-6 text-slate-500 text-xs">
              <a href="#" className="hover:text-slate-400 transition">Termos de uso</a>
              <a href="#" className="hover:text-slate-400 transition">Política de privacidade</a>
              <a href="#" className="hover:text-slate-400 transition">Cookies</a>
            </div>
            <p className="text-slate-500 text-xs text-center sm:text-right">
              Phishing Bank S.A. — Plataforma educacional. Nunca use em produção.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
