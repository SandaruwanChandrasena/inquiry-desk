import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from './Logo.jsx'
import { ListIcon, LogOutIcon, PlusIcon } from './Icons.jsx'

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Sidebar + page area, shared by every signed-in page
function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const onNewPage = pathname === '/inquiries/new'

  const links = [
    { to: '/', label: 'Inquiries', Icon: ListIcon, active: !onNewPage },
    { to: '/inquiries/new', label: 'New inquiry', Icon: PlusIcon, active: onNewPage },
  ]

  return (
    <div className="min-h-screen md:flex">
      <aside className="hidden w-60 shrink-0 flex-col bg-stone-900 text-stone-300 md:sticky md:top-0 md:flex md:h-screen">
        <div className="px-5 py-5">
          <Link to="/">
            <Logo dark />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map(({ to, label, Icon, active }) => (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active ? 'bg-brand-600 text-white' : 'hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-stone-800 p-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
            >
              {initials(user.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs capitalize text-stone-400">{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-stone-800 hover:text-white"
          >
            <LogOutIcon className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Small screens: simple top bar instead of the sidebar */}
        <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 md:hidden">
          <Link to="/">
            <Logo />
          </Link>
          <button className="btn-secondary" onClick={logout}>
            Sign out
          </button>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}

export default AppLayout