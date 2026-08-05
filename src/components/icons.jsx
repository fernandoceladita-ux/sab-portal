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

export const IconInfo = ({ className }) =>
  wrap(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" strokeLinecap="round" /><circle cx="12" cy="7.7" r=".9" fill="currentColor" stroke="none" /></>, className)

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

export const IconPlay = ({ className }) => wrap(<path d="M7 4.5v15l13-7.5Z" strokeLinejoin="round" strokeLinecap="round" fill="currentColor" />, className)

export const IconSend = ({ className }) =>
  wrap(<path d="m3 11 18-8-8 18-2.5-7.5L3 11Z" strokeLinejoin="round" strokeLinecap="round" />, className)

export const IconUpload = ({ className }) =>
  wrap(<><path d="M12 15V4M8 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" /></>, className)

export const IconDownload = ({ className }) =>
  wrap(<><path d="M12 4v11M8 11l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" /></>, className)

export const IconCheck = ({ className }) =>
  wrap(<path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />, className)

export const IconSparkle = ({ className }) =>
  wrap(<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" strokeLinecap="round" />, className)

export const IconStar = ({ className }) =>
  wrap(<path d="m12 3.5 2.2 4.6 5 .7-3.6 3.6.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.6 5-.7L12 3.5Z" strokeLinejoin="round" strokeLinecap="round" />, className)

export const IconAlertTriangle = ({ className }) =>
  wrap(
    <>
      <path d="M12 3.5 2.5 20h19L12 3.5Z" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M12 10v4.3" strokeLinecap="round" />
      <circle cx="12" cy="17.2" r=".9" fill="currentColor" stroke="none" />
    </>,
    className,
  )

export const IconMail = ({ className }) =>
  wrap(
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    className,
  )

export const IconHome = ({ className }) =>
  wrap(
    <>
      <path d="M4 11 12 4l8 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" strokeLinejoin="round" />
      <path d="M10 19v-5h4v5" strokeLinejoin="round" />
    </>,
    className,
  )

export const IconSmartphone = ({ className }) =>
  wrap(
    <>
      <rect x="6" y="2.5" width="12" height="19" rx="2.2" />
      <path d="M10.5 18h3" strokeLinecap="round" />
    </>,
    className,
  )

export const IconKey = ({ className }) =>
  wrap(
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="M11 11 20 20M16.5 15.5 19 18M14 18l2 2" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    className,
  )

export const IconQrCode = ({ className }) =>
  wrap(
    <>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1" />
      <path d="M14.5 14.5h2.5v2.5h-2.5zM19.5 14.5v2M14.5 19.5h2.5M19.5 19.5v-.01" strokeLinecap="round" strokeLinejoin="round" />
    </>,
    className,
  )

export const IconWifi = ({ className }) =>
  wrap(
    <>
      <path d="M3 8.5a13 13 0 0 1 18 0" strokeLinecap="round" />
      <path d="M6.2 12a8.5 8.5 0 0 1 11.6 0" strokeLinecap="round" />
      <path d="M9.5 15.3a4 4 0 0 1 5 0" strokeLinecap="round" />
      <circle cx="12" cy="18.3" r="1" fill="currentColor" stroke="none" />
    </>,
    className,
  )

export const IconSearch = ({ className }) =>
  wrap(<><circle cx="10.5" cy="10.5" r="6.5" /><path d="m20 20-4.3-4.3" strokeLinecap="round" /></>, className)

export const IconWhatsApp = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className || 'w-5 h-5'} fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.41-1.42a9.9 9.9 0 0 0 4.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.05c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.11.11-1.79-.11a16.4 16.4 0 0 1-1.58-.58c-2.79-1.2-4.6-4.03-4.74-4.22-.14-.18-1.13-1.5-1.13-2.87 0-1.36.71-2.03.97-2.3.24-.28.53-.35.71-.35h.51c.16 0 .38-.06.6.45s.72 1.77.78 1.9c.06.12.1.27.02.44-.08.16-.12.27-.24.42-.12.14-.25.32-.36.43-.12.12-.24.25-.1.5.14.24.6 1 1.3 1.62.9.79 1.65 1.04 1.9 1.16.24.12.38.1.53-.06.14-.16.6-.7.76-.94.16-.24.32-.2.53-.12.22.08 1.38.65 1.62.77.24.12.4.18.46.28.06.1.06.6-.18 1.28Z" />
  </svg>
)
