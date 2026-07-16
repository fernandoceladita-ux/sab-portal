import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PageWipeContext = createContext(null)

const MOBILE_BREAKPOINT = 640 // matches Tailwind's `sm`
const COVER_MS = 650
const REVEAL_MS = 380

// Provides wipeTo(path, colorClass, label, icon). On mobile it covers the
// screen with the module's brand color and shows its icon + name, swaps the
// route while hidden, then fades away to reveal the new page. On desktop it
// just navigates — the effect is mobile-only.
export function PageWipeProvider({ children }) {
  const [state, setState] = useState({ phase: 'idle', color: 'bg-latam-estrellada', label: '', icon: '' })
  const navigate = useNavigate()
  const timeoutRef = useRef(null)

  const wipeTo = useCallback(
    (to, color = 'bg-latam-estrellada', label = '', icon = '') => {
      const isMobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
      if (!isMobile) {
        navigate(to)
        window.scrollTo(0, 0)
        return
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      setState({ phase: 'covering', color, label, icon })
      timeoutRef.current = setTimeout(() => {
        navigate(to)
        window.scrollTo(0, 0)
        setState((s) => ({ ...s, phase: 'revealing' }))
        timeoutRef.current = setTimeout(() => {
          setState((s) => ({ ...s, phase: 'idle' }))
        }, REVEAL_MS)
      }, COVER_MS)
    },
    [navigate],
  )

  return (
    <PageWipeContext.Provider value={wipeTo}>
      {children}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[200] ease-out ${state.color} ${
          state.phase === 'covering'
            ? 'opacity-100 transition-opacity duration-[320ms]'
            : state.phase === 'revealing'
              ? 'opacity-0 transition-opacity duration-[380ms]'
              : 'opacity-0'
        }`}
      />

      {state.phase !== 'idle' && (
        <div className="pointer-events-none fixed inset-0 z-[210] flex flex-col items-center justify-center sm:hidden">
          <img src={state.icon} alt={state.label} className="w-56 max-w-[70vw] object-contain animate-fadeUp" />
        </div>
      )}
    </PageWipeContext.Provider>
  )
}

export function usePageWipe() {
  const ctx = useContext(PageWipeContext)
  if (!ctx) throw new Error('usePageWipe must be used within PageWipeProvider')
  return ctx
}
