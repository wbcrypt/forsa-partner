import React from 'react'
import clsx from 'clsx'
import { AlertCircle, CheckCircle, X, Loader2, Info, ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  new_lead: { color: 'bg-gray-100 text-gray-600', label: 'New' },
  waiting_for_documents: { color: 'bg-yellow-50 text-yellow-700', label: 'Docs Needed' },
  under_review: { color: 'bg-purple-50 text-purple-700', label: 'Under Review' },
  approved_level1: { color: 'bg-green-50 text-green-700', label: 'Approved ✓' },
  approved_level2: { color: 'bg-emerald-50 text-emerald-700', label: 'Approved ✓' },
  approved_level3: { color: 'bg-teal-50 text-teal-700', label: 'Referred Out' },
  rejected: { color: 'bg-red-50 text-red-600', label: 'Not Approved' },
  on_hold: { color: 'bg-orange-50 text-orange-600', label: 'On Hold' },
  active_student: { color: 'bg-green-50 text-green-700', label: 'Active' },
  completed: { color: 'bg-gray-100 text-gray-600', label: 'Completed' },
  contract_sent: { color: 'bg-blue-50 text-blue-600', label: 'Contract Sent' },
  contract_signed: { color: 'bg-indigo-50 text-indigo-700', label: 'Signed' },
  pending: { color: 'bg-yellow-50 text-yellow-700', label: 'Pending' },
  approved: { color: 'bg-green-50 text-green-700', label: 'Approved' },
  paid: { color: 'bg-emerald-50 text-emerald-700', label: 'Paid' },
  active: { color: 'bg-green-50 text-green-700', label: 'Active' },
  inactive: { color: 'bg-gray-100 text-gray-500', label: 'Inactive' },
}

export function Badge({ status, label }: { status: string; label?: string }) {
  const s = STATUS_MAP[status] || { color: 'bg-gray-100 text-gray-600', label: status }
  return <span className={clsx('badge', s.color)}>{label || s.label}</span>
}

export function Card({ children, className, padding = true }: {
  children: React.ReactNode; className?: string; padding?: boolean
}) {
  return <div className={clsx('card', padding && 'p-5', className)}>{children}</div>
}

export function Alert({ type = 'info', message, onClose }: {
  type?: 'success' | 'error' | 'info' | 'warning'; message: string; onClose?: () => void
}) {
  const s = {
    success: { bg: 'bg-green-50 border-green-200 text-green-800', Icon: CheckCircle },
    error: { bg: 'bg-red-50 border-red-200 text-red-800', Icon: AlertCircle },
    warning: { bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', Icon: AlertCircle },
    info: { bg: 'bg-blue-50 border-blue-200 text-blue-800', Icon: Info },
  }[type]
  return (
    <div className={clsx('flex items-start gap-3 p-4 rounded-xl border text-sm mb-4', s.bg)}>
      <s.Icon size={15} className="flex-shrink-0 mt-0.5" />
      <span className="flex-1">{message}</span>
      {onClose && <button onClick={onClose}><X size={13} className="opacity-60 hover:opacity-100" /></button>}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <Loader2 size={22} className="text-navy-800 animate-spin" />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }: {
  icon?: React.ElementType; title: string; description?: string; action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      {Icon && (
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon size={24} className="text-gray-400" />
        </div>
      )}
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {description && <p className="text-xs text-gray-400 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={24} className="text-red-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">{message || 'Failed to load'}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary mt-4 text-xs">Try again</button>}
    </div>
  )
}

export function StatCard({ label, value, sub, color = 'navy', icon: Icon }: {
  label: string; value: string | number; sub?: string; color?: 'navy' | 'teal' | 'green' | 'red' | 'amber'; icon?: React.ElementType
}) {
  const colors = {
    navy: 'bg-navy-50 text-navy-700',
    teal: 'bg-teal-50 text-teal-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {Icon && (
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ms-3', colors[color])}>
            <Icon size={17} />
          </div>
        )}
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg'
}) {
  if (!open) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={clsx('relative bg-white rounded-2xl shadow-modal w-full animate-slide-up', sizes[size])}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X size={15} /></button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }: {
  tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void
}) {
  return (
    <div className="flex border-b border-gray-100 overflow-x-auto">
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={clsx('px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap flex-shrink-0',
            active === tab.id ? 'text-navy-800 border-navy-800' : 'text-gray-500 border-transparent hover:text-gray-700')}>
          {tab.label}
          {tab.count !== undefined && (
            <span className={clsx('text-xs px-1.5 py-0.5 rounded-full',
              active === tab.id ? 'bg-navy-100 text-navy-700' : 'bg-gray-100 text-gray-500')}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export function FormField({ label, error, hint, required, children }: {
  label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ms-0.5">*</span>}</label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
