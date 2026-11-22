import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm text-center">
        <p className="text-4xl font-bold text-brand-700">404</p>
        <h1 className="mt-2 text-lg font-semibold">Page not found</h1>
        <p className="mt-1 text-sm text-stone-500">This page does not exist.</p>
        <Link to="/" className="btn-primary mt-4">
          Go to inquiries
        </Link>
      </div>
    </main>
  )
}

export default NotFoundPage