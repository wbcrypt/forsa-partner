import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, DollarSign, Link2, BarChart2, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLocale } from '../../hooks/useLocale'
import { LOCALES, Locale } from '../../lib/i18n'
import clsx from 'clsx'

const NAV = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/' },
  { key: 'myStudents', icon: Users, path: '/students' },
  { key: 'commissions', icon: DollarSign, path: '/commissions' },
  { key: 'referrals', icon: Link2, path: '/referrals' },
  { key: 'reports', icon: BarChart2, path: '/reports' },
]

export default function Layout() {
  const { user, partner } = useAuth()
  const { t, locale, changeLocale } = useLocale()
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="FORSA" className="w-7 h-7 flex-shrink-0 object-contain" />
            <div>
              <span className="font-semibold text-navy-900 text-sm">FORSA</span>
              {partner?.isFoundingPartner && (
                <span className="ms-1.5 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">⭐ Founding</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Locale switcher */}
            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5">
              {LOCALES.map(l => (
                <button key={l.code} onClick={() => changeLocale(l.code as Locale)}
                  className={clsx('px-2 py-1 text-xs rounded-md font-medium transition-all',
                    locale === l.code ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
                  {l.label}
                </button>
              ))}
            </div>
            <NavLink to="/profile"
              className="w-8 h-8 bg-navy-800 rounded-full flex items-center justify-center hover:bg-navy-900 transition-colors">
              <span className="text-white text-xs font-semibold">
                {partner?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'P'}
              </span>
            </NavLink>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 page-content animate-fade-in">
        <Outlet />
      </main>

      {/* Bottom nav — mobile */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 lg:hidden">
        <div className="max-w-2xl mx-auto flex">
          {NAV.map(item => {
            const Icon = item.icon
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            return (
              <NavLink key={item.path} to={item.path}
                className={clsx('flex-1 flex flex-col items-center gap-1 py-2.5 px-1 transition-colors',
                  isActive ? 'text-navy-800' : 'text-gray-400')}>
                <div className={clsx('p-1.5 rounded-xl transition-all', isActive ? 'bg-navy-50' : '')}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={clsx('text-[9px] font-medium truncate', isActive ? 'text-navy-800' : 'text-gray-400')}>
                  {t(item.key)}
                </span>
              </NavLink>
            )
          })}
          {/* Profile in mobile nav */}
          <NavLink to="/profile"
            className={clsx('flex-1 flex flex-col items-center gap-1 py-2.5 px-1 transition-colors',
              location.pathname === '/profile' ? 'text-navy-800' : 'text-gray-400')}>
            <div className={clsx('p-1.5 rounded-xl transition-all', location.pathname === '/profile' ? 'bg-navy-50' : '')}>
              <User size={19} strokeWidth={location.pathname === '/profile' ? 2.5 : 2} />
            </div>
            <span className={clsx('text-[9px] font-medium', location.pathname === '/profile' ? 'text-navy-800' : 'text-gray-400')}>
              {t('profile')}
            </span>
          </NavLink>
        </div>
      </nav>

      {/* Desktop sidebar - simple top nav extension */}
      <div className="hidden lg:block fixed top-14 left-0 bottom-0 w-52 bg-white border-r border-gray-100 py-4 px-2">
        {NAV.map(item => {
          const Icon = item.icon
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
          return (
            <NavLink key={item.path} to={item.path}
              className={clsx('flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all mb-0.5',
                isActive ? 'bg-navy-800 text-white' : 'text-gray-600 hover:bg-gray-50')}>
              <Icon size={16} />
              <span className="font-medium">{t(item.key)}</span>
            </NavLink>
          )
        })}
        <NavLink to="/profile"
          className={clsx('flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all mt-1',
            location.pathname === '/profile' ? 'bg-navy-800 text-white' : 'text-gray-600 hover:bg-gray-50')}>
          <User size={16} />
          <span className="font-medium">{t('profile')}</span>
        </NavLink>
        {partner && (
          <div className="absolute bottom-4 left-2 right-2">
            <div className="px-3 py-3 bg-gray-50 rounded-xl">
              <p className="text-xs font-medium text-gray-700 truncate">{partner.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{partner.type}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
