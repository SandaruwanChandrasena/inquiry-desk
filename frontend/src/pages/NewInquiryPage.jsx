import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import AppHeader from '../components/AppHeader.jsx'
import InquiryForm from '../components/InquiryForm.jsx'

function NewInquiryPage() {
  const navigate = useNavigate()

  async function handleCreate(values) {
    const data = await api('/inquiries', { method: 'POST', body: values })
    navigate('/', { state: { message: `Inquiry "${data.inquiry.subject}" saved.` } })
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link to="/" className="text-sm text-brand-700 hover:underline">
          ← Back to inquiries
        </Link>
        <h2 className="mt-2 mb-4 text-xl font-semibold">New inquiry</h2>
        <div className="card">
          <InquiryForm onSubmit={handleCreate} onCancel={() => navigate('/')} />
        </div>
      </main>
    </>
  )
}

export default NewInquiryPage