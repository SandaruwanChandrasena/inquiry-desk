import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import AppHeader from '../components/AppHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

// Which buttons to show. The API still decides what is allowed (422).
const ACTIONS = {
  new: [{ status: 'in_progress', label: 'Start (In Progress)' }],
  in_progress: [{ status: 'resolved', label: 'Mark Resolved' }],
  resolved: [{ status: 'in_progress', label: 'Reopen' }],
}

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  )
}

function InquiryDetailPage() {
  const { id } = useParams()
  const [inquiry, setInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [reloadCount, setReloadCount] = useState(0)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [stale, setStale] = useState(false)

  useEffect(() => {
    let ignore = false

    api(`/inquiries/${id}`)
      .then((data) => {
        if (!ignore) setInquiry(data.inquiry)
      })
      .catch((err) => {
        if (!ignore) setLoadError(err)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [id, reloadCount])

  function handleReload() {
    setLoading(true)
    setLoadError(null)
    setStale(false)
    setActionError('')
    setSuccessMessage('')
    setReloadCount((count) => count + 1)
  }

  async function handleChangeStatus(nextStatus) {
    setSaving(true)
    setActionError('')
    setSuccessMessage('')

    try {
      const data = await api(`/inquiries/${id}/status`, {
        method: 'PATCH',
        body: { status: nextStatus, version: inquiry.version },
      })
      setInquiry(data.inquiry)
      setSuccessMessage('Status updated.')
    } catch (err) {
      if (err.status === 409) setStale(true)
      setActionError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // 400 (bad id like "abc") and 404 (missing or not yours) look the same to the user
  const notFound = loadError && (loadError.status === 404 || loadError.status === 400)

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Link to="/" className="text-sm text-brand-700 hover:underline">
          ← Back to inquiries
        </Link>

        {loading && <p className="mt-4 text-stone-500">Loading inquiry...</p>}

        {!loading && notFound && (
          <div className="card mt-4 text-center">
            <h2 className="text-lg font-semibold">Inquiry not found</h2>
            <p className="mt-1 text-sm text-stone-500">
              It may not exist, or you don't have access to it.
            </p>
            <Link to="/" className="btn-primary mt-4">
              Go to inquiries
            </Link>
          </div>
        )}

        {!loading && loadError && !notFound && (
          <div role="alert" className="alert-error mt-4 flex items-center justify-between gap-4">
            <span>Could not load the inquiry: {loadError.message}</span>
            <button className="btn-secondary" onClick={handleReload}>
              Try again
            </button>
          </div>
        )}

        {!loading && inquiry && (
          <>
            <div className="mt-2 mb-4 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">{inquiry.subject}</h2>
              <StatusBadge status={inquiry.status} />
            </div>

            <div className="card">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Customer">{inquiry.customer_name}</Detail>
                <Detail label="Email">{inquiry.email || '—'}</Detail>
                <Detail label="Phone">{inquiry.phone || '—'}</Detail>
                <Detail label="Created">
                  {inquiry.created_by_name}, {formatDate(inquiry.created_at)}
                </Detail>
                <div className="sm:col-span-2">
                  <Detail label="Description">
                    <span className="whitespace-pre-wrap">{inquiry.description}</span>
                  </Detail>
                </div>
                <div className="sm:col-span-2">
                  <Detail label="Last updated">
                    {inquiry.updated_by_name}, {formatDate(inquiry.updated_at)}
                  </Detail>
                </div>
              </dl>
            </div>

            <div className="card mt-4">
              <h3 className="mb-3 font-semibold">Change status</h3>

              <div className="flex flex-wrap gap-2">
                {ACTIONS[inquiry.status]?.map((action) => (
                  <button
                    key={action.status}
                    className="btn-primary"
                    disabled={saving || stale}
                    onClick={() => handleChangeStatus(action.status)}
                  >
                    {saving ? 'Saving...' : action.label}
                  </button>
                ))}
              </div>

              {successMessage && (
                <p role="status" className="alert-success mt-3">
                  {successMessage}
                </p>
              )}

              {actionError && (
                <div role="alert" className="alert-error mt-3 flex items-center justify-between gap-4">
                  <span>{actionError}</span>
                  {stale && (
                    <button className="btn-secondary" onClick={handleReload}>
                      Reload
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  )
}

export default InquiryDetailPage