const STATUS_STYLES = {
  new: { label: 'New', color: '#1d4ed8', background: '#dbeafe' },
  in_progress: { label: 'In Progress', color: '#92400e', background: '#fef3c7' },
  resolved: { label: 'Resolved', color: '#166534', background: '#dcfce7' },
}

function StatusBadge({ status }) {
  const { label, color, background } = STATUS_STYLES[status] ?? {
    label: status,
    color: '#374151',
    background: '#e5e7eb',
  }

  return (
    <span
      style={{
        color,
        background,
        padding: '2px 10px',
        borderRadius: 999,
        fontSize: '0.85em',
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

export default StatusBadge