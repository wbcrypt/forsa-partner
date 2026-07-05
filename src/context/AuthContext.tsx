import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi, partnerApi } from '../lib/api'

interface PartnerUser {
  id: string; email: string; tenantId: string; permissions: string[]
}

interface Partner {
  id: string; name: string; type: string; countryCode: string
  website?: string; referralCode?: string; status: string
  totalReferrals?: number; isFoundingPartner?: boolean
}

interface AuthCtx {
  user: PartnerUser | null
  partner: Partner | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshPartner: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PartnerUser | null>(null)
  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)

  // T-103 — was: fall back to listing ALL partners and taking partners[0]
  // as "this user's partner" whenever no partner_id was cached yet (e.g. a
  // brand-new partner's very first login). That could attach a partner to
  // an arbitrary, unrelated partner's data — the single highest-severity
  // frontend bug found across the platform (see
  // forsa-os/implementation/KNOWN_ISSUES.md K-03). Now resolves the
  // caller's own partner record entirely server-side via GET /partners/me,
  // which looks it up from the JWT identity (partners.user_id) — there is
  // no client-supplied id or list index involved at all anymore.
  const loadPartner = useCallback(async () => {
    try {
      const res = await partnerApi.me()
      setPartner(res.data)
    } catch { /* no partner account linked to this user yet */ }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('partner_token')
    if (token) {
      authApi.me()
        .then(async r => {
          setUser(r.data)
          await loadPartner()
        })
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false))
    } else setLoading(false)
  }, [loadPartner])

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password)
    localStorage.setItem('partner_token', res.data.accessToken)
    localStorage.setItem('partner_refresh', res.data.refreshToken)
    const me = await authApi.me()
    setUser(me.data)
    await loadPartner()
  }, [loadPartner])

  const logout = useCallback(() => {
    authApi.logout().catch(() => {})
    localStorage.clear()
    setUser(null); setPartner(null)
    window.location.href = '/login'
  }, [])

  const refreshPartner = useCallback(() => {
    if (user) loadPartner()
  }, [user, loadPartner])

  return (
    <AuthContext.Provider value={{ user, partner, loading, login, logout, refreshPartner }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
