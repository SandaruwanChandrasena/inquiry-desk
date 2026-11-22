// One colour per stage, used by the badge, the stepper and the activity timeline
export const STAGES = {
  new: {
    label: 'New',
    badge: 'bg-blue-100 text-blue-800',
    solid: 'bg-blue-600 text-white',
    soft: 'bg-blue-100 text-blue-700',
  },
  in_progress: {
    label: 'In Progress',
    badge: 'bg-amber-100 text-amber-800',
    solid: 'bg-amber-500 text-white',
    soft: 'bg-amber-100 text-amber-700',
  },
  resolved: {
    label: 'Resolved',
    badge: 'bg-green-100 text-green-800',
    solid: 'bg-green-600 text-white',
    soft: 'bg-green-100 text-green-700',
  },
  reopened: {
    label: 'Reopened',
    badge: 'bg-purple-100 text-purple-800',
    solid: 'bg-purple-600 text-white',
    soft: 'bg-purple-100 text-purple-700',
  },
}

// The database keeps 3 statuses. An In Progress inquiry that was reopened is shown as "Reopened".
export function displayStage(inquiry) {
  if (inquiry.status === 'in_progress' && inquiry.was_reopened) return 'reopened'
  return inquiry.status
}