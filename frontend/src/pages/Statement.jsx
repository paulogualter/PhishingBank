import { useEffect, useState } from 'react'
import api from '../services/api'

export default function Statement() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/transactions').then((res) => {
      setTransactions(res.data.transactions || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12">Carregando...</div>

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <h2 className="p-4 font-semibold text-primary border-b">Extrato</h2>
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.uuid} className="p-4 flex justify-between items-center hover:bg-gray-50">
            <div>
              <p className="font-medium">{tx.type?.toUpperCase()}</p>
              {/* VULN-25: observacao renderizado sem sanitização - Stored XSS */}
              <p className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: tx.observacao || '-' }} />
            </div>
            <div className="text-right">
              <p className={`font-semibold ${tx.amount > 0 ? 'text-secondary' : 'text-red-600'}`}>
                R$ {Math.abs(tx.amount).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="p-8 text-center text-gray-500">Nenhuma transação</p>
        )}
      </div>
    </div>
  )
}
