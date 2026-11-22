// Small line icons. They use the text colour (currentColor), so Tailwind text-* classes colour them.
function Icon({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  )
}

export function CupIcon(props) {
  return (
    <Icon {...props}>
      <path d="M4 10h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 12h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3c0 1.2 1 1.6 1 2.8M12 3c0 1.2 1 1.6 1 2.8" />
    </Icon>
  )
}

export function MailIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Icon>
  )
}

export function PhoneIcon(props) {
  return (
    <Icon {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </Icon>
  )
}

export function InboxIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 13h5l2 3h4l2-3h5" />
      <path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z" />
    </Icon>
  )
}