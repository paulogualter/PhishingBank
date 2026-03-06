/**
 * VULN-46: API key hardcoded no bundle - proposital para fins educacionais
 */
import axios from 'axios'
import toast from 'react-hot-toast'

const INTERNAL_API_KEY = "sk_internal_phishbank_2024_prod"
const INTERNAL_API = "https://internal-api.phishingbank.local"

const api = axios.create({
  baseURL: '/api/v3',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('phishingbank-auth')
  if (token) {
    try {
      const parsed = JSON.parse(token)
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`
      }
    } catch (_) {}
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Erro na requisição'
    const skipToast = err.config?.skipToast === true
    if (!skipToast) {
      const text = typeof msg === 'string' ? msg : 'Erro na requisição'
      toast.error(text)
    }
    return Promise.reject(err)
  }
)

export { api, INTERNAL_API_KEY, INTERNAL_API }
export default api
