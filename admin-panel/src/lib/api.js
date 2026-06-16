import axios from 'axios'

export const TOKEN_KEY = 'kesif_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
})



api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/** @param {unknown} error */
export function getErrorMessage(error, varsayilan = 'Bir hata oluştu') {
  const msg = error?.response?.data?.error
  if (typeof msg === 'string' && msg.trim()) return msg
  if (error?.message === 'Network Error') {
    return 'Sunucuya bağlanılamadı. Bağlantınızı kontrol edin.'
  }
  return varsayilan
}

export { api }
