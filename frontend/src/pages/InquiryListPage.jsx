import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const cell = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #ddd' }

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
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Inquiry Desk</h1>
        <div>
          {user.name} ({user.role}) <button onClick={logout}>Sign out</button>
        </div>
      </header>

      <h2>{user.role === 'admin' ? 'All inquiries' : 'My inquiries'}</h2>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select
          aria-label="Filter by status"
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          maxLength={100}
        />

        <button type="submit">Search</button>
        <button type="button" onClick={handleClear} disabled={!hasFilters && searchInput === ''}>
          Clear
        </button>
      </form>

      {loading && <p>Loading inquiries...</p>}

      {!loading && error && (
        <div role="alert">
          <p style={{ color: 'crimson' }}>Could not load inquiries: {error}</p>
          <button onClick={handleRetry}>Try again</button>
        </div>
      )}

      {!loading && !error && inquiries.length === 0 && (
        <p>{hasFilters ? 'No inquiries match your filters.' : 'No inquiries yet.'}</p>
      )}

      {!loading && !error && inquiries.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={cell}>Customer</th>
              <th style={cell}>Subject</th>
              <th style={cell}>Status</th>
              <th style={cell}>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td style={cell}>{inquiry.customer_name}</td>
                <td style={cell}>{inquiry.subject}</td>
                <td style={cell}>
                  <StatusBadge status={inquiry.status} />
                </td>
                <td style={cell}>
                  {inquiry.updated_by_name}
                  <br />
                  <small>{new Date(inquiry.updated_at).toLocaleString()}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  )
}

export default InquiryListPage