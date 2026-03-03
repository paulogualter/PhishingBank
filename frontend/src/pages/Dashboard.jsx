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

  if (loading) return <div className="text-center py-12">Carregando...</div>

  const mainAccount = accounts[0] || conta
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-2xl shadow-xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm opacity-90">Conta Corrente</p>
            <p className="text-lg font-mono font-semibold mt-1">
              {mainAccount ? `Ag. ${mainAccount.agency}  Cc. ${mainAccount.number}` : '-'}
            </p>
          </div>
        </div>
        <p className="text-sm opacity-80">Saldo disponível</p>
        <p className="text-3xl font-bold mt-1">
          R$ {totalBalance.toLocaleString('pt-BR')}
        </p>
      </div>

      {accounts.length > 1 && (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Minhas Contas</h3>
          <div className="space-y-2">
            {accounts.map((acc) => (
              <div key={acc.id} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="font-mono text-sm">Ag. {acc.agency}  Cc. {acc.number}</span>
                <span className="font-semibold">R$ {(acc.balance || 0).toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/transferir" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-secondary">P</span>
          </div>
          <div>
            <h3 className="font-semibold text-primary">PIX</h3>
            <p className="text-sm text-gray-500">Transferência instantânea</p>
          </div>
        </Link>
        <Link to="/transferir" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">T</span>
          </div>
          <div>
            <h3 className="font-semibold text-primary">TED/DOC</h3>
            <p className="text-sm text-gray-500">Transferência entre bancos</p>
          </div>
        </Link>
        <Link to="/extrato" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <span className="text-xl font-bold text-secondary">E</span>
          </div>
          <div>
            <h3 className="font-semibold text-primary">Extrato</h3>
            <p className="text-sm text-gray-500">Histórico de transações</p>
          </div>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <h3 className="p-4 font-semibold text-primary border-b">Últimas Transações</h3>
        <div className="divide-y">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.uuid} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{tx.type?.toUpperCase()}</p>
                <p className="text-sm text-gray-500">{tx.observacao || 'Sem observação'}</p>
              </div>
              <p className={`font-semibold ${tx.amount > 0 ? 'text-secondary' : 'text-red-600'}`}>
                R$ {Math.abs(tx.amount).toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
          {transactions.length === 0 && (
            <p className="p-8 text-center text-gray-500">Nenhuma transação recente</p>
          )}
        </div>
      </div>
    </div>
  )
}
