"use client"

import { Activity, AlertCircle, ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, FileText, Plus, UserRoundCheck, UserRoundX, Users } from "lucide-react"
import Link from "next/link"
import { useHR } from "./store"
import { PageHeading, Section, StatCard, Status, TableFrame, Button } from "./ui"
import { DateText } from "./ui"

export function Dashboard() {
  const { workers, contracts, attendance, site } = useHR()
  const inSite = <T extends { site: string }>(record: T) => site === "Todas las sedes" || record.site === site
  const filteredWorkers = workers.filter(inSite)
  const filteredAttendance = attendance.filter(inSite)
  const filteredContracts = contracts.filter((contract) => {
    const worker = workers.find(({ id }) => id === contract.workerId)
    return worker && inSite(worker)
  })
  const active = filteredWorkers.filter(({ status }) => status === "Activo").length
  const inactive = filteredWorkers.filter(({ status }) => status === "Inactivo").length
  const present = filteredAttendance.filter(({ status }) => status !== "Ausente").length
  const absent = filteredAttendance.filter(({ status }) => status === "Ausente").length
  const late = filteredAttendance.filter(({ status }) => status === "Con retraso").length
  const due = filteredContracts.filter(({ status }) => status === "Por vencer").length
  const siteRows = ["Sede principal", "Sede Norte", "Sede Sur"].filter((name) => site === "Todas las sedes" || site === name).map((name) => {
    const scheduled = attendance.filter((item) => item.site === name)
    return { name, scheduled: scheduled.length, present: scheduled.filter(({ status }) => status !== "Ausente").length, absent: scheduled.filter(({ status }) => status === "Ausente").length, late: scheduled.filter(({ status }) => status === "Con retraso").length, incomplete: scheduled.filter(({ status }) => status === "Marcación incompleta").length }
  })
  const upcoming = filteredContracts.filter(({ status }) => status === "Por vencer").slice(0, 5)

  return <div className="page-stack">
    <PageHeading title="Panel principal — Recursos Humanos" description="Resumen general del personal del Hospital María Esperanza." actions={<span className="today-chip"><Clock3 size={15} />{new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/La_Paz" }).format(new Date())}</span>} />
    <div className="stats-grid six-stats">
      <StatCard label="Trabajadores activos" value={active} icon={<Users size={18} />} href="/personal?estado=Activo" />
      <StatCard label="Trabajadores inactivos" value={inactive} icon={<UserRoundX size={18} />} tone="gray" href="/personal?estado=Inactivo" />
      <StatCard label="Presentes hoy" value={present} icon={<UserRoundCheck size={18} />} tone="green" href="/asistencia" />
      <StatCard label="Ausentes hoy" value={absent} icon={<AlertCircle size={18} />} tone="red" href="/asistencia?estado=Ausente" />
      <StatCard label="Con retraso" value={late} icon={<Clock3 size={18} />} tone="amber" href="/asistencia?estado=Con%20retraso" />
      <StatCard label="Contratos por vencer" value={due} icon={<FileText size={18} />} tone="purple" href="/contratos?estado=Por%20vencer" />
    </div>

    <Section title="Resumen de asistencia del día" action={<Link className="text-link" href="/asistencia">Ver asistencia <ArrowRight size={14} /></Link>}>
      <TableFrame><table><thead><tr><th>Sede</th><th>Personal programado</th><th>Presentes</th><th>Ausentes</th><th>Con retraso</th><th>Sin marcación completa</th></tr></thead><tbody>
        {siteRows.map((row) => <tr key={row.name}><td className="strong-cell">{row.name}</td><td>{row.scheduled}</td><td>{row.present}</td><td>{row.absent}</td><td>{row.late}</td><td>{row.incomplete}</td></tr>)}
        {site === "Todas las sedes" && <tr className="total-row"><td>Total general</td><td>{filteredAttendance.length}</td><td>{present}</td><td>{absent}</td><td>{late}</td><td>{filteredAttendance.filter(({ status }) => status === "Marcación incompleta").length}</td></tr>}
      </tbody></table></TableFrame>
    </Section>

    <div className="dashboard-two-col">
      <Section title="Próximos vencimientos de contratos" action={<Link className="text-link" href="/contratos">Ver contratos <ArrowRight size={14} /></Link>}>
        <TableFrame empty={upcoming.length === 0} emptyText="No hay vencimientos próximos para esta sede."><table><thead><tr><th>Trabajador</th><th>Cargo</th><th>Vencimiento</th><th>Estado</th><th></th></tr></thead><tbody>{upcoming.map((contract) => {
          const worker = workers.find(({ id }) => id === contract.workerId)
          if (!worker) return null
          return <tr key={contract.id}><td><span className="table-primary">{worker.firstName} {worker.lastName}</span><small className="table-secondary">{worker.code}</small></td><td>{worker.title}</td><td><DateText date={contract.endDate} /></td><td><Status>{contract.status}</Status></td><td><Link href={`/contratos/${contract.id}`} className="icon-link" aria-label={`Ver contrato ${contract.number}`}><ArrowRight size={16} /></Link></td></tr>
        })}</tbody></table></TableFrame>
      </Section>
      <Section title="Novedades recientes" action={<span className="muted-small">Últimos movimientos</span>}>
        <div className="activity-list">
          <div className="activity-item"><span className="activity-icon"><UserRoundCheck size={16} /></span><div><strong>Nuevo registro de personal</strong><span>Se incorporó Lucía Arce Montaño</span><small>Hace 2 horas</small></div><Status>Registrado</Status></div>
          <div className="activity-item"><span className="activity-icon activity-warn"><FileText size={16} /></span><div><strong>Contrato próximo a vencer</strong><span>HME-CT-0002 · Carlos Mamani</span><small>Hoy, 09:15</small></div><Status>Por vencer</Status></div>
          <div className="activity-item"><span className="activity-icon activity-alert"><Activity size={16} /></span><div><strong>Marcación incompleta</strong><span>Jorge Choque · Falta registro de salida</span><small>Hoy, 08:42</small></div><Status>Pendiente de revisión</Status></div>
        </div>
      </Section>
    </div>

    <Section title="Accesos rápidos"><div className="quick-links">
      <Button href="/personal/nuevo"><Plus size={16} />Registrar trabajador</Button>
      <Button href="/personal" variant="secondary"><Users size={16} />Ver trabajadores</Button>
      <Button href="/asistencia" variant="secondary"><Clock3 size={16} />Consultar asistencia</Button>
      <Button href="/contratos/nuevo" variant="secondary"><BriefcaseBusiness size={16} />Registrar contrato</Button>
    </div></Section>
    <div className="demo-disclaimer"><CheckCircle2 size={16} /><span>Prototipo con información ficticia. Los cambios se conservan únicamente durante esta sesión de demostración.</span></div>
  </div>
}
