import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../hooks/useLocale'
import { partnerApi, applicationsApi } from '../../lib/api'
import { StatCard, Card, Badge, Spinner, EmptyState } from '../../components/ui'
import { Users, CheckCircle, Clock, XCircle, DollarSign, TrendingUp, ChevronRight, Star } from 'lucide-react'
import { format, startOfMonth } from 'date-fns'

export default function DashboardPage() {
  const { partner } = useAuth()
  const { t } = useLocale()

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['partner-dashboard', partner?.id],
    queryFn: () => partnerApi.getDashboard(partner!.id).then(r => r.data),
    enabled: !!partner?.id,
  })

  const { data: appsData } = useQuery({
    queryKey: ['partner-apps', partner?.id],
    queryFn: () => applicationsApi.list({ partnerId: partner!.id, limit: 5 }).then(r => r.data),
    enabled: !!partner?.id,
  })

  const { data: commissionsData } = useQuery({
    queryKey: ['commissions'],
    queryFn: () => partnerApi.getCommissions().then(r => r.data),
    enabled: !!partner?.id,
  })

  const recentApps = appsData?.data || []
  const commissions = Array.isArray(commissionsData) ? commissionsData : (commissionsData?.data || [])

  // Compute KPIs from data
  const totalReferrals = dashboard?.total_referrals || recentApps.length || 0
  const approvedCount = dashboard?.approved || recentApps.filter((a: any) =>
    ['approved_level1','approved_level2','approved_level3','active_student','completed'].includes(a.current_status)
  ).length || 0
  const pendingCount = dashboard?.pending || recentApps.filter((a: any) =>
    ['new_lead','under_review','waiting_for_documents'].includes(a.current_status)
  ).length || 0
  const rejectedCount = dashboard?.rejected || recentApps.filter((a: any) => a.current_status === 'rejected').length || 0
  const paidComm = commissions.filter((c: any) => c.status === 'paid').reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0)
  const pendingComm = commissions.filter((c: any) => c.status !== 'paid').reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0)
  const convRate = totalReferrals > 0 ? Math.round((approvedCount / totalReferrals) * 100) : 0

  if (!partner) return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Users size={24} className="text-gray-400" />
      </div>
      <p className="text-gray-600 font-medium">No partner account found</p>
      <p className="text-gray-400 text-sm mt-1">Contact FORSA to link your partner account.</p>
    </div>
  )

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <p className="text-gray-500 text-sm">{t('welcomeBack')},</p>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
          {partner.isFoundingPartner && (
            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              <Star size={10} className="fill-amber-500 text-amber-500" /> Founding
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5 capitalize">{partner.type} Partner · {partner.countryCode}</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t('totalReferrals')} value={totalReferrals} icon={Users} color="navy" />
        <StatCard label={t('approved')} value={approvedCount} icon={CheckCircle} color="green" sub={`${convRate}% ${t('conversionRate').toLowerCase()}`} />
        <StatCard label={t('pending')} value={pendingCount} icon={Clock} color="amber" />
        <StatCard label={t('rejected')} value={rejectedCount} icon={XCircle} color="red" />
        <StatCard label={t('estimatedComm')} value={`${pendingComm.toLocaleString()} TND`} icon={DollarSign} color="teal" />
        <StatCard label={t('paidComm')} value={`${paidComm.toLocaleString()} TND`} icon={TrendingUp} color="green" />
      </div>

      {/* Conversion rate bar */}
      {totalReferrals > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">{t('conversionRate')}</p>
            <p className="text-lg font-bold text-teal-600">{convRate}%</p>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-700"
              style={{ width: `${convRate}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {approvedCount} approved out of {totalReferrals} total referrals
          </p>
        </Card>
      )}

      {/* Recent students */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent Students</h2>
          <Link to="/students" className="text-xs text-teal-600 font-medium flex items-center gap-1">
            View all <ChevronRight size={12} />
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <Card>
            <EmptyState icon={Users} title={t('noStudents')} description={t('noStudentsDesc')} />
          </Card>
        ) : (
          <Card padding={false}>
            {recentApps.map((app: any, i: number) => (
              <div key={app.id} className={`flex items-center justify-between px-4 py-3 ${i < recentApps.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-navy-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-navy-700">
                      {app.first_name?.[0]}{app.last_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.first_name} {app.last_name}</p>
                    <p className="text-xs text-gray-400">{app.university_name || '—'}</p>
                  </div>
                </div>
                <Badge status={app.current_status} />
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Referral link quick access */}
      <Link to="/referrals" className="card p-4 flex items-center gap-4 hover:shadow-modal transition-all">
        <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-lg">🔗</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{t('referralLink')}</p>
          <p className="text-xs text-gray-400 mt-0.5">Share your link · Code: {partner.referralCode || 'FORSA-' + partner.id?.slice(0,6).toUpperCase()}</p>
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </Link>
    </div>
  )
}
