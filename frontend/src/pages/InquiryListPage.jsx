import { useEffect, useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const cell = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #ddd' }

function InquiryListPage() {
  const { user, logout } = useAuth()
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    api('/inquiries')
      .then((data) => setInquiries(data.inquiries))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [reloadCount])

  function handleRetry() {
    setLoading(true)
    setError('')
    setReloadCount((count) => count + 1)
  }

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Inquiry Desk</h1>
        <div>
          {user.name} ({user.role}) <button onClick={logout}>Sign out</button>
        </div>
      </header>

      <h2>{user.role === 'admin' ? 'All inquiries' : 'My inquiries'}</h2>

      {loading && <p>Loading inquiries...</p>}

      {!loading && error && (
        <div role="alert">
          <p style={{ color: 'crimson' }}>Could not load inquiries: {error}</p>
          <button onClick={handleRetry}>Try again</button>
        </div>
      )}

      {!loading && !error && inquiries.length === 0 && <p>No inquiries yet.</p>}

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