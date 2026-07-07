import axios from 'axios'

const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'be694fc0-789a-4dec-b514-850710469c72'
const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api/v1'
const api = axios.create({ baseURL: BASE_URL, headers: { 'Content-Type': 'application/json' } })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('partner_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = false
let queue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

api.interceptors.response.use(r => r, async (error) => {
  const req = error.config as any
  if (error.response?.status === 401 && !req._retry) {
    if (refreshing) return new Promise((resolve, reject) => queue.push({ resolve, reject }))
      .then(token => { req.headers.Authorization = `Bearer ${token}`; return api(req) })
    req._retry = true; refreshing = true
    const refresh = localStorage.getItem('partner_refresh')
    if (!refresh) { localStorage.clear(); window.location.href = '/login'; return Promise.reject(error) }
    try {
      // T-109/K-47 — was `axios.post('/api/v1/auth/refresh', ...)`: bare
      // `axios` has no configured baseURL, so this resolved as a relative
      // path against whatever origin the app happened to be running on
      // (with a redundant '/api/v1' prefix on top of that — the same
      // double-prefix class of bug as T-104), only working by coincidence
      // when frontend and API share an origin. Fixed to use the correct
      // full URL. Deliberately still a bare `axios` call, not `api.post` —
      // `api` has this exact response interceptor attached, so routing the
      // refresh call through it risks infinite recursion if the refresh
      // token itself is invalid/expired (a fresh 401 on the refresh call
      // would re-enter this same interceptor).
      const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh })
      const { accessToken, refreshToken: nr } = res.data
      localStorage.setItem('partner_token', accessToken)
      localStorage.setItem('partner_refresh', nr)
      queue.forEach(p => p.resolve(accessToken)); queue = []
      req.headers.Authorization = `Bearer ${accessToken}`; return api(req)
    } catch (err) {
      queue.forEach(p => p.reject(err)); queue = []
      localStorage.clear(); window.location.href = '/login'; return Promise.reject(err)
    } finally { refreshing = false }
  }
  return Promise.reject(error)
})

export default api
export { TENANT_ID }

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password, tenantId: TENANT_ID }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
}

export const partnerApi = {
  list: (params?: any) => api.get('/partners', { params }),
  get: (id: string) => api.get(`/partners/${id}`),
  // T-103 — resolves the caller's own partner record server-side from the
  // JWT identity (partners.user_id), never from a client-supplied id or a
  // list index. Real, working backend endpoint (forsa-os commit ca6cf80d).
  me: () => api.get('/partners/me'),
  // T-224 discovery — PATCH /partners/:id never existed (this always
  // 404'd, or fell back to POST which also has no matching route).
  // Self-scoped PATCH /partners/me updates only the caller's own record.
  update: (_id: string, data: { name?: string; website?: string }) => api.patch('/partners/me', data),
  // T-224 discovery — GET /partners/:id/dashboard requires the staff-only
  // partner.view permission, which no partner-portal account holds —
  // this 403'd unconditionally. Self-scoped GET /partners/me/dashboard
  // resolves the caller's own partner id server-side instead.
  getDashboard: (_id: string) => api.get('/partners/me/dashboard'),
  // T-224 discovery — GET /partners/commissions required the staff-only
  // partner.commission.approve permission (403 for any real partner
  // account) and, independent of that, never filtered by partner_id at
  // all — every partner's commissions across the tenant would have
  // leaked to any partner able to call it. Self-scoped and filtered.
  getCommissions: () => api.get('/partners/me/commissions'),
}

export const applicationsApi = {
  // T-224 discovery — this called GET /applications?partnerId=X, a
  // staff-only route whose recognized filters never included partnerId
  // at all (silently ignored) — either a 403 (no partner-portal account
  // holds application.view) or, if ever granted, every application
  // across the entire tenant leaking to any partner. Self-scoped
  // endpoint resolves the partner server-side via the JWT identity.
  list: (params?: any) => api.get('/partners/me/applications', { params }),
}
