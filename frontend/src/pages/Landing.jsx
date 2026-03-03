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
    <div className="min-h-screen bg-slate-900">
      {/* Banner principal */}
      <section className="relative w-full overflow-hidden">
        <div className="relative w-full aspect-[4/1] min-h-[200px] sm:min-h-[280px] md:min-h-[360px] lg:min-h-[420px]">
          <img
            src="/banner.svg"
            alt="Phishing Bank"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center lg:justify-start">
            <div className="px-4 sm:px-6 lg:px-12 xl:px-20 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-400 font-bold text-xl">PB</span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Phishing Bank</h1>
                </div>
              </div>
              <Link
                to="/abrir-conta"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition text-sm w-fit"
              >
                Abra sua conta
              </Link>
            </div>
          </div>

          {/* Formulário no canto superior direito */}
          <div className="absolute top-3 right-3 sm:top-6 sm:right-6 lg:top-8 lg:right-12 xl:right-20 w-[calc(100%-1.5rem)] max-w-[280px] sm:max-w-[320px] sm:w-[320px]">
            <form onSubmit={handleSubmit} className="bg-slate-900/95 backdrop-blur-sm rounded-xl border border-slate-700/60 p-4 sm:p-5 shadow-2xl">
              <h2 className="text-sm font-semibold text-white mb-3">Acesse sua conta</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
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
                  <div>
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
      </section>

      <footer className="bg-slate-950 border-t border-slate-700/50 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-12">
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
