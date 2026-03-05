import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Statement() {
  const [transactions, setTransactions] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const conta = useAuthStore((s) => s.user?.conta)

  useEffect(() => {
    Promise.all([
      api.get('/transactions'),
      api.get('/accounts')
    ]).then(([txRes, accRes]) => {
      setTransactions(txRes.data.transactions || [])
      setAccounts(accRes.data.accounts || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12">Carregando...</div>

  const mainAccount = accounts[0] || conta

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-semibold text-primary">Extrato</h2>
        {mainAccount && (
          <span className="text-sm font-mono text-gray-600">
            Ag. {mainAccount.agency} | Cc. {mainAccount.number}
          </span>
        )}
      </div>
      <div className="divide-y max-h-[600px] overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.uuid} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 hover:bg-gray-50">
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
