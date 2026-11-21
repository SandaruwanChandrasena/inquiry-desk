// Which status each status may move to
const allowedMoves = {
  new: ['in_progress'],
  in_progress: ['resolved'],
  resolved: ['in_progress'],
};

export function canMove(from, to) {
  return allowedMoves[from]?.includes(to) ?? false;
}