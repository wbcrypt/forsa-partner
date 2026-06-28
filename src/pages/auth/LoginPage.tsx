import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../hooks/useLocale'
import { LOCALES, Locale } from '../../lib/i18n'
import { Alert } from '../../components/ui'
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const { t, locale, changeLocale } = useLocale()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password'); return }
    setLoading(true); setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(msg === 'Invalid credentials' ? 'Incorrect email or password. Please try again.' : msg || 'Login failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-white font-semibold text-sm">FORSA</span>
        </div>
        <div className="flex gap-0.5 bg-white/10 rounded-lg p-0.5">
          {LOCALES.map(l => (
            <button key={l.code} onClick={() => changeLocale(l.code)}
              className={`px-2.5 py-1.5 text-xs rounded-md font-medium transition-all ${locale === l.code ? 'bg-white text-navy-900' : 'text-white/60 hover:text-white'}`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-teal-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-teal-500/20">
              <span className="text-white font-bold text-3xl">F</span>
            </div>
            <h1 className="text-white text-2xl font-bold">{t('welcomeBack')}</h1>
            <p className="text-white/50 text-sm mt-1">{t('loginSubtitle')}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-modal p-6">
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="label">{t('emailAddr')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="input" placeholder="you@partner.com" autoFocus autoComplete="email" />
              </div>
              <div>
                <label className="label">{t('password')}</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input pr-11" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
                {loading ? <><Loader2 size={15} className="animate-spin" /> {t('loading')}</> : t('signIn')}
              </button>
            </form>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5">
            <Shield size={11} className="text-white/25" />
            <p className="text-white/25 text-xs">{t('partnerPortal')} · FORSA OS v1</p>
          </div>
        </div>
      </div>
    </div>
  )
}
