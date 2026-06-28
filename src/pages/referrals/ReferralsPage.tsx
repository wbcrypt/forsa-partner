import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../hooks/useLocale'
import { Card } from '../../components/ui'
import { Copy, Check, ExternalLink, Smartphone, Share2, HelpCircle } from 'lucide-react'

// Generate QR code as SVG using a simple QR-like grid (visual placeholder)
// In production you'd use a QR library; here we render a stylized code
function QRDisplay({ value, size = 160 }: { value: string; size?: number }) {
  // Use Google Charts API to generate real QR
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=1B2A5E&bgcolor=f0f4ff`
  return (
    <div className="inline-flex items-center justify-center p-4 bg-navy-50 rounded-2xl">
      <img src={url} alt="QR Code" width={size} height={size} className="rounded-xl"
        onError={e => {
          // Fallback if API unavailable
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:#f0f4ff;border-radius:12px;font-size:11px;color:#1B2A5E;text-align:center;padding:12px">QR Code<br/>(Requires internet)</div>`
          }
        }} />
    </div>
  )
}

export default function ReferralsPage() {
  const { partner } = useAuth()
  const { t } = useLocale()
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  const referralCode = partner?.referralCode || `FORSA-${partner?.id?.slice(0, 6).toUpperCase() || 'XXXXX'}`
  const referralLink = `https://apply.forsa.tn?ref=${referralCode}`

  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setter(true)
      setTimeout(() => setter(false), 2000)
    }).catch(() => {
      // Fallback
      const el = document.createElement('textarea')
      el.value = text; document.body.appendChild(el); el.select()
      document.execCommand('copy'); document.body.removeChild(el)
      setter(true); setTimeout(() => setter(false), 2000)
    })
  }

  const shareWhatsApp = () => {
    const msg = `Apply for FORSA educational financing with my referral link: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const STEPS = [
    { icon: '🔗', key: 'step1' },
    { icon: '📝', key: 'step2' },
    { icon: '✅', key: 'step3' },
    { icon: '💰', key: 'step4' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('referrals')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Share your link and track your referrals</p>
      </div>

      {/* Referral Link */}
      <Card>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('referralLink')}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 font-mono text-xs text-gray-700 truncate">
            {referralLink}
          </div>
          <button onClick={() => copy(referralLink, setCopiedLink)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              copiedLink ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-navy-800 text-white hover:bg-navy-900'
            }`}>
            {copiedLink ? <><Check size={14} /> {t('copied')}</> : <><Copy size={14} /> {t('copyLink')}</>}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2 mt-3">
          <button onClick={shareWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white text-sm font-medium rounded-xl hover:bg-[#1db954] transition-colors active:scale-95">
            <span className="text-base">📱</span> {t('shareWhatsApp')}
          </button>
          <button onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Apply with FORSA', text: 'Apply for financing', url: referralLink })
              } else copy(referralLink, setCopiedLink)
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors active:scale-95">
            <Share2 size={15} /> Share
          </button>
        </div>
      </Card>

      {/* Referral Code */}
      <Card>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('referralCode')}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gradient-to-br from-navy-800 to-navy-900 rounded-2xl p-4 text-center">
            <p className="text-white text-2xl font-bold tracking-widest font-mono">{referralCode}</p>
            <p className="text-white/50 text-xs mt-1">Your unique partner code</p>
          </div>
          <button onClick={() => copy(referralCode, setCopiedCode)}
            className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-xs font-medium transition-all ${
              copiedCode ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {copiedCode ? <Check size={16} /> : <Copy size={16} />}
            {copiedCode ? 'Copied' : 'Copy'}
          </button>
        </div>
      </Card>

      {/* QR Code */}
      <Card>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('qrCode')}</p>
        <div className="flex flex-col items-center gap-3">
          <QRDisplay value={referralLink} size={180} />
          <p className="text-xs text-gray-400 text-center flex items-center gap-1">
            <Smartphone size={12} /> {t('scanToApply')}
          </p>
          <button onClick={() => {
            const link = document.createElement('a')
            link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(referralLink)}&color=1B2A5E`
            link.download = `forsa-qr-${referralCode}.png`
            link.click()
          }} className="btn-secondary text-xs py-2">
            <ExternalLink size={12} /> Download QR Code
          </button>
        </div>
      </Card>

      {/* How it works */}
      <Card>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-1">
          <HelpCircle size={12} /> {t('howItWorks')}
        </p>
        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-navy-50 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                  {step.icon}
                </div>
                {i < STEPS.length - 1 && <div className="w-px h-4 bg-gray-100 mt-1" />}
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-800">{t(step.key)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
