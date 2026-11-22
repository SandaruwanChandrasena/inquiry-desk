import { STAGES } from '../utils/statusStyles.js'

function StatusBadge({ stage }) {
  const style = STAGES[stage]
  const label = style?.label ?? stage
  const colours = style?.badge ?? 'bg-stone-200 text-stone-700'

  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${colours}`}
    >
      {label}
    </span>
  )
}

export default StatusBadge