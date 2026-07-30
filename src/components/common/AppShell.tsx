import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  IoBookOutline,
  IoRibbonOutline,
  IoTrophyOutline,
  IoPersonOutline,
  IoMicOutline,
} from 'react-icons/io5'
import { OfflineBanner } from './OfflineBanner'

const NAV_ITEMS = [
  { to: '/wasodex', label: 'Wasodex', Icon: IoBookOutline },
  { to: '/ecoute', label: 'Écoute', Icon: IoMicOutline },
  { to: '/badges', label: 'Badges', Icon: IoRibbonOutline },
  { to: '/classement', label: 'Classement', Icon: IoTrophyOutline },
  { to: '/profil', label: 'Profil', Icon: IoPersonOutline },
]

export function AppShell() {
  const location = useLocation()
  const [resetTick, setResetTick] = useState(0)

  function handleNavClick(to: string) {
    if (location.pathname === to) setResetTick((t) => t + 1)
  }

  return (
    <div className="min-h-svh flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <OfflineBanner />
      <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold">🐦 Waso</h1>
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet key={`${location.pathname}-${resetTick}`} />
      </main>
      <nav className="fixed bottom-0 inset-x-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur flex">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => handleNavClick(item.to)}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 text-xs ${
                isActive ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <item.Icon size={20} aria-hidden />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
