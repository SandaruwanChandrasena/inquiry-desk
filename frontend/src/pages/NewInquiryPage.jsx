import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import AppLayout from '../components/AppLayout.jsx'
import InquiryForm from '../components/InquiryForm.jsx'
import PageHeader from '../components/PageHeader.jsx'

function NewInquiryPage() {
  const navigate = useNavigate()

  async function handleCreate(values) {
    const data = await api('/inquiries', { method: 'POST', body: values })
    navigate('/', { state: { message: `Inquiry "${data.inquiry.subject}" saved.` } })
  }

  return (
    <AppLayout>
      <PageHeader title="New inquiry" subtitle="Create a new customer inquiry" />
      <div className="card">
        <InquiryForm onSubmit={handleCreate} onCancel={() => navigate('/')} />
      </div>
    </AppLayout>
  )
}

export default NewInquiryPage