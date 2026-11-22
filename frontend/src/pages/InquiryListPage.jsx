import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import AppLayout from '../components/AppLayout.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { EyeIcon, InboxIcon, SearchIcon } from '../components/Icons.jsx'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

// Grey placeholder rows while the list loads
function SkeletonRows() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm" aria-hidden="true">
      {[1, 2, 3].map((row) => (
        <div
          key={row}
          className="flex animate-pulse items-center gap-4 border-b border-stone-100 py-3 last:border-0"
        >
          <div className="h-4 w-1/4 rounded bg-stone-200" />
          <div className="h-4 w-1/3 rounded bg-stone-200" />
          <div className="h-5 w-20 rounded-full bg-stone-200" />
          <div className="h-4 w-1/6 rounded bg-stone-200" />
        </div>
      ))}
    </div>
  )
}

function InquiryListPage() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [savedMessage] = useState(location.state?.message)
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadCount, setReloadCount] = useState(0)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  // Keep the "saved" message on screen, but remove it from history so F5 doesn't show it again
  useEffect(() => {
    if (location.state?.message) navigate(location.pathname, { replace: true })
  }, [location, navigate])

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
    <AppLayout>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">
            {user.role === 'admin' ? 'All inquiries' : 'My inquiries'}
          </h2>
          <p className="text-sm text-stone-500">
            Manage and track customer inquiries
            {!loading &&
              !error &&
              ` · ${inquiries.length} ${inquiries.length === 1 ? 'inquiry' : 'inquiries'}`}
          </p>
        </div>
        <Link to="/inquiries/new" className="btn-primary">
          + New inquiry
        </Link>
      </div>

      {savedMessage && (
        <p role="status" className="alert-success mb-4">
          {savedMessage}
        </p>
      )}

      <form
        onSubmit={handleSearch}
        className="mb-4 flex flex-wrap gap-2 rounded-xl border border-stone-200 bg-white p-3 shadow-sm"
      >
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

        <div className="relative min-w-48 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            aria-label="Search by customer or subject"
            placeholder="Search by customer or subject"
            className="input pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            maxLength={100}
          />
        </div>

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

      {loading && (
        <>
          <p className="sr-only">Loading inquiries...</p>
          <SkeletonRows />
        </>
      )}

      {!loading && error && (
        <div role="alert" className="alert-error flex items-center justify-between gap-4">
          <span>Could not load inquiries: {error}</span>
          <button className="btn-secondary" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && inquiries.length === 0 && (
        <div className="card flex flex-col items-center py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <InboxIcon className="h-6 w-6" />
          </span>
          {hasFilters ? (
            <>
              <h3 className="mt-3 font-semibold">No inquiries match your filters.</h3>
              <p className="mt-1 text-sm text-stone-500">Try another status or search word.</p>
              <button className="btn-secondary mt-4" onClick={handleClear}>
                Clear filters
              </button>
            </>
          ) : (
            <>
              <h3 className="mt-3 font-semibold">No inquiries yet.</h3>
              <p className="mt-1 text-sm text-stone-500">
                Record the first customer inquiry to get started.
              </p>
              <Link to="/inquiries/new" className="btn-primary mt-4">
                + New inquiry
              </Link>
            </>
          )}
        </div>
      )}

      {!loading && !error && inquiries.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last updated</th>
                <th className="px-4 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr
                  key={inquiry.id}
                  onClick={() => navigate(`/inquiries/${inquiry.id}`)}
                  className="cursor-pointer border-t border-stone-100 hover:bg-brand-50/50"
                >
                  <td className="px-4 py-3 text-stone-400">#{inquiry.id}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{inquiry.customer_name}</div>
                    <div className="text-xs text-stone-500">{inquiry.email || inquiry.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/inquiries/${inquiry.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {inquiry.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={inquiry.status} />
                  </td>
                  <td className="px-4 py-3 text-stone-600">
                    {inquiry.updated_by_name}
                    <div className="text-xs text-stone-400">
                      {new Date(inquiry.updated_at).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/inquiries/${inquiry.id}`}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`View inquiry ${inquiry.id}`}
                      className="inline-flex rounded-md p-1.5 text-stone-400 hover:bg-brand-100 hover:text-brand-700"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  )
}

export default InquiryListPage