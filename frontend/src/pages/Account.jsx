import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function Account() {
  const [accounts, setAccounts] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ nome: '', email: '', telefone: '' })
  const [saving, setSaving] = useState(false)
  const conta = useAuthStore((s) => s.user?.conta)

  const loadData = () => {
    Promise.all([
      api.get('/accounts'),
      api.get('/user/profile').catch(() => ({}))
    ]).then(([accRes, profileRes]) => {
      setAccounts(accRes.data.accounts || [])
      const p = profileRes.data
      setProfile(p)
      if (p) setEditForm({ nome: p.nome || '', email: p.email || '', telefone: p.telefone || '' })
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { loadData() }, [])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.patch('/user/profile', editForm, { skipToast: true })
      setProfile(data)
      setEditing(false)
      toast.success('Perfil atualizado com sucesso!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-slate-400">Carregando...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="bg-slate-800 p-6 border-b border-slate-700/50">
          <h2 className="text-xl font-semibold text-white">Dados da Conta</h2>
          <p className="text-sm text-slate-400 mt-1">Phishing Bank - Conta Corrente</p>
        </div>
        <div className="p-6 space-y-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="border border-slate-700/50 rounded-lg p-4 bg-slate-900/30">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Agência</p>
                  <p className="font-mono font-semibold text-white">{acc.agency}</p>
                </div>
                <div>
                  <p className="text-slate-500">Conta Corrente</p>
                  <p className="font-mono font-semibold text-white">{acc.number}</p>
                </div>
                <div>
                  <p className="text-slate-500">Tipo</p>
                  <p className="font-medium capitalize text-slate-300">{acc.account_type || 'Corrente'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Saldo</p>
                  <p className="font-semibold text-amber-400">R$ {(acc.balance || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-slate-500">Limite PIX</p>
                  <p className="font-medium text-slate-300">R$ {(acc.pix_limit || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {profile && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-white">Titular</h3>
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm text-amber-400 hover:text-amber-300 transition"
              >
                Editar
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm text-slate-400 hover:text-slate-300 transition"
              >
                Cancelar
              </button>
            )}
          </div>
          {editing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm((f) => ({ ...f, nome: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Telefone</label>
                <input
                  type="text"
                  value={editForm.telefone}
                  onChange={(e) => setEditForm((f) => ({ ...f, telefone: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <p className="text-xs text-slate-500">CPF não pode ser alterado</p>
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          ) : (
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-500">Nome:</span> <span className="text-slate-300">{profile.nome}</span></p>
              <p><span className="text-slate-500">CPF:</span> <span className="text-slate-300">{profile.cpf}</span></p>
              <p><span className="text-slate-500">Email:</span> <span className="text-slate-300">{profile.email}</span></p>
              {profile.telefone && <p><span className="text-slate-500">Telefone:</span> <span className="text-slate-300">{profile.telefone}</span></p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
