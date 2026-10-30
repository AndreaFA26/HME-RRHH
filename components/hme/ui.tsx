import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft, ArrowRight, ChevronRight, Search } from "lucide-react"

export function PageHeading({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{actions && <div className="heading-actions">{actions}</div>}</div>
}

export function Button({ children, variant = "primary", href, onClick, type = "button", disabled = false }: { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; href?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean }) {
  const className = `button button-${variant}`
  if (href) return <Link className={className} href={href}>{children}</Link>
  return <button className={className} type={type} onClick={onClick} disabled={disabled}>{children}</button>
}

export function StatCard({ label, value, icon, href, tone = "blue" }: { label: string; value: string | number; icon: ReactNode; href?: string; tone?: string }) {
  const contents = <><span className={`stat-icon stat-${tone}`}>{icon}</span><span className="stat-copy"><span>{label}</span><strong>{value}</strong></span><ChevronRight className="stat-chevron" size={16} /></>
  return href ? <Link className="stat-card" href={href}>{contents}</Link> : <div className="stat-card">{contents}</div>
}

export function Status({ children }: { children: string }) {
  const key = children.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "-")
  return <span className={`status status-${key}`}>{children}</span>
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <section className="panel"><div className="panel-heading"><h2>{title}</h2>{action}</div>{children}</section>
}

export function TableFrame({ children, empty = false, emptyText = "No se encontraron registros." }: { children: ReactNode; empty?: boolean; emptyText?: string }) {
  return <div className="table-scroll">{empty ? <div className="empty-state"><Search size={20} /><span>{emptyText}</span></div> : children}</div>
}

export function DateText({ date }: { date: string }) {
  if (!date) return <>—</>
  const [year, month, day] = date.split("-")
  if (year && month && day) return <>{`${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`}</>
  return <>{date}</>
}

export function BreadcrumbBack({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="back-link"><ArrowLeft size={15} />{label}<ArrowRight size={13} /></Link>
}

export function Field({ label, required = false, children, hint }: { label: string; required?: boolean; children: ReactNode; hint?: string }) {
  return <label className="field"><span>{label}{required && <b> *</b>}</span>{children}{hint && <small>{hint}</small>}</label>
}
