import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import AppLayout from '../components/AppLayout.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import StatusSteps from '../components/StatusSteps.jsx'
import ActivityTimeline from '../components/ActivityTimeline.jsx'
import { displayStage } from '../utils/statusStyles.js'
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  FileIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from '../components/Icons.jsx'

// Which buttons to show. The API still decides what is allowed (422).
const ACTIONS = {
  new: [{ status: 'in_progress', label: 'Start (In Progress)' }],
  in_progress: [{ status: 'resolved', label: 'Mark Resolved' }],
  resolved: [{ status: 'in_progress', label: 'Reopen' }],
}

function formatDate(value) {
  return new Date(value).toLocaleString()
}

function InfoRow({ Icon, label, children }) {
  return (
    <div className="flex gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
      <dt className="w-28 shrink-0 text-stone-500">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}

function SummaryRow({ Icon, label, name, date }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
      <div>
        <p>
          <span className="font-medium">{label}</span>
          <span className="text-stone-500"> by {name}</span>
        </p>
        <p className="text-xs text-stone-400">{formatDate(date)}</p>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-stone-500">
      {children}
    </h3>
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
    <AppLayout>
      {/* Big screens: the page fits the window (4rem = main's top + bottom padding), only the panels scroll */}
      <div className="lg:flex lg:h-[calc(100vh-4rem)] lg:min-h-[32rem] lg:flex-col">
        <div className="mb-6 flex shrink-0 items-center gap-4">
          <Link
            to="/"
            aria-label="Back to inquiries"
            title="Back to inquiries"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="border-l border-stone-200 pl-4">
            <h2 className="text-2xl font-semibold">Inquiry details</h2>
            <p className="text-sm text-stone-500">
              View the inquiry and move it through its lifecycle
            </p>
          </div>
        </div>

        {loading && <p className="text-stone-500">Loading inquiry...</p>}

        {!loading && notFound && (
          <div className="card mx-auto max-w-md text-center">
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
          <div role="alert" className="alert-error flex items-center justify-between gap-4">
            <span>Could not load the inquiry: {loadError.message}</span>
            <button className="btn-secondary" onClick={handleReload}>
              Try again
            </button>
          </div>
        )}

        {!loading && inquiry && (
          <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:grid-rows-[minmax(0,1fr)]">
            <div className="space-y-4 lg:col-span-2 lg:overflow-y-auto">
              <section className="card">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <FileIcon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-semibold">{inquiry.subject}</h3>
                    <p className="text-sm text-stone-400">#{inquiry.id}</p>
                  </div>
                  <StatusBadge stage={displayStage(inquiry)} />
                </div>

                <div className="mt-6">
                  <StatusSteps status={inquiry.status} wasReopened={inquiry.was_reopened} />
                </div>

                <dl className="mt-6 divide-y divide-stone-100 border-t border-stone-100 text-sm">
                  <InfoRow Icon={UserIcon} label="Customer">
                    {inquiry.customer_name}
                  </InfoRow>
                  <InfoRow Icon={MailIcon} label="Email">
                    {inquiry.email ? (
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="text-brand-700 hover:underline"
                      >
                        {inquiry.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                  <InfoRow Icon={PhoneIcon} label="Phone">
                    {inquiry.phone ? (
                      <a href={`tel:${inquiry.phone}`} className="text-brand-700 hover:underline">
                        {inquiry.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </InfoRow>
                </dl>
              </section>

              <section className="card">
                <SectionTitle>Description</SectionTitle>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{inquiry.description}</p>
              </section>
            </div>

            <div className="space-y-4 lg:flex lg:min-h-0 lg:flex-col">
              <section className="card lg:shrink-0">
                <SectionTitle>Update status</SectionTitle>
                <p className="mb-3 text-sm text-stone-500">Next allowed step:</p>

                <div className="flex flex-col gap-2">
                  {ACTIONS[inquiry.status]?.map((action) => (
                    <button
                      key={action.status}
                      className="btn-primary w-full"
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
                  <div role="alert" className="alert-error mt-3">
                    <p>{actionError}</p>
                    {stale && (
                      <button className="btn-secondary mt-2 w-full" onClick={handleReload}>
                        Reload
                      </button>
                    )}
                  </div>
                )}
              </section>

              <section className="card lg:flex lg:min-h-0 lg:flex-col">
                <SectionTitle>Activity</SectionTitle>
                <div className="mb-4 shrink-0 space-y-3 rounded-lg bg-brand-50 p-3 text-sm">
                  <SummaryRow
                    Icon={CalendarIcon}
                    label="Created"
                    name={inquiry.created_by_name}
                    date={inquiry.created_at}
                  />
                  <SummaryRow
                    Icon={ClockIcon}
                    label="Last updated"
                    name={inquiry.updated_by_name}
                    date={inquiry.updated_at}
                  />
                </div>
                <div className="max-h-56 overflow-y-auto border-t border-stone-100 pt-4 pr-2 lg:max-h-none lg:min-h-0">
                  <ActivityTimeline history={inquiry.history} />
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default InquiryDetailPage