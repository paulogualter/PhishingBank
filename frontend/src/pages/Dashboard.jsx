import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Dashboard() {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const conta = useAuthStore((s) => s.user?.conta)

  useEffect(() => {
    Promise.all([
      api.get('/accounts'),
      api.get('/transactions')
    ]).then(([accRes, txRes]) => {
      setAccounts(accRes.data.accounts || [])
      setTransactions(txRes.data.transactions || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12 text-slate-400">Carregando...</div>

  const mainAccount = accounts[0] || conta
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700/50 shadow-xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-slate-400">Conta Corrente</p>
            <p className="text-lg font-mono font-semibold mt-1 text-white">
              {mainAccount ? `Ag. ${mainAccount.agency}  Cc. ${mainAccount.number}` : '-'}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-400">Saldo disponível</p>
        <p className="text-3xl font-bold mt-1 text-amber-400">
          R$ {totalBalance.toLocaleString('pt-BR')}
        </p>
      </div>

      {accounts.length > 1 && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Minhas Contas</h3>
          <div className="space-y-2">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
                <span className="font-mono text-sm text-slate-300">Ag. {acc.agency}  Cc. {acc.number}</span>
                <span className="font-semibold text-amber-400">R$ {(acc.balance || 0).toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/app/transferir" className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl hover:border-amber-500/30 transition flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition">
            <span className="text-xl font-bold text-amber-400">P</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">PIX</h3>
            <p className="text-sm text-slate-400">Transferência instantânea</p>
          </div>
        </Link>
        <Link to="/app/transferir" className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl hover:border-amber-500/30 transition flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition">
            <span className="text-xl font-bold text-amber-400">T</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">TED/DOC</h3>
            <p className="text-sm text-slate-400">Transferência entre bancos</p>
          </div>
        </Link>
        <Link to="/app/extrato" className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl hover:border-amber-500/30 transition flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition">
            <span className="text-xl font-bold text-amber-400">E</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">Extrato</h3>
            <p className="text-sm text-slate-400">Histórico de transações</p>
          </div>
        </Link>
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <h3 className="p-4 font-semibold text-white border-b border-slate-700/50">Últimas Transações</h3>
        <div className="divide-y divide-slate-700/50">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.uuid} className="p-4 flex justify-between items-center hover:bg-slate-800/30 transition">
              <div>
                <p className="font-medium text-white">{tx.type?.toUpperCase()}</p>
                <p className="text-sm text-slate-400">{tx.observacao || 'Sem observação'}</p>
              </div>
              <p className={`font-semibold ${tx.amount > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                R$ {Math.abs(tx.amount).toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="p-8 text-center text-slate-500">Nenhuma transação recente</p>
          )}
        </div>
      </div>
    </div>
  )
}
