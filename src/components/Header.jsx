import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { MODULES } from '../data/menuData.js'
import { IconMenu, IconClose, IconChevronDown } from './icons.jsx'

const heartLogo = <img src={`${import.meta.env.BASE_URL}img/logo-latam.png`} alt="LATAM" className="h-7 w-15 flex-shrink-0 object-contain" />

// Un acento de marca por categoría para diferenciarlas visualmente en el header.
const MODULE_ACCENTS = {
  'gestion-personal': {
    text: 'text-latam-diavivo',
    hoverText: 'hover:text-latam-diavivo',
    bg: 'bg-latam-diavivo',
    border: 'border-latam-diavivo',
  },
  'mi-rol': {
    text: 'text-latam-estrellada',
    hoverText: 'hover:text-latam-estrellada',
    bg: 'bg-latam-estrellada',
    border: 'border-latam-estrellada',
  },
  'gestion-operacional': {
    text: 'text-latam-profunda',
    hoverText: 'hover:text-latam-profunda',
    bg: 'bg-latam-profunda',
    border: 'border-latam-profunda',
  },
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [openMenu, setOpenMenu] = useState(null) // desktop mega-menu key
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileExpanded, setMobileExpanded] = useState(null)
  const wrapRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // `location.key` cambia en CADA navegación (incluida cuando solo cambia
  // `?item=` dentro del mismo módulo) — a diferencia de `pathname`, que se
  // quedaba igual y por eso el header no se cerraba al elegir una opción.
  useEffect(() => {
    setMobileOpen(false)
    setOpenMenu(null)
  }, [location.key])

  // Al cerrarse el drawer (por cualquier motivo), se olvidan los
  // desplegables internos para que la próxima vez que se abra arranque
  // todo contraído.
  useEffect(() => {
    if (!mobileOpen) setMobileExpanded(null)
  }, [mobileOpen])

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const solid = scrolled || mobileOpen

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 animate-fadeIn bg-latam-profunda/40 backdrop-blur-sm [animation-duration:.2s] lg:hidden"
        />
      )}
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
          solid ? 'border-slate-200 bg-white/90 shadow-sm backdrop-blur-md' : 'border-transparent bg-transparent'
        }`}
      >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          {heartLogo}
          <span className="flex flex-col leading-tight">
            <span className={`text-[18px] font-bold transition-colors ${solid ? 'text-latam-estrellada' : 'text-white'}`}>LATAM</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav ref={wrapRef} className="hidden items-center gap-7 lg:flex">
          <NavItem to="/" label="Inicio" scrolled={solid} />
          {MODULES.map((mod, i) => {
            const accent = MODULE_ACCENTS[mod.key]
            const isActive = openMenu === mod.key || location.pathname.startsWith(mod.path)
            return (
              <div key={mod.key} className="relative">
                <button
                  onClick={() => setOpenMenu((o) => (o === mod.key ? null : mod.key))}
                  className={`flex items-center gap-1 py-2 text-[14px] font-bold transition ${
                    isActive
                      ? solid ? accent.text : 'text-white'
                      : solid ? 'text-slate-700 hover:text-latam-estrellada' : 'text-white/85 hover:text-white'
                  }`}
                >
                  {mod.label}
                  <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${openMenu === mod.key ? 'rotate-180' : ''}`} />
                </button>
                {isActive && <span className={`absolute -bottom-[1px] left-0 right-0 h-[3px] rounded-full ${accent.bg}`} />}

                {openMenu === mod.key && (
                  <div
                    className={`absolute top-[calc(100%+14px)] z-50 w-72 max-w-[90vw] rounded-2xl border-t-4 bg-white p-4 shadow-card animate-fadeUp ${accent.border} ${
                      i === MODULES.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    <ul className="flex flex-col gap-1">
                      {mod.groups.flatMap((group) => group.items).map((item) => (
                        <li key={item.id}>
                          <MenuLink
                            item={item}
                            to={`${mod.path}?item=${item.id}`}
                            className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13.5px] font-semibold text-slate-600 transition hover:bg-slate-50 ${accent.hoverText}`}
                          >
                            <item.icon className={`h-4 w-4 flex-shrink-0 ${accent.text}`} />
                            {item.label}
                          </MenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Mobile toggle */}
        <button
          className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors lg:hidden ${
            solid ? 'text-latam-estrellada active:bg-slate-100' : 'text-white active:bg-white/10'
          }`}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Abrir menú"
        >
          {mobileOpen ? <IconClose className="h-6 w-6" /> : <IconMenu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out lg:hidden ${
          mobileOpen ? 'grid-rows-[1fr] border-t border-slate-100' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="max-h-[75vh] overflow-y-auto bg-white px-4 pb-[env(safe-area-inset-bottom)] pt-2">
            <MobileLink to="/" label="Inicio" />
            {MODULES.map((mod) => {
              const accent = MODULE_ACCENTS[mod.key]
              const isExpanded = mobileExpanded === mod.key
              return (
                <div key={mod.key} className="border-b border-slate-100">
                  <button
                    onClick={() => setMobileExpanded((k) => (k === mod.key ? null : mod.key))}
                    className={`-mx-3 flex w-[calc(100%+1.5rem)] items-center justify-between rounded-xl px-3 py-3 text-[15px] font-bold transition ${
                      isExpanded ? `${accent.bg} text-white` : 'text-slate-800'
                    }`}
                  >
                    {mod.label}
                    <IconChevronDown
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'text-white' : accent.text} ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <div className="flex flex-col gap-4 pb-4">
                        <ul className="flex flex-col">
                          {mod.groups.flatMap((group) => group.items).map((item) => (
                            <li key={item.id}>
                              <MenuLink
                                item={item}
                                to={`${mod.path}?item=${item.id}`}
                                className="flex items-center gap-3 rounded-lg py-2.5 text-[14px] font-semibold text-slate-600 active:bg-slate-50"
                              >
                                <item.icon className={`h-4 w-4 flex-shrink-0 ${accent.text}`} />
                                {item.label}
                              </MenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      </header>
    </>
  )
}

function NavItem({ to, label, scrolled }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative py-2 text-[14px] font-bold transition ${
          isActive
            ? 'text-latam-coral'
            : scrolled ? 'text-slate-700 hover:text-latam-estrellada' : 'text-white/85 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && <span className="absolute -bottom-[1px] left-0 right-0 h-[3px] rounded-full bg-latam-coral" />}
        </>
      )}
    </NavLink>
  )
}

// Opciones del mega-menú/drawer: si el ítem trae externalUrl (ej. AppSheet),
// abre en pestaña nueva en vez de navegar dentro del portal.
function MenuLink({ item, to, className, children }) {
  if (item.externalUrl) {
    return (
      <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}

function MobileLink({ to, label }) {
  return (
    <Link to={to} className="block border-b border-slate-100 py-4 text-[15px] font-bold text-slate-800">
      {label}
    </Link>
  )
}
