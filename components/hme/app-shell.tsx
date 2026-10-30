"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Bell, BriefcaseBusiness, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, FileText, LayoutDashboard, Menu, Settings, Users, X, Clock3, WalletCards, UserRoundPlus, ChartNoAxesColumn } from "lucide-react"
import { sites } from "./data"
import { useHR } from "./store"

const navigation = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/personal", label: "Gestión del personal", icon: Users },
  { href: "/asistencia", label: "Control de asistencia", icon: Clock3 },
  { href: "/contratos", label: "Gestión de contratos", icon: BriefcaseBusiness },
  { href: "/horarios", label: "Horarios y turnos", icon: CalendarDays },
  { href: "/permisos", label: "Permisos y vacaciones", icon: ClipboardList },
  { href: "/planillas", label: "Planillas y remuneraciones", icon: WalletCards },
  { href: "/reclutamiento", label: "Reclutamiento y selección", icon: UserRoundPlus },
  { href: "/reportes", label: "Reportes", icon: ChartNoAxesColumn },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

const titles: Record<string, string> = {
  "/": "Panel principal",
  "/personal": "Gestión del personal",
  "/personal/nuevo": "Registrar nuevo trabajador",
  "/asistencia": "Control de asistencia",
  "/asistencia/marcaciones": "Historial de marcaciones",
  "/asistencia/incidencias": "Incidencias de asistencia",
  "/asistencia/resumen": "Resumen de asistencia",
  "/contratos": "Gestión de contratos",
  "/contratos/nuevo": "Registrar contrato",
  "/horarios": "Horarios y turnos",
  "/permisos": "Permisos, licencias y vacaciones",
  "/planillas": "Planillas y remuneraciones",
  "/reclutamiento": "Reclutamiento y selección",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { site, setSite } = useHR()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const title = titles[pathname] ?? (pathname.startsWith("/personal/") ? "Expediente del trabajador" : pathname.startsWith("/contratos/") ? "Detalle del contrato" : "Recursos Humanos")
  const dateLabel = new Intl.DateTimeFormat("es-BO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/La_Paz" }).format(new Date())

  return <div className={`app-frame ${collapsed ? "sidebar-collapsed" : ""}`}>
    {mobileOpen && <button className="mobile-scrim" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)} />}
    <aside className={`sidebar ${mobileOpen ? "sidebar-mobile-open" : ""}`}>
      <div className="brand-row">
        <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-10-29%20at%2010.31.17%20PM-IT6jKvGsgTDtb0f62KHmdUtsOeTcbm.jpeg" alt="Hospital María Esperanza" className="brand-logo" />
        <button className="mobile-close" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}><X size={18} /></button>
      </div>
      <div className="system-label"><span className="system-mark"><Activity size={16} /></span><span className="system-name">RECURSOS HUMANOS<small>Sistema administrativo</small></span></div>
      <div className="nav-caption">MENÚ PRINCIPAL</div>
      <nav className="main-nav" aria-label="Navegación principal">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined} className={`nav-link ${active ? "nav-active" : ""}`} onClick={() => setMobileOpen(false)}><Icon size={18} /><span>{label}</span></Link>
        })}
      </nav>
      <div className="sidebar-footer"><div className="connection-dot" />Prototipo · datos de demostración</div>
      <button className="collapse-button" aria-label={collapsed ? "Expandir menú" : "Contraer menú"} onClick={() => setCollapsed(!collapsed)}>{collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}<span>{collapsed ? "Expandir" : "Contraer menú"}</span></button>
    </aside>
    <div className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu" aria-label="Abrir menú" onClick={() => setMobileOpen(true)}><Menu size={20} /></button><div><span className="topbar-section">{title}</span><span className="topbar-date">{dateLabel}</span></div></div>
        <div className="topbar-right">
          <label className="site-select"><span>Sede</span><select aria-label="Seleccionar sede" value={site} onChange={(event) => setSite(event.target.value)}>{sites.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
          <button className="notification-button" aria-label="Notificaciones"><Bell size={18} /><i /></button>
          <div className="profile-wrap"><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="profile-avatar">GT</span><span className="profile-copy"><strong>Gabriela Torrez</strong><small>Personal de RR. HH.</small></span><ChevronDown size={15} /></button>{profileOpen && <div className="profile-menu"><strong>Gabriela Torrez Cárdenas</strong><span>Personal de Recursos Humanos</span><span className="demo-note">Acceso de demostración</span></div>}</div>
        </div>
      </header>
      <main className="content-area">{children}</main>
      <footer className="page-footer">Hospital María Esperanza <span>·</span> Sistema de Recursos Humanos <span>·</span> Versión de demostración</footer>
    </div>
  </div>
}
