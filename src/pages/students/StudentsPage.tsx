import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../hooks/useLocale'
import { applicationsApi } from '../../lib/api'
import { Card, Badge, Spinner, EmptyState, ErrorState } from '../../components/ui'
import { Users, Search, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import clsx from 'clsx'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new_lead', label: 'New' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved_level2', label: 'Approved' },
  { value: 'active_student', label: 'Active' },
  { value: 'rejected', label: 'Rejected' },
]

export default function StudentsPage() {
  const { partner } = useAuth()
  const { t } = useLocale()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['partner-students', partner?.id, page, search, statusFilter],
    queryFn: () => applicationsApi.list({
      partnerId: partner!.id,
      page, limit: 20,
      search: search || undefined,
      status: statusFilter || undefined,
    }).then(r => r.data),
    enabled: !!partner?.id,
  })

  const apps = data?.data || []
  const meta = data?.meta || {}

  const filtered = apps.filter((a: any) => {
    if (search) {
      const q = search.toLowerCase()
      return (a.first_name + ' ' + a.last_name).toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
    }
    return true
  })

  if (isLoading) return <Spinner className="h-64" />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{t('myStudents')}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta.total || 0} students referred by you</p>
      </div>

      {/* Search + filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder={t('search')} value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="input ps-9 text-sm" />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1) }}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
              className={clsx('px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
                statusFilter === opt.value ? 'bg-navy-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300')}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {apps.length === 0 ? (
        <Card>
          <EmptyState icon={Users} title={t('noStudents')} description={t('noStudentsDesc')} />
        </Card>
      ) : (
        <div className="space-y-2">
          {apps.map((app: any) => (
            <Card key={app.id} className="hover:shadow-modal transition-all">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-navy-800 to-navy-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {app.first_name?.[0]}{app.last_name?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{app.first_name} {app.last_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{app.university_name || '—'}</p>
                    </div>
                    <Badge status={app.current_status} />
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">{app.program_name || 'No program'}</span>
                    {app.tuition_amount && (
                      <span className="text-xs font-medium text-gray-600">
                        {parseFloat(app.tuition_amount).toLocaleString()} TND
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {app.lead_date ? format(new Date(app.lead_date), 'dd MMM yy') : '—'}
                    </span>
                  </div>
                  {/* Enrollment status */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-gray-400">Enrollment:</span>
                    <span className={clsx('text-xs font-medium',
                      app.current_status === 'active_student' ? 'text-green-600' :
                      app.current_status === 'completed' ? 'text-teal-600' : 'text-gray-500')}>
                      {app.current_status === 'active_student' ? 'Enrolled' :
                       app.current_status === 'completed' ? 'Graduated' :
                       'Not yet enrolled'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary text-sm py-2 px-3 disabled:opacity-30">
            ←
          </button>
          <span className="text-sm text-gray-500">{page} / {meta.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages} className="btn-secondary text-sm py-2 px-3 disabled:opacity-30">
            →
          </button>
        </div>
      )}
    </div>
  )
}
