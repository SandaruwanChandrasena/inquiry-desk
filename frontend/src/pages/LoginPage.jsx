import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'
import {
  CheckIcon,
  CupIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
} from '../components/Icons.jsx'

const HIGHLIGHTS = [
  'Record inquiries with clear contact details',
  'Find them fast by status or search',
  'Move them from New to Resolved',
]

function LoginPage() {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

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
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-linear-to-br from-brand-800 via-stone-900 to-stone-950 px-14 text-white lg:flex lg:flex-col lg:justify-center">
        <CupIcon className="absolute -right-16 -bottom-16 h-96 w-96 text-white/5" />
        <div className="relative max-w-md">
          <Logo size="lg" dark />
          <h2 className="mt-10 text-4xl leading-tight font-bold">
            Customer Inquiry Management System
          </h2>
          <p className="mt-4 text-lg text-stone-300">
            Track, manage and resolve customer inquiries easily.
          </p>
          <span className="mt-6 block h-1 w-16 rounded bg-brand-500" />
          <ul className="mt-8 space-y-3 text-stone-200">
            {HIGHLIGHTS.map((text) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                  <CheckIcon className="h-4 w-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center bg-stone-50 px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center lg:hidden">
            <Logo size="lg" />
          </div>

          <div className="card">
            <h1 className="text-xl font-semibold">Welcome back</h1>
            <p className="mb-6 text-sm text-stone-500">Sign in to your account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Email
                </label>
                <div className="relative">
                  <MailIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    id="email"
                    type="email"
                    className="input pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input px-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((show) => !show)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="alert-error">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage