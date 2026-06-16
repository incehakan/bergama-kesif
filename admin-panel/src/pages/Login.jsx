import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { api, TOKEN_KEY, getErrorMessage } from '../lib/api.js'

const DEFAULT_BELEDIYE_SLUG = 'bergama'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sifre, setSifre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (localStorage.getItem(TOKEN_KEY)) {
    return <Navigate to="/dashboard" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/api/auth/login', {
        email: email.trim(),
        sifre,
        belediyeSlug: DEFAULT_BELEDIYE_SLUG,
      })
      if (data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token)
        navigate('/dashboard', { replace: true })
      } else {
        setError('Sunucu geçerli bir oturum döndürmedi.')
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Giriş başarısız. Bilgilerinizi kontrol edin.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-center text-2xl font-bold text-slate-900">Yönetim Paneli</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Hesabınızla giriş yapın</p>

        {error && (
          <div
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none ring-red-800 focus:border-red-800 focus:ring-2 focus:ring-red-800/20"
            />
          </div>
          <div>
            <label htmlFor="sifre" className="mb-1 block text-sm font-medium text-slate-700">
              Şifre
            </label>
            <input
              id="sifre"
              type="password"
              autoComplete="current-password"
              required
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-800/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-red-900 py-2.5 text-sm font-semibold text-white transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  )
}
