import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function AppHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-brand-700">
          Inquiry Desk
        </Link>
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <span>
            {user.name} <span className="text-stone-400">({user.role})</span>
          </span>
          <button className="btn-secondary" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppHeader