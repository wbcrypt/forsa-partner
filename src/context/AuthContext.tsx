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

  const loadPartner = useCallback(async (userId: string) => {
    try {
      // Find the partner associated with this user
      const savedPartnerId = localStorage.getItem('partner_id')
      if (savedPartnerId) {
        const res = await partnerApi.get(savedPartnerId)
        setPartner(res.data)
      } else {
        // Try to find by listing and matching
        const res = await partnerApi.list({ limit: 100 })
        const partners = res.data?.data || []
        if (partners.length > 0) {
          setPartner(partners[0])
          localStorage.setItem('partner_id', partners[0].id)
        }
      }
    } catch { /* partner not found */ }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('partner_token')
    if (token) {
      authApi.me()
        .then(async r => {
          setUser(r.data)
          await loadPartner(r.data.id)
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
    await loadPartner(me.data.id)
  }, [loadPartner])

  const logout = useCallback(() => {
    authApi.logout().catch(() => {})
    localStorage.clear()
    setUser(null); setPartner(null)
    window.location.href = '/login'
  }, [])

  const refreshPartner = useCallback(() => {
    if (user) loadPartner(user.id)
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
