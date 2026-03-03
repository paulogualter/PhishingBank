import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../services/api'

export default function AbrirConta() {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const token = useAuthStore((s) => s.token)

  if (token) return <Navigate to="/app" replace />

  const formatCpf = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/abrir-conta', {
        nome: nome.trim(),
        cpf: cpf.replace(/\D/g, ''),
        email: email.trim().toLowerCase(),
        senha,
      })
      setAuth(data.access_token, { id: data.user_id, nome: data.nome, conta: data.conta })
      navigate('/app')
    } catch (err) {
      const msg = err.response?.data?.error
      setError(
        msg === 'email_ja_cadastrado' ? 'E-mail já cadastrado' :
        msg === 'cpf_ja_cadastrado' ? 'CPF já cadastrado' :
        err.response?.data?.error || 'Erro ao abrir conta'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 font-bold text-lg">PB</span>
            </div>
            <span className="text-xl font-semibold text-white">Phishing Bank</span>
          </Link>
          <Link to="/" className="text-slate-400 hover:text-white text-sm transition">
            Já tenho conta
          </Link>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-12">
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Abra sua conta</h1>
          <p className="text-slate-400 text-sm mb-6">
            Conta 100% digital com zero de anuidade. Comece com R$ 0,00 e adicione dinheiro quando quiser.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="João Silva"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="000.000.000-00"
                maxLength={14}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="seu@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Senha</label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Abrindo conta...' : 'Abrir conta grátis'}
            </button>
          </form>
          <p className="mt-4 text-center text-slate-500 text-xs">
            Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
          </p>
        </div>
      </main>
      <footer className="border-t border-slate-700/50 py-6 mt-8">
        <p className="text-slate-500 text-sm text-center">
          Phishing Bank - Plataforma educacional. Nunca use em produção.
        </p>
      </footer>
    </div>
  )
}
