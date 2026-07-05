import axios from 'axios'

const TENANT_ID = 'be694fc0-789a-4dec-b514-850710469c72'
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
  update: (id: string, data: any) => api.patch ? api.patch(`/partners/${id}`, data) : api.post(`/partners/${id}`, data),
  getDashboard: (id: string) => api.get(`/partners/${id}/dashboard`),
  getCommissions: () => api.get('/partners/commissions'),
}

export const applicationsApi = {
  list: (params?: any) => api.get('/applications', { params }),
}
