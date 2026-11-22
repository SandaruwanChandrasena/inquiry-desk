import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'

// Seeded test users (see backend/db/seed.js). Shown only to make the demo quick.
const DEMO_PASSWORD = 'Password123!'
const DEMO_ACCOUNTS = [
  { email: 'alice@example.com', role: 'Staff' },
  { email: 'bob@example.com', role: 'Staff' },
  { email: 'admin@example.com', role: 'Admin' },
]

function LoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  function fillDemoAccount(demoEmail) {
    setEmail(demoEmail)
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-brand-50 to-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Logo size="lg" />
          <p className="mt-2 text-sm text-stone-500">
            Track customer inquiries from first contact to resolved.
          </p>
        </div>

        <div className="card">
          <h1 className="mb-4 text-lg font-semibold">Sign in</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <p role="alert" className="alert-error">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-stone-300 bg-white/60 p-4 text-sm">
          <p className="font-medium text-stone-700">Demo accounts</p>
          <p className="text-xs text-stone-500">
            Click one to fill the form. Password for all: {DEMO_PASSWORD}
          </p>
          <ul className="mt-2 space-y-1">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => fillDemoAccount(account.email)}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left hover:bg-brand-50"
                >
                  <span>{account.email}</span>
                  <span className="text-xs text-stone-400">{account.role}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}

export default LoginPage