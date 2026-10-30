"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ArrowDownToLine, ArrowRight, CalendarDays, Check, Clock3, FileClock, Printer, Search, UserRoundCheck, UserRoundX, X } from "lucide-react"
import { areas, type AttendanceRecord, type Worker } from "./data"
import { useHR } from "./store"
import { Button, DateText, PageHeading, Section, StatCard, Status, TableFrame } from "./ui"

const views = [
  ["/asistencia", "Asistencia diaria"],
  ["/asistencia/marcaciones", "Historial de marcaciones"],
  ["/asistencia/incidencias", "Incidencias"],
  ["/asistencia/resumen", "Resumen"],
]

function exportAttendance(rows: AttendanceRecord[], workers: Worker[]) {
  const workersById = new Map(workers.map((worker) => [worker.id, worker]))
  const values = [["Fecha", "Código", "Trabajador", "Área", "Sede", "Horario", "Ingreso", "Salida", "Horas", "Estado"], ...rows.map((record) => {
    const worker = workersById.get(record.workerId)
    return [record.date, worker?.code ?? "", worker ? `${worker.firstName} ${worker.lastName}` : "", worker?.area ?? "", record.site, record.schedule, record.inTime, record.outTime, record.hours, record.status]
  })]
  const text = values.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")
  const link = document.createElement("a")
  link.href = URL.createObjectURL(new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" }))
  link.download = "hme-asistencia.csv"
  link.click()
  URL.revokeObjectURL(link.href)
}

export function AttendancePage() {
  const { workers, attendance, site } = useHR()
  const pathname = usePathname()
  const params = useSearchParams()
  const pathView = pathname === "/asistencia/marcaciones" ? "historial" : pathname === "/asistencia/incidencias" ? "incidencias" : pathname === "/asistencia/resumen" ? "resumen" : "diaria"
  const [query, setQuery] = useState("")
  const [area, setArea] = useState("Todas")
  const [statusFilter, setStatusFilter] = useState(params.get("estado") ?? "Todos")
  const [selected, setSelected] = useState<AttendanceRecord | null>(null)
  const [reviewed, setReviewed] = useState<string[]>([])
  const records = useMemo(() => attendance.filter((record) => {
    const worker = workers.find(({ id }) => id === record.workerId)
    const haystack = `${worker?.code} ${worker?.firstName} ${worker?.lastName}`.toLowerCase()
    return worker && (site === "Todas las sedes" || record.site === site) && (!params.get("trabajador") || record.workerId === params.get("trabajador")) && (area === "Todas" || worker.area === area) && (statusFilter === "Todos" || record.status === statusFilter) && haystack.includes(query.toLowerCase())
  }), [attendance, workers, site, params, area, statusFilter, query])
  const incidents = records.filter(({ status }) => status !== "Puntual" && status !== "Justificado")
  const title = pathView === "diaria" ? "Control de asistencia" : pathView === "historial" ? "Historial de marcaciones" : pathView === "incidencias" ? "Incidencias de asistencia" : "Resumen de asistencia"
  const description = pathView === "diaria" ? "Consulta y seguimiento de las marcaciones del personal." : pathView === "historial" ? "Registros de ingreso y salida recibidos desde dispositivos biométricos." : pathView === "incidencias" ? "Revisa novedades e inconsistencias en los registros de asistencia." : "Resumen diario, semanal y mensual de asistencia por trabajador."
  const exportRows = pathView === "incidencias" ? incidents : records
  return <div className="page-stack">
    <PageHeading title={title} description={description} actions={<><Button variant="secondary" onClick={() => exportAttendance(exportRows, workers)}><ArrowDownToLine size={15} />Exportar</Button><Button variant="secondary" onClick={() => window.print()}><Printer size={15} />Imprimir</Button></>} />
    <nav className="subnav" aria-label="Vistas de asistencia">{views.map(([href, label]) => <Link key={href} className={(pathname === href) ? "subnav-active" : ""} href={href}>{label}</Link>)}</nav>
    {pathView === "diaria" && <div className="stats-grid six-stats"><StatCard label="Programados hoy" value={records.length} icon={<CalendarDays size={17} />} /><StatCard label="Presentes" value={records.filter(({ status }) => status !== "Ausente").length} icon={<UserRoundCheck size={17} />} tone="green" /><StatCard label="Ausentes" value={records.filter(({ status }) => status === "Ausente").length} icon={<UserRoundX size={17} />} tone="red" /><StatCard label="Con retraso" value={records.filter(({ status }) => status === "Con retraso").length} icon={<Clock3 size={17} />} tone="amber" /><StatCard label="Marcaciones incompletas" value={records.filter(({ status }) => status === "Marcación incompleta").length} icon={<FileClock size={17} />} tone="purple" /><StatCard label="Horas extra" value="12 h" icon={<Clock3 size={17} />} tone="gray" /></div>}
    {pathView === "diaria" && <Section title="Filtros de asistencia"><div className="filter-bar filter-spread"><label className="field-inline">Fecha <input type="date" defaultValue="2026-10-29" /></label><label className="search-box"><Search size={17} /><input placeholder="Trabajador o código HME..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Área" value={area} onChange={(event) => setArea(event.target.value)}><option value="Todas">Todas las áreas</option>{areas.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Estado de asistencia" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Todos</option>{["Puntual", "Con retraso", "Ausente", "Salida anticipada", "Marcación incompleta", "Pendiente de revisión", "Justificado"].map((item) => <option key={item}>{item}</option>)}</select><Button variant="ghost" onClick={() => { setQuery(""); setArea("Todas"); setStatusFilter("Todos") }}><X size={15} />Limpiar</Button></div></Section>}
    {pathView === "historial" && <Section title="Registros biométricos"><div className="filter-bar"><label className="field-inline">Desde <input type="date" defaultValue="2026-10-28" /></label><label className="field-inline">Hasta <input type="date" defaultValue="2026-10-29" /></label><label className="search-box"><Search size={17} /><input placeholder="Buscar trabajador..." value={query} onChange={(event) => setQuery(event.target.value)} /></label></div></Section>}
    {pathView === "incidencias" && <Section title="Incidencias para revisión"><div className="filter-bar"><label className="search-box"><Search size={17} /><input placeholder="Buscar trabajador..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Estado de revisión" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>Todos</option>{["Con retraso", "Ausente", "Salida anticipada", "Marcación incompleta", "Pendiente de revisión", "Justificado"].map((item) => <option key={item}>{item}</option>)}</select></div></Section>}
    {pathView === "resumen" && <Section title="Período de consulta"><div className="filter-bar"><label className="field-inline">Período <select><option>Diario</option><option>Semanal</option><option>Mensual</option></select></label><label className="field-inline">Mes <select><option>Octubre 2026</option><option>Septiembre 2026</option><option>Agosto 2026</option></select></label><Button variant="secondary"><CalendarDays size={15} />Actualizar resumen</Button></div></Section>}
    <Section title={pathView === "historial" ? "Historial de marcaciones biométricas" : pathView === "incidencias" ? "Incidencias del período" : pathView === "resumen" ? "Resumen por trabajador · Octubre 2026" : "Asistencia del día · 29/10/2026"}>
      <TableFrame empty={(pathView === "incidencias" ? incidents : records).length === 0} emptyText="No se encontraron registros para los filtros seleccionados.">
        {pathView === "historial" ? <table><thead><tr><th>Fecha y hora</th><th>Trabajador</th><th>Código biométrico</th><th>Dispositivo</th><th>Tipo</th><th>Sede</th><th>Observación</th></tr></thead><tbody>{records.flatMap((record) => {
          const worker = workers.find(({ id }) => id === record.workerId)!
          return [<tr key={`${record.id}-in`}><td>{record.date} {record.inTime}</td><td><Link className="table-primary hover-link" href={`/personal/${worker.id}`}>{worker.firstName} {worker.lastName}</Link><small className="table-secondary">{worker.code}</small></td><td>{worker.biometricId}</td><td>HME-{record.site.includes("Norte") ? "N" : record.site.includes("Sur") ? "S" : "P"}-01</td><td>Ingreso</td><td>{record.site}</td><td>{record.observation || "—"}</td></tr>, ...(record.outTime !== "—" && record.outTime !== "Pendiente" ? [<tr key={`${record.id}-out`}><td>{record.date} {record.outTime}</td><td>{worker.firstName} {worker.lastName}<small className="table-secondary">{worker.code}</small></td><td>{worker.biometricId}</td><td>HME-{record.site.includes("Norte") ? "N" : record.site.includes("Sur") ? "S" : "P"}-01</td><td>Salida</td><td>{record.site}</td><td>Registro de salida</td></tr>] : [])]
        })}</tbody></table> : pathView === "incidencias" ? <table><thead><tr><th>Fecha</th><th>Trabajador</th><th>Tipo de incidencia</th><th>Horario esperado</th><th>Marcación</th><th>Diferencia</th><th>Revisión</th><th>Acción</th></tr></thead><tbody>{incidents.map((record) => {
          const worker = workers.find(({ id }) => id === record.workerId)!
          const isReviewed = reviewed.includes(record.id)
          return <tr key={record.id}><td><DateText date={record.date} /></td><td><Link className="table-primary hover-link" href={`/personal/${worker.id}`}>{worker.firstName} {worker.lastName}</Link><small className="table-secondary">{worker.code}</small></td><td><Status>{record.status}</Status></td><td>{record.schedule}</td><td>{record.inTime} / {record.outTime}</td><td>{record.status === "Con retraso" ? "12 min" : "—"}</td><td><Status>{isReviewed ? "Revisado" : "Pendiente de revisión"}</Status></td><td><button className="text-link" onClick={() => setReviewed((prev) => isReviewed ? prev.filter((id) => id !== record.id) : [...prev, record.id])}><Check size={14} />{isReviewed ? "Deshacer" : "Marcar revisada"}</button></td></tr>
        })}</tbody></table> : pathView === "resumen" ? <table><thead><tr><th>Trabajador</th><th>Días programados</th><th>Días asistidos</th><th>Ausencias</th><th>Retrasos</th><th>Horas trabajadas</th><th>Horas extra</th></tr></thead><tbody>{records.map((record) => {
          const worker = workers.find(({ id }) => id === record.workerId)!
          return <tr key={record.id}><td><Link className="table-primary hover-link" href={`/personal/${worker.id}`}>{worker.firstName} {worker.lastName}</Link><small className="table-secondary">{worker.code}</small></td><td>22</td><td>{record.status === "Ausente" ? 20 : 21}</td><td>{record.status === "Ausente" ? 2 : 0}</td><td>{record.status === "Con retraso" ? 2 : 0}</td><td>168 h</td><td>{worker.id === "6" ? "4 h" : "0 h"}</td></tr>
        })}</tbody></table> : <table><thead><tr><th>Fecha</th><th>Código</th><th>Trabajador</th><th>Área / servicio</th><th>Sede</th><th>Horario</th><th>Ingreso</th><th>Salida</th><th>Horas</th><th>Estado</th><th></th></tr></thead><tbody>{records.map((record) => {
          const worker = workers.find(({ id }) => id === record.workerId)!
          return <tr key={record.id}><td><DateText date={record.date} /></td><td className="code-cell">{worker.code}</td><td><Link className="table-primary hover-link" href={`/personal/${worker.id}`}>{worker.firstName} {worker.lastName}</Link></td><td>{worker.area}</td><td>{record.site}</td><td>{record.schedule}</td><td>{record.inTime}</td><td>{record.outTime}</td><td>{record.hours}</td><td><Status>{record.status}</Status></td><td><button className="text-link" onClick={() => setSelected(record)}>Detalle <ArrowRight size={14} /></button></td></tr>
        })}</tbody></table>}
      </TableFrame>
    </Section>
    {selected && <div className="dialog-backdrop"><div className="dialog-card detail-dialog" role="dialog" aria-modal="true" aria-labelledby="attendance-detail-title"><div className="dialog-title-row"><h2 id="attendance-detail-title">Detalle de asistencia</h2><button className="icon-link" aria-label="Cerrar detalle" onClick={() => setSelected(null)}><X size={18} /></button></div>{(() => { const worker = workers.find(({ id }) => id === selected.workerId)!; return <><p className="muted-small">{worker.firstName} {worker.lastName} · {worker.code}</p><div className="details-grid"><Detail label="Fecha" value={<DateText date={selected.date} />} /><Detail label="Sede / área" value={`${selected.site} · ${worker.area}`} /><Detail label="Horario programado" value={selected.schedule} /><Detail label="Ingreso esperado" value={selected.schedule.split("–")[0]} /><Detail label="Ingreso biométrico" value={selected.inTime} /><Detail label="Salida esperada" value={selected.schedule.split("–")[1] ?? "—"} /><Detail label="Salida biométrica" value={selected.outTime} /><Detail label="Horas trabajadas" value={selected.hours} /><Detail label="Estado" value={<Status>{selected.status}</Status>} /><Detail label="Observaciones" value={selected.observation || "Sin observaciones"} /></div></> })()}<div className="dialog-actions"><Button variant="secondary" onClick={() => setSelected(null)}>Cerrar</Button></div></div></div>}
  </div>
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) { return <div className="info-item"><span>{label}</span><strong>{value}</strong></div> }
