import axios from 'axios'

const TENANT_ID = 'be694fc0-789a-4dec-b514-850710469c72'
const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || '') + '/api/v1', headers: { 'Content-Type': 'application/json' } })

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
      const res = await axios.post('/api/v1/auth/refresh', { refreshToken: refresh })
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
  update: (id: string, data: any) => api.patch ? api.patch(`/partners/${id}`, data) : api.post(`/partners/${id}`, data),
  getDashboard: (id: string) => api.get(`/partners/${id}/dashboard`),
  getCommissions: () => api.get('/partners/commissions'),
}

export const applicationsApi = {
  list: (params?: any) => api.get('/applications', { params }),
}
