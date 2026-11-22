import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-b from-brand-50 to-stone-50 px-4">
      <div className="w-full max-w-sm text-center">
        <Logo size="lg" />
        <div className="card mt-6">
          <p className="text-4xl font-bold text-brand-700">404</p>
          <h1 className="mt-2 text-lg font-semibold">Page not found</h1>
          <p className="mt-1 text-sm text-stone-500">This page does not exist.</p>
          <Link to="/" className="btn-primary mt-4">
            Go to inquiries
          </Link>
        </div>
      </div>
    </main>
  )
}

export default NotFoundPage