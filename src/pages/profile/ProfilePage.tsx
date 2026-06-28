import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../hooks/useLocale'
import { partnerApi } from '../../lib/api'
import { Card, Alert, FormField } from '../../components/ui'
import { LOCALES, Locale } from '../../lib/i18n'
import { User, Globe, LogOut, Star, Loader2, CheckCircle } from 'lucide-react'
import clsx from 'clsx'

export default function ProfilePage() {
  const { user, partner, logout, refreshPartner } = useAuth()
  const { t, locale, changeLocale } = useLocale()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: partner?.name || '',
    website: partner?.website || '',
  })
  const [showLogout, setShowLogout] = useState(false)

  const handleSave = async () => {
    if (!partner?.id) return
    setSaving(true); setError(''); setSuccess(false)
    try {
      await partnerApi.update(partner.id, { name: form.name, website: form.website })
      setSuccess(true); setEditing(false)
      refreshPartner()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save. Please try again.')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl">
            {partner?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'P'}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">{partner?.name || 'Partner'}</h1>
            {partner?.isFoundingPartner && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                <Star size={10} className="fill-amber-500 text-amber-500" /> Founding
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">{partner?.type} · {partner?.countryCode}</p>
        </div>
      </div>

      {success && <Alert type="success" message={t('profileUpdated')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Partner info — editable */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User size={15} className="text-navy-700" />
            <p className="text-sm font-semibold text-gray-900">{t('profileSettings')}</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="text-xs text-teal-600 hover:text-teal-700 font-medium">
              Edit
            </button>
          ) : (
            <button onClick={() => { setEditing(false); setError('') }} className="text-xs text-gray-500 hover:text-gray-700">
              Cancel
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <FormField label={t('name')} required>
              <input className="input" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Partner name" />
            </FormField>
            <FormField label={t('website')} hint="Your website or social media URL">
              <input className="input" value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://yourwebsite.com" />
            </FormField>
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setEditing(false); setError('') }} className="btn-secondary flex-1">
                {t('cancel')}
              </button>
              <button onClick={handleSave} disabled={saving || !form.name} className="btn-primary flex-1">
                {saving ? <><Loader2 size={13} className="animate-spin" /> {t('saving')}</> : t('save')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { label: t('name'), value: partner?.name || '—' },
              { label: t('partnerType'), value: partner?.type || '—' },
              { label: t('country'), value: partner?.countryCode || '—' },
              { label: t('website'), value: partner?.website || '—' },
              { label: 'Referral Code', value: partner?.referralCode || `FORSA-${partner?.id?.slice(0,6).toUpperCase()}` },
              { label: 'Status', value: partner?.status || 'active' },
            ].map(item => (
              <div key={item.label} className="flex gap-3 py-1.5 border-b border-gray-50 last:border-0">
                <dt className="text-xs text-gray-400 w-28 flex-shrink-0 pt-0.5">{item.label}</dt>
                <dd className="text-sm text-gray-700 capitalize">{item.value}</dd>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* FORSA Score / Founding status */}
      {partner?.isFoundingPartner && (
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center">
              <Star size={20} className="text-amber-600 fill-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Founding Partner</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You receive preferential commission rates and featured placement as a FORSA founding partner.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Language */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={15} className="text-navy-700" />
          <p className="text-sm font-semibold text-gray-900">Language</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LOCALES.map(l => (
            <button key={l.code} onClick={() => changeLocale(l.code as Locale)}
              className={clsx('py-3 rounded-xl border text-sm font-medium transition-all text-center',
                locale === l.code ? 'border-navy-800 bg-navy-800 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300')}>
              {l.label === 'ع' ? '🇹🇳 العربية' : l.label === 'EN' ? '🇬🇧 English' : '🇫🇷 Français'}
            </button>
          ))}
        </div>
      </Card>

      {/* Account */}
      <Card>
        <p className="text-xs text-gray-400 mb-3">Account</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-gray-700">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Partner ID</span><span className="text-gray-400 font-mono text-xs">{partner?.id?.slice(0,8)}…</span></div>
        </div>
      </Card>

      {/* Sign out */}
      {!showLogout ? (
        <button onClick={() => setShowLogout(true)}
          className="w-full p-4 flex items-center justify-center gap-2 text-red-600 text-sm font-medium border border-red-100 rounded-2xl hover:bg-red-50 transition-colors">
          <LogOut size={16} /> {t('signOut')}
        </button>
      ) : (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-800 mb-3">Are you sure you want to sign out?</p>
          <div className="flex gap-3">
            <button onClick={() => setShowLogout(false)} className="btn-secondary flex-1 text-sm">{t('cancel')}</button>
            <button onClick={logout} className="flex-1 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors">
              {t('signOut')}
            </button>
          </div>
        </Card>
      )}

      <p className="text-center text-xs text-gray-300 pb-2">FORSA OS v1 · Partner Portal</p>
    </div>
  )
}
