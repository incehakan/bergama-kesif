import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  User,
  UtensilsCrossed,
  Map,
  Calendar,
  Newspaper,
  Landmark,
  Eye,
  LogOut,
} from 'lucide-react'
import { TOKEN_KEY } from '../lib/api.js'

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-red-900 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`

const items = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/tarihce', label: 'Tarihçe', icon: BookOpen },
  { to: '/baskan', label: 'Başkan Mesajı', icon: User },
  { to: '/yeme-icme', label: 'Yeme & İçme', icon: UtensilsCrossed },
  { to: '/rotalar', label: 'Rotalar', icon: Map },
  { to: '/etkinlikler', label: 'Etkinlikler', icon: Calendar },
  { to: '/haberler', label: 'Haberler', icon: Newspaper },
  { to: '/eserler', label: 'Tarihi Eserler', icon: Landmark },
  { to: '/vr', label: 'VR İçerikler', icon: Eye },
]

export default function Sidebar() {
  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    window.location.href = '/login'
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col border-r border-slate-800 bg-slate-900 text-white">
      <div className="border-b border-slate-800 px-4 py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Keşif</p>
        <p className="text-lg font-semibold text-white">Yönetim Paneli</p>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass} end={to === '/dashboard'}>
            <Icon className="h-5 w-5 shrink-0 opacity-90" strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-red-950/50 hover:text-red-200"
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          Çıkış
        </button>
      </div>
    </aside>
  )
}
