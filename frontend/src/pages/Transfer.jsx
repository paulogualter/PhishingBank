import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Transfer() {
  const [pixKey, setPixKey] = useState('')
  const [amount, setAmount] = useState('')
  const [observacao, setObservacao] = useState('')
  const [loading, setLoading] = useState(false)
  const conta = useAuthStore((s) => s.user?.conta)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/pix/transfer', {
        pix_key: pixKey,
        amount: parseFloat(amount),
        observacao,
      }, { skipToast: true })
      toast.success('Transferência realizada com sucesso!')
      setPixKey('')
      setAmount('')
      setObservacao('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro na transferência')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 shadow-lg p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Transferência PIX</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Chave PIX</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              placeholder="CPF, email, telefone ou chave aleatória"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Observação</label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              placeholder="Descrição da transferência"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 py-3 rounded-lg font-semibold disabled:opacity-50 transition"
          >
            {loading ? 'Processando...' : 'Transferir'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-500">
          Use número da conta: 10001-1 (João), 20002-2 (Maria)
        </p>
      </div>
    </div>
  )
}
