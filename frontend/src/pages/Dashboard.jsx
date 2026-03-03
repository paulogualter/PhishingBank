import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function Dashboard() {
  const [accounts, setAccounts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

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

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0)

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-secondary">
        <h2 className="text-gray-500 text-sm font-medium">Saldo Total</h2>
        <p className="text-3xl font-bold text-primary mt-1">
          R$ {totalBalance.toLocaleString('pt-BR')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/transferir" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
          <span className="text-3xl">📤</span>
          <div>
            <h3 className="font-semibold text-primary">PIX</h3>
            <p className="text-sm text-gray-500">Transferência instantânea</p>
          </div>
        </Link>
        <Link to="/transferir" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
          <span className="text-3xl">💸</span>
          <div>
            <h3 className="font-semibold text-primary">TED/DOC</h3>
            <p className="text-sm text-gray-500">Transferência entre bancos</p>
          </div>
        </Link>
        <Link to="/extrato" className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition flex items-center gap-4">
          <span className="text-3xl">📋</span>
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
