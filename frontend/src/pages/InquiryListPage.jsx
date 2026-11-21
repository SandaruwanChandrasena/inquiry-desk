import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

function InquiryListPage() {
  const { user, logout } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (search) params.set('search', search)
    const query = params.toString()

    // Ignore an old reply if the filters changed before it arrived
    let ignore = false

    api(query ? `/inquiries?${query}` : '/inquiries')
      .then((data) => {
        if (!ignore) setInquiries(data.inquiries)
      })
      .catch((err) => {
        if (!ignore) setError(err.message)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [status, search, reloadCount])

  function startLoading() {
    setLoading(true)
    setError('')
  }

  function applyFilters(nextStatus, nextSearch) {
    if (nextStatus === status && nextSearch === search) return
    startLoading()
    setStatus(nextStatus)
    setSearch(nextSearch)
  }

  function handleSearch(e) {
    e.preventDefault()
    applyFilters(status, searchInput.trim())
  }

  function handleClear() {
    setSearchInput('')
    applyFilters('', '')
  }

  function handleRetry() {
    startLoading()
    setReloadCount((count) => count + 1)
  }

  const hasFilters = status !== '' || search !== ''

  return (
    <>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-brand-700">Inquiry Desk</h1>
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

      <main className="mx-auto max-w-5xl px-4 py-6">
        <h2 className="mb-4 text-xl font-semibold">
          {user.role === 'admin' ? 'All inquiries' : 'My inquiries'}
        </h2>

        <form onSubmit={handleSearch} className="mb-4 flex flex-wrap gap-2">
          <select
            aria-label="Filter by status"
            className="input w-auto"
            value={status}
            onChange={(e) => applyFilters(e.target.value, search)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="search"
            aria-label="Search by customer or subject"
            placeholder="Search customer or subject"
            className="input min-w-48 flex-1"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            maxLength={100}
          />

          <button type="submit" className="btn-primary">
            Search
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClear}
            disabled={!hasFilters && searchInput === ''}
          >
            Clear
          </button>
        </form>

        {loading && <p className="text-stone-500">Loading inquiries...</p>}

        {!loading && error && (
          <div role="alert" className="alert-error flex items-center justify-between gap-4">
            <span>Could not load inquiries: {error}</span>
            <button className="btn-secondary" onClick={handleRetry}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && inquiries.length === 0 && (
          <div className="card text-center text-stone-500">
            {hasFilters ? 'No inquiries match your filters.' : 'No inquiries yet.'}
          </div>
        )}

        {!loading && !error && inquiries.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last updated</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-t border-stone-100 hover:bg-stone-50">
                    <td className="px-4 py-3 font-medium">{inquiry.customer_name}</td>
                    <td className="px-4 py-3">{inquiry.subject}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inquiry.status} />
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {inquiry.updated_by_name}
                      <div className="text-xs text-stone-400">
                        {new Date(inquiry.updated_at).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  )
}

export default InquiryListPage