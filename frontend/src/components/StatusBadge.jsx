const STATUS_STYLES = {
  new: { label: 'New', className: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-800' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800' },
}

function StatusBadge({ status }) {
  const { label, className } = STATUS_STYLES[status] ?? {
    label: status,
    className: 'bg-stone-200 text-stone-700',
  }

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  )
}

export default StatusBadge