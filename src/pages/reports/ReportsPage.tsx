import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../hooks/useLocale'
import { partnerApi, applicationsApi } from '../../lib/api'
import { Card, StatCard, Spinner } from '../../components/ui'
import { Download, FileText, TrendingUp, Users, DollarSign, Calendar } from 'lucide-react'
import { format, startOfMonth, isAfter } from 'date-fns'

export default function ReportsPage() {
  const { partner } = useAuth()
  const { t } = useLocale()

  const { data: appsData, isLoading } = useQuery({
    queryKey: ['partner-all-apps', partner?.id],
    queryFn: () => applicationsApi.list({ partnerId: partner!.id, limit: 200 }).then(r => r.data),
    enabled: !!partner?.id,
  })

  const { data: commissionsData } = useQuery({
    queryKey: ['commissions', partner?.id],
    queryFn: () => partnerApi.getCommissions().then(r => r.data),
    enabled: !!partner?.id,
  })

  const apps = appsData?.data || []
  const commissions = Array.isArray(commissionsData) ? commissionsData : (commissionsData?.data || [])

  // Monthly stats
  const monthStart = startOfMonth(new Date())
  const thisMonthApps = apps.filter((a: any) => a.lead_date && isAfter(new Date(a.lead_date), monthStart))
  const thisMonthApproved = thisMonthApps.filter((a: any) =>
    ['approved_level1','approved_level2','approved_level3','active_student','completed'].includes(a.current_status)
  )
  const thisMonthComm = commissions
    .filter((c: any) => c.created_at && isAfter(new Date(c.created_at), monthStart))
    .reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0)

  // All-time
  const totalApproved = apps.filter((a: any) =>
    ['approved_level1','approved_level2','approved_level3','active_student','completed'].includes(a.current_status)
  ).length
  const convRate = apps.length > 0 ? Math.round((totalApproved / apps.length) * 100) : 0
  const totalComm = commissions.reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0)
  const paidComm = commissions.filter((c: any) => c.status === 'paid').reduce((s: number, c: any) => s + parseFloat(c.amount || '0'), 0)

  // By university breakdown
  const byUni: Record<string, { count: number; approved: number }> = {}
  apps.forEach((a: any) => {
    const uni = a.university_name || 'Unknown'
    if (!byUni[uni]) byUni[uni] = { count: 0, approved: 0 }
    byUni[uni].count++
    if (['approved_level1','approved_level2','approved_level3','active_student','completed'].includes(a.current_status)) {
      byUni[uni].approved++
    }
  })
  const uniList = Object.entries(byUni).sort((a, b) => b[1].count - a[1].count)

  const exportCSV = () => {
    if (!apps.length) return
    const headers = ['Name', 'Email', 'University', 'Program', 'Status', 'Amount (TND)', 'Date']
    const rows = apps.map((a: any) => [
      `${a.first_name} ${a.last_name}`,
      a.email || '',
      a.university_name || '',
      a.program_name || '',
      a.current_status,
      parseFloat(a.tuition_amount || '0').toFixed(2),
      a.lead_date ? format(new Date(a.lead_date), 'yyyy-MM-dd') : '',
    ])
    const csv = [headers.join(','), ...rows.map((r: string[]) => r.map(v => `"${v}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `forsa-partner-report-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click()
  }

  const exportPDF = () => {
    const html = `<!DOCTYPE html>
<html><head><title>FORSA Partner Report</title>
<style>
body{font-family:Arial,sans-serif;font-size:12px;padding:24px;color:#222}
h1{color:#1B2A5E;font-size:20px;margin-bottom:4px}
.meta{color:#888;font-size:11px;margin-bottom:20px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px}
.stat{background:#f0f4ff;border-radius:12px;padding:12px}
.stat-val{font-size:22px;font-weight:700;color:#1B2A5E}
.stat-label{font-size:10px;color:#666;margin-top:2px}
table{width:100%;border-collapse:collapse}
th{background:#1B2A5E;color:#fff;padding:8px 10px;text-align:left;font-size:11px}
td{padding:7px 10px;border-bottom:1px solid #eee;font-size:11px}
tr:nth-child(even) td{background:#f9f9f9}
.footer{margin-top:20px;color:#ccc;font-size:10px;text-align:center}
</style></head><body>
<h1>FORSA Partner Report — ${partner?.name}</h1>
<p class="meta">Generated: ${format(new Date(), 'dd MMMM yyyy · HH:mm')} | Code: ${partner?.referralCode || 'N/A'}</p>
<div class="stats">
<div class="stat"><div class="stat-val">${apps.length}</div><div class="stat-label">Total Referrals</div></div>
<div class="stat"><div class="stat-val">${totalApproved}</div><div class="stat-label">Approved</div></div>
<div class="stat"><div class="stat-val">${convRate}%</div><div class="stat-label">Conversion Rate</div></div>
<div class="stat"><div class="stat-val">${totalComm.toLocaleString()} TND</div><div class="stat-label">Total Commissions</div></div>
<div class="stat"><div class="stat-val">${paidComm.toLocaleString()} TND</div><div class="stat-label">Paid Commissions</div></div>
<div class="stat"><div class="stat-val">${(totalComm - paidComm).toLocaleString()} TND</div><div class="stat-label">Pending</div></div>
</div>
<table>
<thead><tr><th>#</th><th>Student</th><th>University</th><th>Program</th><th>Status</th><th>Amount</th><th>Date</th></tr></thead>
<tbody>
${apps.map((a: any, i: number) => `<tr>
<td>${i + 1}</td>
<td><strong>${a.first_name} ${a.last_name}</strong></td>
<td>${a.university_name || '—'}</td>
<td>${a.program_name || '—'}</td>
<td>${a.current_status.replace(/_/g, ' ')}</td>
<td>${parseFloat(a.tuition_amount || '0').toLocaleString()} TND</td>
<td>${a.lead_date ? format(new Date(a.lead_date), 'dd MMM yyyy') : '—'}</td>
</tr>`).join('')}
</tbody></table>
<p class="footer">Confidential · FORSA Educational Financing · forsa.tn</p>
</body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600) }
  }

  if (isLoading) return <Spinner className="h-64" />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('reports')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-secondary text-xs py-2">
            <Download size={12} /> CSV
          </button>
          <button onClick={exportPDF} className="btn-secondary text-xs py-2">
            <FileText size={12} /> PDF
          </button>
        </div>
      </div>

      {/* This month */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={15} className="text-navy-700" />
          <p className="text-sm font-semibold text-gray-900">{t('monthlyReport')}</p>
          <span className="text-xs text-gray-400">— {format(new Date(), 'MMMM yyyy')}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-navy-50 rounded-xl">
            <p className="text-xl font-bold text-navy-800">{thisMonthApps.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('referralsMonth')}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-xl font-bold text-green-700">{thisMonthApproved.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('approvedMonth')}</p>
          </div>
          <div className="text-center p-3 bg-teal-50 rounded-xl">
            <p className="text-xl font-bold text-teal-700">{thisMonthComm.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{t('commMonth')} (TND)</p>
          </div>
        </div>
      </Card>

      {/* All-time stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Referrals" value={apps.length} icon={Users} color="navy" />
        <StatCard label={t('convRate')} value={`${convRate}%`} icon={TrendingUp} color="teal" />
        <StatCard label="Total Commissions" value={`${totalComm.toLocaleString()} TND`} icon={DollarSign} color="green" />
        <StatCard label="Paid" value={`${paidComm.toLocaleString()} TND`} icon={TrendingUp} color="green" sub="Received" />
      </div>

      {/* By university */}
      {uniList.length > 0 && (
        <Card>
          <p className="text-sm font-semibold text-gray-900 mb-4">Referrals by University</p>
          <div className="space-y-3">
            {uniList.map(([uni, stats]) => {
              const pct = stats.count > 0 ? (stats.approved / stats.count) * 100 : 0
              return (
                <div key={uni}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-700 truncate flex-1">{uni}</p>
                    <div className="flex gap-3 text-xs text-gray-500 ms-3 flex-shrink-0">
                      <span>{stats.count} referred</span>
                      <span className="text-green-600 font-medium">{stats.approved} approved</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
