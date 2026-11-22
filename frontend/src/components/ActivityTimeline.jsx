import { STAGES } from '../utils/statusStyles.js'

// Turns one saved history row into words + a stage colour
function describe(entry) {
  if (entry.from_status === null) return { stage: 'new', text: 'Created' }
  if (entry.from_status === 'resolved' && entry.to_status === 'in_progress') {
    return { stage: 'reopened', text: 'Reopened' }
  }
  if (entry.to_status === 'in_progress')
    return { stage: 'in_progress', text: 'Started (In Progress)' }
  if (entry.to_status === 'resolved') return { stage: 'resolved', text: 'Resolved' }
  return { stage: entry.to_status, text: `Moved to ${entry.to_status}` }
}

// Newest action first: who did what, and when
function ActivityTimeline({ history }) {
  if (history.length === 0) return <p className="text-sm text-stone-500">No activity yet.</p>

  return (
    <ol className="space-y-4">
      {history.map((entry, index) => {
        const { stage, text } = describe(entry)
        const isLast = index === history.length - 1

        return (
          <li key={entry.id} className="relative flex gap-3">
            {!isLast && <span className="absolute top-5 left-[5px] h-full w-px bg-stone-200" />}
            <span
              className={`relative mt-1.5 h-3 w-3 shrink-0 rounded-full ${STAGES[stage]?.solid ?? 'bg-stone-400'}`}
            />
            <div className="text-sm">
              <p>
                <span className="font-medium">{text}</span>
                <span className="text-stone-500"> by {entry.changed_by_name}</span>
              </p>
              <p className="text-xs text-stone-400">
                {new Date(entry.changed_at).toLocaleString()}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default ActivityTimeline