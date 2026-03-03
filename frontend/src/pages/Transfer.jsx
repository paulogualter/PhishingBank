import { useState } from 'react'
import api from '../services/api'

export default function Transfer() {
  const [pixKey, setPixKey] = useState('')
  const [amount, setAmount] = useState('')
  const [observacao, setObservacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      await api.post('/pix/transfer', {
        pix_key: pixKey,
        amount: parseFloat(amount),
        observacao,
      })
      setMessage({ type: 'success', text: 'Transferência realizada com sucesso!' })
      setPixKey('')
      setAmount('')
      setObservacao('')
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Erro na transferência' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Transferência PIX</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary"
              placeholder="CPF, email, telefone ou chave aleatória"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-secondary"
              placeholder="Descrição da transferência"
            />
          </div>
          {message && (
            <p className={message.type === 'success' ? 'text-green-600' : 'text-red-500'}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Transferir'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-500">
          Use chave PIX: 00010000 para conta de João, 00020000 para Maria
        </p>
      </div>
    </div>
  )
}
