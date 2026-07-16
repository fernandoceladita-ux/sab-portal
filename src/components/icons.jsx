// Small, self-contained stroke-icon set. Keeping icons hand-rolled avoids
// pulling an extra dependency and keeps the bundle predictable.
const base = 'w-5 h-5'

const wrap = (children, className) => (
  <svg viewBox="0 0 24 24" fill="none" className={className || base} stroke="currentColor" strokeWidth="1.7">
    {children}
  </svg>
)

export const IconEdit = ({ className }) =>
  wrap(<path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14 5l4 4" strokeLinecap="round" strokeLinejoin="round" />, className)

export const IconIdCard = ({ className }) =>
  wrap(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11.5" r="2" />
      <path d="M5.5 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M14 9h5M14 13h5M14 16h3.5" strokeLinecap="round" />
    </>,
    className,
  )

export const IconCalendar = ({ className }) =>
  wrap(
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" strokeLinecap="round" />
    </>,
    className,
  )

export const IconCalendarCheck = ({ className }) =>
  wrap(
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4M9 14l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    className,
  )

export const IconCalendarX = ({ className }) =>
  wrap(
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4M9.5 13.5l5 5m0-5-5 5" strokeLinecap="round" />
    </>,
    className,
  )

export const IconPlane = ({ className }) =>
  wrap(<path d="M10.5 20.5 12 15l-6 1.7v-2L12 11V6a1.5 1.5 0 0 1 3 0v5l6 3.7v2L15 15l1.5 5.5-1.7-1-1.3-2-1.3 2-1.7 1Z" strokeLinejoin="round" strokeLinecap="round" />, className)

export const IconSyringe = ({ className }) =>
  wrap(
    <path
      d="m19 5-2-2-2.5 2.5 1 1-6.7 6.7-1-1-1.4 1.4 1 1L4 17l3 3 2.6-2.6 1 1 1.4-1.4-1-1 6.7-6.7 1 1L21 7.5Zm-4.5.5 3 3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    className,
  )

export const IconWrench = ({ className }) =>
  wrap(
    <path
      d="M14.7 6.3a4 4 0 0 0-5.4 4.9L4 16.5V20h3.5l5.3-5.3a4 4 0 0 0 4.9-5.4l-2.6 2.6-2-2Z"
      strokeLinejoin="round"
      strokeLinecap="round"
    />,
    className,
  )

export const IconRepeat = ({ className }) =>
  wrap(<path d="M17 2.5 20 5.5 17 8.5M20 5.5H8a4 4 0 0 0-4 4V11M7 21.5 4 18.5 7 15.5M4 18.5h12a4 4 0 0 0 4-4V13" strokeLinecap="round" strokeLinejoin="round" />, className)

export const IconGem = ({ className }) =>
  wrap(<path d="M4 8.5 8 4h8l4 4.5-8 11.5-8-11.5Z M4 8.5h16M9.5 4l-1.7 4.5M14.5 4l1.7 4.5" strokeLinejoin="round" strokeLinecap="round" />, className)

export const IconHeartPulse = ({ className }) =>
  wrap(
    <path
      d="M12 20.5s-7.5-4.6-9.7-9.2C1 8.1 2.3 4.8 5.4 4.1c2-.4 3.7.6 4.6 2.1.5-.1 1.3-.1 1.8 0 .9-1.5 2.6-2.5 4.6-2.1 3.1.7 4.4 4 3.1 7.2C17.5 15.9 12 20.5 12 20.5ZM6.5 12h2.3l1.2-2 1.6 3.4 1-1.4h3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />,
    className,
  )

export const IconShieldCheck = ({ className }) =>
  wrap(<path d="M12 3.5 5 6v5.5c0 4.7 3 7.9 7 9.5 4-1.6 7-4.8 7-9.5V6l-7-2.5ZM9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />, className)

export const IconUser = ({ className }) =>
  wrap(<><circle cx="12" cy="8" r="3.2" /><path d="M5.5 20c1-3.4 3.4-5 6.5-5s5.5 1.6 6.5 5" strokeLinecap="round" /></>, className)

export const IconChart = ({ className }) =>
  wrap(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" strokeLinecap="round" /></>, className)

export const IconPdf = ({ className }) =>
  wrap(
    <>
      <path d="M6 3h8l4 4v14H6V3Z" strokeLinejoin="round" />
      <path d="M14 3v4h4" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h4" strokeLinecap="round" />
    </>,
    className,
  )

export const IconDollar = ({ className }) =>
  wrap(<><circle cx="12" cy="12" r="9" /><path d="M12 6.5v11M9.5 9.4c0-1.2 1.1-2.1 2.5-2.1s2.5.8 2.5 2c0 3-5 1.9-5 4.8 0 1.2 1.1 2 2.5 2s2.5-.9 2.5-2.1" strokeLinecap="round" /></>, className)

export const IconShirt = ({ className }) =>
  wrap(<path d="M8 4 5 6.5 3 9.5l3 2V20h12V11.5l3-2-2-3L16 4l-2 2h-4L8 4Z" strokeLinejoin="round" strokeLinecap="round" />, className)

export const IconChevronDown = ({ className }) =>
  wrap(<path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />, className)

export const IconChevronRight = ({ className }) =>
  wrap(<path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />, className)

export const IconMenu = ({ className }) =>
  wrap(<path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeWidth="2" />, className)

export const IconClose = ({ className }) =>
  wrap(<path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" strokeWidth="2" />, className)

export const IconArrowUpRight = ({ className }) =>
  wrap(<path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />, className)

export const IconArrowRight = ({ className }) =>
  wrap(<path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />, className)

export const IconHelp = ({ className }) =>
  wrap(<><circle cx="12" cy="12" r="9" /><path d="M9.5 9.2a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.1.9-1.1 1.7" strokeLinecap="round" /><circle cx="12" cy="16.5" r=".9" fill="currentColor" stroke="none" /></>, className)

export const IconLifeBuoy = ({ className }) =>
  wrap(<path d="M12 21s-7-4.5-9-9c-1.3-2.7.1-6 3.2-6.6C8 4.9 10 6 11 7.6 12 6 14 4.9 15.8 5.4c3.1.6 4.5 3.9 3.2 6.6-2 4.5-9 9-9 9Z" strokeLinejoin="round" />, className)

export const IconClipboard = ({ className }) =>
  wrap(
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9V4Z" />
      <path d="M8.5 12h7M8.5 15.5h4.5" strokeLinecap="round" />
    </>,
    className,
  )

export const IconGraduation = ({ className }) =>
  wrap(<><path d="M12 4 2 9l10 5 8-4v6" strokeLinejoin="round" /><path d="M6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" strokeLinejoin="round" /></>, className)

export const IconUtensils = ({ className }) =>
  wrap(<path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M17 3c-2 1-2 4-2 6s.5 3 2 3v8" strokeLinecap="round" strokeLinejoin="round" />, className)

export const IconClock = ({ className }) =>
  wrap(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" /></>, className)

export const IconSend = ({ className }) =>
  wrap(<path d="m3 11 18-8-8 18-2.5-7.5L3 11Z" strokeLinejoin="round" strokeLinecap="round" />, className)

export const IconUpload = ({ className }) =>
  wrap(<><path d="M12 15V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" /></>, className)

export const IconCheck = ({ className }) =>
  wrap(<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />, className)

export const IconSparkle = ({ className }) =>
  wrap(<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" strokeLinecap="round" />, className)
