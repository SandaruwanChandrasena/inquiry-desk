import { STAGES } from '../utils/statusStyles.js'

const NORMAL_STEPS = ['new', 'in_progress', 'resolved']
const AFTER_REOPEN_STEPS = ['reopened', 'resolved']

// Shows where the inquiry is: New → In Progress → Resolved, or Reopened → Resolved after a reopen
function StatusSteps({ status, wasReopened }) {
  const steps = wasReopened ? AFTER_REOPEN_STEPS : NORMAL_STEPS
  const currentStage = wasReopened && status === 'in_progress' ? 'reopened' : status
  const current = steps.indexOf(currentStage)

  return (
    <ol className="flex items-center gap-2" aria-label="Status progress">
      {steps.map((stage, index) => {
        const done = index < current
        const active = index === current

        let circle = 'bg-stone-100 text-stone-400'
        if (done) circle = STAGES[stage].soft
        if (active) circle = STAGES[stage].solid

        return (
          <li key={stage} className="flex flex-1 items-center gap-2 last:flex-none">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${circle}`}
            >
              {done ? '✓' : index + 1}
            </span>
            <span
              aria-current={active ? 'step' : undefined}
              className={`whitespace-nowrap text-sm ${active ? 'font-semibold' : 'text-stone-500'}`}
            >
              {STAGES[stage].label}
            </span>
            {index < steps.length - 1 && (
              <span className={`h-0.5 flex-1 rounded ${done ? 'bg-stone-400' : 'bg-stone-200'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default StatusSteps