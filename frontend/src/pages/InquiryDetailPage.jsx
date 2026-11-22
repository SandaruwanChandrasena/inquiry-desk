import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import AppHeader from '../components/AppHeader.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import StatusSteps from '../components/StatusSteps.jsx'
import { MailIcon, PhoneIcon } from '../components/Icons.jsx'

// Which buttons to show. The API still decides what is allowed (422).
const ACTIONS = {
  new: [{ status: 'in_progress', label: 'Start (In Progress)' }],
  in_progress: [{ status: 'resolved', label: 'Mark Resolved' }],
  resolved: [{ status: 'in_progress', label: 'Reopen' }],
}

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function SectionTitle({ children }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">{children}</h3>
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
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Link to="/" className="text-sm text-brand-700 hover:underline">
          ← Back to inquiries
        </Link>

        {loading && <p className="mt-4 text-stone-500">Loading inquiry...</p>}

        {!loading && notFound && (
          <div className="card mx-auto mt-6 max-w-md text-center">
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
            <div className="mt-2 mb-6">
              <p className="text-xs text-stone-400">Inquiry #{inquiry.id}</p>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold">{inquiry.subject}</h2>
                <StatusBadge status={inquiry.status} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-4 md:col-span-2">
                <section className="card">
                  <SectionTitle>Status</SectionTitle>
                  <StatusSteps status={inquiry.status} />

                  <div className="mt-5 flex flex-wrap gap-2">
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
                </section>

                <section className="card">
                  <SectionTitle>Description</SectionTitle>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{inquiry.description}</p>
                </section>
              </div>

              <div className="space-y-4">
                <section className="card">
                  <SectionTitle>Customer</SectionTitle>
                  <p className="font-medium">{inquiry.customer_name}</p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {inquiry.email && (
                      <li className="flex items-center gap-2">
                        <MailIcon className="h-4 w-4 text-stone-400" />
                        <a href={`mailto:${inquiry.email}`} className="text-brand-700 hover:underline">
                          {inquiry.email}
                        </a>
                      </li>
                    )}
                    {inquiry.phone && (
                      <li className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-stone-400" />
                        <a href={`tel:${inquiry.phone}`} className="text-brand-700 hover:underline">
                          {inquiry.phone}
                        </a>
                      </li>
                    )}
                  </ul>
                </section>

                <section className="card">
                  <SectionTitle>Activity</SectionTitle>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-stone-500">Last updated</dt>
                      <dd className="font-medium">{inquiry.updated_by_name}</dd>
                      <dd className="text-xs text-stone-400">{formatDate(inquiry.updated_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-stone-500">Created</dt>
                      <dd className="font-medium">{inquiry.created_by_name}</dd>
                      <dd className="text-xs text-stone-400">{formatDate(inquiry.created_at)}</dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}

export default InquiryDetailPage