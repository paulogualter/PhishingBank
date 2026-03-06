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

  if (loading) return <div className="text-center py-12 text-slate-400">Carregando...</div>

  const mainAccount = accounts[0] || conta

  return (
    <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 flex justify-between items-center">
        <h2 className="font-semibold text-white">Extrato</h2>
        {mainAccount && (
          <span className="text-sm font-mono text-slate-400">
            Ag. {mainAccount.agency} | Cc. {mainAccount.number}
          </span>
        )}
      </div>
      <div className="divide-y divide-slate-700/50 max-h-[600px] overflow-y-auto">
        {transactions.map((tx) => (
          <div key={tx.uuid} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 hover:bg-slate-800/30 transition">
            <div>
              <p className="font-medium text-white">{tx.type?.toUpperCase()}</p>
              {/* VULN-25: observacao renderizado sem sanitização - Stored XSS */}
              <p className="text-sm text-slate-400" dangerouslySetInnerHTML={{ __html: tx.observacao || '-' }} />
            </div>
            <div className="text-right">
              <p className={`font-semibold ${tx.amount > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                R$ {Math.abs(tx.amount).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-slate-500">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="p-8 text-center text-slate-500">Nenhuma transação</p>
        )}
      </div>
    </div>
  )
}
