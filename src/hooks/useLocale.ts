import { useState, useEffect } from 'react'
import { getLocale, setLocale, t, Locale } from '../lib/i18n'

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(getLocale())
  useEffect(() => {
    const h = () => setLocaleState(getLocale())
    window.addEventListener('localechange', h)
    return () => window.removeEventListener('localechange', h)
  }, [])
  const changeLocale = (l: Locale) => { setLocale(l); setLocaleState(l) }
  return { locale, changeLocale, t }
}
