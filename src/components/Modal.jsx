import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Generic centered overlay modal: closes on Escape or backdrop click. Children own their own close control.
//
// Rendered via a portal straight into <body>: if this were rendered in place,
// any ancestor with an active CSS `transform` (ex. the `animate-fadeUp` /
// `Reveal` wrappers used all over the app) becomes the containing block for
// this modal's `position: fixed`, so it ends up pinned to that ancestor's box
// instead of the real viewport — off-screen, only partly blurred. The portal
// sidesteps that entirely, regardless of where <Modal> gets used.
export default function Modal({ onClose, children, className = '' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-latam-profunda/60 p-4 backdrop-blur-sm animate-fadeUp [animation-duration:.25s]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl shadow-card ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
