import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import AppLayout from '../components/AppLayout.jsx'
import InquiryForm from '../components/InquiryForm.jsx'

function NewInquiryPage() {
  const navigate = useNavigate()

  async function handleCreate(values) {
    const data = await api('/inquiries', { method: 'POST', body: values })
    navigate('/', { state: { message: `Inquiry "${data.inquiry.subject}" saved.` } })
  }

  return (
    <AppLayout>
      <div className="max-w-2xl">
        <Link to="/" className="text-sm text-brand-700 hover:underline">
          ← Back to inquiries
        </Link>
        <h2 className="mt-2 text-2xl font-semibold">New inquiry</h2>
        <p className="mb-4 text-sm text-stone-500">Create a new customer inquiry</p>
        <div className="card">
          <InquiryForm onSubmit={handleCreate} onCancel={() => navigate('/')} />
        </div>
      </div>
    </AppLayout>
  )
}

export default NewInquiryPage