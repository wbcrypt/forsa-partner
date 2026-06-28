import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../hooks/useLocale'
import { partnerApi } from '../../lib/api'
import { Card, Badge, StatCard, Tabs, Spinner, EmptyState, ErrorState } from '../../components/ui'
import { DollarSign, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'

export default function CommissionsPage() {
  const { partner } = useAuth()
  const { t } = useLocale()
  const [tab, setTab] = useState('all')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['commissions', partner?.id],
    queryFn: () => partnerApi.getCommissions().then(r => r.data),
    enabled: !!partner?.id,
  })

  const all = Array.isArray(data) ? data : (data?.data || [])
  const pending = all.filter((c: any) => c.status === 'pending')
  const approved = all.filter((c: any) => c.status === 'approved')
  const paid = all.filter((c: any) => c.status === 'paid')

  const totalPaid = paid.reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0)
  const totalPending = [...pending, ...approved].reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0)

  const displayList = tab === 'all' ? all : tab === 'pending' ? [...pending, ...approved] : paid

  if (isLoading) return <Spinner className="h-64" />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">{t('commissions')}</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t('paidComm')} value={`${totalPaid.toLocaleString()} TND`} icon={TrendingUp} color="green" />
        <StatCard label={t('estimatedComm')} value={`${totalPending.toLocaleString()} TND`} icon={Clock} color="amber" />
        <StatCard label="Total Records" value={all.length} icon={DollarSign} color="navy" />
        <StatCard label="Paid Records" value={paid.length} icon={CheckCircle} color="teal" />
      </div>

      {/* Commission list */}
      <Card padding={false}>
        <Tabs
          tabs={[
            { id: 'all', label: 'All', count: all.length },
            { id: 'pending', label: t('commPending'), count: pending.length + approved.length },
            { id: 'paid', label: t('commPaid'), count: paid.length },
          ]}
          active={tab}
          onChange={setTab}
        />

        <div className="p-4">
          {displayList.length === 0 ? (
            <EmptyState icon={DollarSign} title={t('noComm')} description={t('noCommDesc')} />
          ) : (
            <div className="space-y-3">
              {displayList.map((c: any, i: number) => (
                <CommissionRow key={c.id || i} commission={c} />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function CommissionRow({ commission: c }: { commission: any }) {
  const amount = parseFloat(c.amount || '0')
  const isPaid = c.status === 'paid'

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
      isPaid ? 'bg-green-50/50 border-green-100' : 'bg-white border-gray-100'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isPaid ? 'bg-green-100' : c.status === 'approved' ? 'bg-blue-50' : 'bg-yellow-50'
      }`}>
        {isPaid ? <CheckCircle size={16} className="text-green-600" /> :
          c.status === 'approved' ? <CheckCircle size={16} className="text-blue-500" /> :
          <Clock size={16} className="text-yellow-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900">
            {c.student_first_name} {c.student_last_name}
          </p>
          <p className={`text-sm font-bold ${isPaid ? 'text-green-700' : 'text-gray-700'}`}>
            {amount.toLocaleString()} TND
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge status={c.status} label={c.status === 'pending' ? 'Pending' : c.status === 'approved' ? 'Approved' : 'Paid'} />
          {c.created_at && (
            <span className="text-xs text-gray-400">
              {format(new Date(c.created_at), 'dd MMM yyyy')}
            </span>
          )}
          {isPaid && c.paid_at && (
            <span className="text-xs text-green-600 font-medium">
              Paid {format(new Date(c.paid_at), 'dd MMM yyyy')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
