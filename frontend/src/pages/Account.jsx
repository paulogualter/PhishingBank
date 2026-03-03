import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Account() {
  const [accounts, setAccounts] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const conta = useAuthStore((s) => s.user?.conta)

  useEffect(() => {
    Promise.all([
      api.get('/accounts'),
      api.get('/user/profile').catch(() => ({}))
    ]).then(([accRes, profileRes]) => {
      setAccounts(accRes.data.accounts || [])
      setProfile(profileRes.data)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-12">Carregando...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-primary text-white p-6">
          <h2 className="text-xl font-semibold">Dados da Conta</h2>
          <p className="text-sm opacity-90 mt-1">Phishing Bank - Conta Corrente</p>
        </div>
        <div className="p-6 space-y-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Agência</p>
                  <p className="font-mono font-semibold">{acc.agency}</p>
                </div>
                <div>
                  <p className="text-gray-500">Conta Corrente</p>
                  <p className="font-mono font-semibold">{acc.number}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tipo</p>
                  <p className="font-medium capitalize">{acc.account_type || 'Corrente'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Saldo</p>
                  <p className="font-semibold text-primary">R$ {(acc.balance || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Limite PIX</p>
                  <p className="font-medium">R$ {(acc.pix_limit || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {profile && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="font-semibold text-primary mb-4">Titular</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Nome:</span> {profile.nome}</p>
            <p><span className="text-gray-500">CPF:</span> {profile.cpf}</p>
            <p><span className="text-gray-500">Email:</span> {profile.email}</p>
          </div>
        </div>
      )}
    </div>
  )
}
