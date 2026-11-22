import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from './Icons.jsx'

// Round back button + page title, shared by the detail and new inquiry pages
function PageHeader({ title, subtitle, backTo = '/', backLabel = 'Back to inquiries' }) {
  return (
    <div className="mb-6 flex shrink-0 items-center gap-4">
      <Link
        to={backTo}
        aria-label={backLabel}
        title={backLabel}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </Link>
      <div className="border-l border-stone-200 pl-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-sm text-stone-500">{subtitle}</p>
      </div>
    </div>
  )
}

export default PageHeader