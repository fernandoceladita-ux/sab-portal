import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { MODULES } from '../data/menuData.js'
import { IconMenu, IconClose, IconChevronDown } from './icons.jsx'

const heartLogo = <img src={`${import.meta.env.BASE_URL}img/logo-latam.png`} alt="LATAM" className="h-7 w-15 flex-shrink-0 object-contain" />

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

  useEffect(() => {
    setMobileOpen(false)
    setOpenMenu(null)
  }, [location.pathname])

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpenMenu(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled ? 'border-slate-200 bg-white/95 shadow-sm backdrop-blur' : 'border-transparent bg-white/80 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          {heartLogo}
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-extrabold text-latam-estrellada">SAB Perú</span>
            <span className="text-[11px] font-medium text-slate-400">Servicio a Bordo · LATAM</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav ref={wrapRef} className="hidden items-center gap-7 lg:flex">
          <NavItem to="/" label="Inicio" />
          {MODULES.map((mod) => (
            <div key={mod.key} className="relative">
              <button
                onClick={() => setOpenMenu((o) => (o === mod.key ? null : mod.key))}
                className={`flex items-center gap-1 py-2 text-[14px] font-bold transition ${
                  openMenu === mod.key || location.pathname.startsWith(mod.path)
                    ? 'text-latam-coral'
                    : 'text-slate-700 hover:text-latam-estrellada'
                }`}
              >
                {mod.label}
                <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${openMenu === mod.key ? 'rotate-180' : ''}`} />
              </button>
              {(openMenu === mod.key || location.pathname.startsWith(mod.path)) && (
                <span className="absolute -bottom-[1px] left-0 right-0 h-[3px] rounded-full bg-latam-coral" />
              )}

              {openMenu === mod.key && (
                <div className="absolute left-1/2 top-[calc(100%+14px)] z-50 w-[560px] -translate-x-1/2 rounded-2xl border-t-4 border-latam-coral bg-white p-6 shadow-card animate-fadeUp">
                  <div className="grid grid-cols-2 gap-8">
                    {mod.groups.map((group) => (
                      <div key={group.title}>
                        <p className="mb-3 border-b border-slate-100 pb-2 text-[13px] font-extrabold text-latam-estrellada">
                          {group.title}
                        </p>
                        <ul className="flex flex-col gap-1">
                          {group.items.map((item) => (
                            <li key={item.id}>
                              <Link
                                to={`${mod.path}?item=${item.id}`}
                                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13.5px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-latam-estrellada"
                              >
                                <item.icon className="h-4 w-4 flex-shrink-0 text-latam-coral" />
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="flex h-11 w-11 items-center justify-center rounded-xl text-latam-estrellada active:bg-slate-100 lg:hidden"
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
            {MODULES.map((mod) => (
              <div key={mod.key} className="border-b border-slate-100">
                <button
                  onClick={() => setMobileExpanded((k) => (k === mod.key ? null : mod.key))}
                  className="flex w-full items-center justify-between py-4 text-[15px] font-bold text-slate-800"
                >
                  {mod.label}
                  <IconChevronDown
                    className={`h-4 w-4 text-latam-coral transition-transform ${mobileExpanded === mod.key ? 'rotate-180' : ''}`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: mobileExpanded === mod.key ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <div className="flex flex-col gap-4 pb-4">
                      {mod.groups.map((group) => (
                        <div key={group.title}>
                          <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-latam-estrellada/70">
                            {group.title}
                          </p>
                          <ul className="flex flex-col">
                            {group.items.map((item) => (
                              <li key={item.id}>
                                <Link
                                  to={`${mod.path}?item=${item.id}`}
                                  className="flex items-center gap-3 rounded-lg py-2.5 text-[14px] font-semibold text-slate-600 active:bg-slate-50"
                                >
                                  <item.icon className="h-4 w-4 flex-shrink-0 text-latam-coral" />
                                  {item.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `relative py-2 text-[14px] font-bold transition ${isActive ? 'text-latam-coral' : 'text-slate-700 hover:text-latam-estrellada'}`
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

function MobileLink({ to, label }) {
  return (
    <Link to={to} className="block border-b border-slate-100 py-4 text-[15px] font-bold text-slate-800">
      {label}
    </Link>
  )
}
