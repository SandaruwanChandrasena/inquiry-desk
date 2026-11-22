import { CupIcon } from './Icons.jsx'

// size: 'md' or 'lg'. dark: white text for dark backgrounds (sidebar, login panel)
function Logo({ size = 'md', dark = false }) {
  const large = size === 'lg'

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={`flex items-center justify-center rounded-lg bg-brand-600 text-white ${
          large ? 'h-10 w-10' : 'h-8 w-8'
        }`}
      >
        <CupIcon className={large ? 'h-6 w-6' : 'h-5 w-5'} />
      </span>
      <span
        className={`font-bold ${dark ? 'text-white' : 'text-brand-800'} ${
          large ? 'text-2xl' : 'text-lg'
        }`}
      >
        Inquiry Desk
      </span>
    </span>
  )
}

export default Logo