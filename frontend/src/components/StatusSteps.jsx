const STEPS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

// Shows where the inquiry is in its lifecycle: New → In Progress → Resolved
function StatusSteps({ status }) {
  const current = STEPS.findIndex((step) => step.value === status)

  return (
    <ol className="flex items-center gap-2" aria-label="Status progress">
      {STEPS.map((step, index) => {
        const done = index < current
        const active = index === current

        let circle = 'bg-stone-100 text-stone-400'
        if (done) circle = 'bg-brand-100 text-brand-700'
        if (active) circle = 'bg-brand-600 text-white'

        return (
          <li key={step.value} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${circle}`}
            >
              {done ? '✓' : index + 1}
            </span>
            <span
              aria-current={active ? 'step' : undefined}
              className={`whitespace-nowrap text-sm ${active ? 'font-semibold' : 'text-stone-500'}`}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <span className={`h-0.5 flex-1 rounded ${done ? 'bg-brand-500' : 'bg-stone-200'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default StatusSteps