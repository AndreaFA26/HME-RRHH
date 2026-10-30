"use client"

import { useMemo, useState, type FormEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowDownToLine, ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarDays, Check, ChevronDown, Eye, FileText, Filter, Pencil, Plus, Printer, Search, ShieldCheck, UserRound, UserRoundX, Users, X } from "lucide-react"
import { areas, categories, initialAttendance, sites, type Worker } from "./data"
import { useHR } from "./store"
import { Button, DateText, Field, PageHeading, Section, StatCard, Status, TableFrame } from "./ui"

const perPageOptions = [10, 20, 50]

function exportCsv(filename: string, rows: string[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function PersonnelPage() {
  const { workers, site, updateWorker } = useHR()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState(searchParams.get("estado") ?? "Todos")
  const [area, setArea] = useState("Todas")
  const [category, setCategory] = useState("Todas")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const filtered = useMemo(() => workers.filter((worker) => {
    const haystack = `${worker.code} ${worker.firstName} ${worker.lastName} ${worker.document}`.toLowerCase()
    return (site === "Todas las sedes" || worker.site === site) && (status === "Todos" || worker.status === status) && (area === "Todas" || worker.area === area) && (category === "Todas" || worker.category === category) && haystack.includes(query.toLowerCase())
  }), [workers, site, status, area, category, query])
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize)
  const clearFilters = () => { setQuery(""); setStatus("Todos"); setArea("Todas"); setCategory("Todas"); setPage(1) }
  const csvRows = [["Código", "Trabajador", "CI", "Cargo", "Área", "Sede", "Fecha de ingreso", "Estado"], ...filtered.map((worker) => [worker.code, `${worker.firstName} ${worker.lastName}`, worker.document, worker.title, worker.area, worker.site, worker.joined, worker.status])]

  return <div className="page-stack">
    <PageHeading title="Gestión del personal" description="Registro y administración de los trabajadores del Hospital María Esperanza." actions={<><Button variant="secondary" onClick={() => exportCsv("hme-personal.csv", csvRows)}><ArrowDownToLine size={16} />Exportar</Button><Button variant="secondary" onClick={() => window.print()}><Printer size={16} />Imprimir</Button><Button href="/personal/nuevo"><Plus size={16} />Nuevo trabajador</Button></>} />
    <div className="stats-grid four-stats">
      <StatCard label="Registrados" value={workers.length} icon={<Users size={18} />} />
      <StatCard label="Trabajadores activos" value={workers.filter((worker) => worker.status === "Activo").length} icon={<ShieldCheck size={18} />} tone="green" />
      <StatCard label="Trabajadores inactivos" value={workers.filter((worker) => worker.status === "Inactivo").length} icon={<UserRoundX size={18} />} tone="gray" />
      <StatCard label="Incorporados este mes" value="2" icon={<CalendarDays size={18} />} tone="purple" />
    </div>
    <Section title="Directorio de trabajadores">
      <div className="filter-bar"><label className="search-box"><Search size={17} /><input placeholder="Buscar por código, nombre o CI..." value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} /></label>
        <select aria-label="Área" value={area} onChange={(event) => { setArea(event.target.value); setPage(1) }}><option value="Todas">Todas las áreas</option>{areas.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Tipo de personal" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }}><option value="Todas">Todo el personal</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <select aria-label="Estado laboral" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1) }}><option>Todos</option><option>Activo</option><option>Inactivo</option></select>
        <Button variant="ghost" onClick={clearFilters}><X size={15} />Limpiar</Button>
      </div>
      <TableFrame empty={!visible.length} emptyText="No hay trabajadores que coincidan con la búsqueda."><table><thead><tr><th>Código</th><th>Trabajador</th><th>CI / documento</th><th>Cargo</th><th>Área / servicio</th><th>Sede</th><th>Ingreso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{visible.map((worker) => <tr key={worker.id}>
        <td className="code-cell">{worker.code}</td><td><div className="person-cell"><span className="person-avatar">{worker.firstName.charAt(0)}{worker.lastName.charAt(0)}</span><span><Link className="table-primary hover-link" href={`/personal/${worker.id}`}>{worker.firstName} {worker.lastName}</Link><small className="table-secondary">{worker.email}</small></span></div></td><td>{worker.document}</td><td>{worker.title}</td><td>{worker.area}</td><td>{worker.site}</td><td><DateText date={worker.joined} /></td><td><Status>{worker.status}</Status></td>
        <td><details className="row-menu"><summary aria-label={`Acciones para ${worker.firstName} ${worker.lastName}`}>•••</summary><div className="row-menu-panel"><Link href={`/personal/${worker.id}`}><Eye size={14} />Ver expediente</Link><Link href={`/personal/${worker.id}/editar`}><Pencil size={14} />Editar trabajador</Link><Link href={`/contratos?trabajador=${worker.id}`}><FileText size={14} />Ver contratos</Link><Link href={`/asistencia?trabajador=${worker.id}`}><CalendarDays size={14} />Ver asistencia</Link><button onClick={() => updateWorker(worker.id, { status: worker.status === "Activo" ? "Inactivo" : "Activo" })}>{worker.status === "Activo" ? <><UserRoundX size={14} />Cambiar a inactivo</> : <><Check size={14} />Reactivar trabajador</>}</button></div></details></td>
      </tr>)}</tbody></table></TableFrame>
      <div className="table-pagination"><span>{filtered.length === 0 ? "0 registros" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)} de ${filtered.length} trabajadores`}</span><div><label>Filas por página <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}>{perPageOptions.map((size) => <option key={size} value={size}>{size}</option>)}</select></label><button aria-label="Página anterior" disabled={page <= 1} onClick={() => setPage(page - 1)}><ArrowLeft size={15} /></button><span>Página {page} de {pageCount}</span><button aria-label="Página siguiente" disabled={page >= pageCount} onClick={() => setPage(page + 1)}><ArrowRight size={15} /></button></div></div>
    </Section>
  </div>
}

const blankWorker = (code: string): Omit<Worker, "id"> => ({ code, firstName: "", lastName: "", document: "", title: "", area: "Emergencias", site: "Sede principal", joined: "2026-10-29", status: "Activo", category: "Médicos", shift: "08:00–16:00", phone: "", email: "", specialty: "", professionalId: "", biometricId: "", modality: "Plazo fijo", superior: "", civilStatus: "", nationality: "Boliviana", birthDate: "", department: "La Paz", municipality: "La Paz", address: "", emergencyName: "", emergencyPhone: "", bank: "", account: "", education: "" })

export function WorkerFormPage({ workerId }: { workerId?: string }) {
  const { workers, addWorker, updateWorker } = useHR()
  const router = useRouter()
  const existing = workerId ? workers.find(({ id }) => id === workerId) : undefined
  const [formError, setFormError] = useState("")
  const [documentWarning, setDocumentWarning] = useState(false)
  const [fileName, setFileName] = useState("")
  if (workerId && !existing) return <MissingWorker />
  const current = existing ?? blankWorker(`HME-${String(workers.length + 1).padStart(4, "0")}`)
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const value = (key: string) => String(data.get(key) ?? "").trim()
    const candidate = value("document")
    if (workers.some((item) => item.document === candidate && item.id !== workerId)) { setDocumentWarning(true); setFormError("El número de documento ya existe en los registros de demostración."); return }
    const payload = {
      ...current,
      firstName: value("firstName"), lastName: value("lastName"), document: candidate, title: value("title"), area: value("area"), site: value("site"), joined: value("joined"), category: value("category"), shift: value("shift"), phone: value("phone"), email: value("email"), specialty: value("specialty"), professionalId: value("professionalId"), biometricId: value("biometricId"), modality: value("modality"), superior: value("superior"), civilStatus: value("civilStatus"), nationality: value("nationality"), birthDate: value("birthDate"), department: value("department"), municipality: value("municipality"), address: value("address"), emergencyName: value("emergencyName"), emergencyPhone: value("emergencyPhone"), bank: value("bank"), account: value("account"), education: value("education"), status: value("status") as Worker["status"],
    }
    if (!payload.firstName || !payload.lastName || !payload.document || !payload.title) { setFormError("Completa los campos obligatorios marcados con *."); return }
    if (existing) { updateWorker(existing.id, payload); router.push(`/personal/${existing.id}`) }
    else { const created = addWorker(payload); router.push(`/personal/${created.id}`) }
  }

  return <div className="page-stack">
    <Link href={existing ? `/personal/${existing.id}` : "/personal"} className="back-link"><ArrowLeft size={15} />Volver al directorio</Link>
    <PageHeading title={existing ? "Editar trabajador" : "Registrar nuevo trabajador"} description={existing ? `Actualiza los datos del expediente ${existing.code}.` : "Completa la información para crear un expediente de personal."} />
    <form className="form-layout" onSubmit={onSubmit}>
      <div className="form-main">
        <Section title="1. Datos personales"><div className="form-grid three-cols">
          <Field label="Código de trabajador"><input value={current.code} readOnly className="readonly-input" /></Field>
          <Field label="Nombres" required><input name="firstName" defaultValue={current.firstName} required /></Field>
          <Field label="Apellidos" required><input name="lastName" defaultValue={current.lastName} required /></Field>
          <Field label="Tipo de documento"><select name="documentType" defaultValue="Cédula de identidad"><option>Cédula de identidad</option><option>Pasaporte</option><option>Otro</option></select></Field>
          <Field label="Número de CI" required><input name="document" defaultValue={current.document} required onChange={(event) => { setDocumentWarning(workers.some((item) => item.document === event.target.value && item.id !== workerId)); setFormError("") }} /></Field>
          <Field label="Complemento"><input name="complement" placeholder="Ej. 1A" /></Field>
          <Field label="Fecha de nacimiento"><input name="birthDate" type="date" defaultValue={current.birthDate} /></Field>
          <Field label="Sexo"><select name="sex" defaultValue="No especificado"><option>No especificado</option><option>Femenino</option><option>Masculino</option></select></Field>
          <Field label="Estado civil"><select name="civilStatus" defaultValue={current.civilStatus || "Soltero/a"}><option>Soltero/a</option><option>Casado/a</option><option>Divorciado/a</option><option>Viudo/a</option></select></Field>
        </div>{documentWarning && <p className="inline-warning"><ShieldCheck size={15} />Este documento ya aparece en la lista de demostración.</p>}</Section>
        <Section title="2. Datos de contacto"><div className="form-grid three-cols">
          <Field label="Celular"><input name="phone" defaultValue={current.phone} /></Field><Field label="Teléfono alternativo"><input name="phoneAlt" /></Field><Field label="Correo personal"><input type="email" name="personalEmail" /></Field>
          <Field label="Correo institucional"><input type="email" name="email" defaultValue={current.email} /></Field><Field label="Departamento"><select name="department" defaultValue={current.department}><option>La Paz</option><option>Cochabamba</option><option>Santa Cruz</option><option>Oruro</option><option>Tarija</option><option>Potosí</option><option>Beni</option><option>Pando</option><option>Chuquisaca</option></select></Field>
          <Field label="Municipio"><input name="municipality" defaultValue={current.municipality} /></Field><Field label="Dirección" ><input name="address" defaultValue={current.address} /></Field><Field label="Referencia de domicilio"><input name="addressReference" /></Field>
        </div></Section>
        <Section title="3. Información laboral"><div className="form-grid three-cols">
          <Field label="Sede"><select name="site" defaultValue={current.site}>{sites.filter((site) => site !== "Todas las sedes").map((site) => <option key={site}>{site}</option>)}</select></Field>
          <Field label="Tipo de personal"><select name="category" defaultValue={current.category}>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Área o servicio"><select name="area" defaultValue={current.area}>{areas.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="Cargo" required><input name="title" defaultValue={current.title} required /></Field><Field label="Especialidad"><input name="specialty" defaultValue={current.specialty} /></Field><Field label="Matrícula profesional"><input name="professionalId" defaultValue={current.professionalId} /></Field>
          <Field label="Identificador biométrico"><input name="biometricId" defaultValue={current.biometricId} /></Field><Field label="Fecha de ingreso"><input name="joined" type="date" defaultValue={current.joined} /></Field><Field label="Modalidad"><select name="modality" defaultValue={current.modality}><option>Plazo fijo</option><option>Ítem</option><option>Consultoría</option><option>Eventual</option></select></Field>
          <Field label="Superior inmediato"><input name="superior" defaultValue={current.superior} /></Field><Field label="Jornada laboral"><select name="shift" defaultValue={current.shift}><option>08:00–16:00</option><option>07:00–15:00</option><option>15:00–23:00</option><option>19:00–07:00</option><option>Turno rotativo</option></select></Field><Field label="Estado laboral"><select name="status" defaultValue={current.status}><option>Activo</option><option>Inactivo</option></select></Field>
        </div></Section>
        <Section title="4. Formación académica"><div className="form-grid three-cols"><Field label="Nivel académico"><select name="education" defaultValue={current.education || "Licenciatura"}><option>Bachiller</option><option>Técnico superior</option><option>Licenciatura</option><option>Especialidad</option><option>Maestría</option><option>Doctorado</option></select></Field><Field label="Título obtenido"><input name="degree" /></Field><Field label="Institución"><input name="institution" /></Field><Field label="Año de titulación"><input type="number" name="graduationYear" min="1950" max="2026" /></Field><Field label="Número de título profesional"><input name="degreeNumber" /></Field><Field label="Especialidad"><input name="educationSpecialty" /></Field></div></Section>
        <Section title="5. Documentos adjuntos"><div className="form-grid two-cols"><Field label="Tipo de documento"><select name="fileType"><option>Carnet de identidad</option><option>Hoja de vida</option><option>Título profesional</option><option>Certificado</option><option>Matrícula profesional</option><option>Otro documento</option></select></Field><Field label="Archivo (PDF, JPG o PNG)"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /></Field></div>{fileName && <p className="muted-small">Seleccionado localmente: {fileName}. No se ha subido a un servidor.</p>}</Section>
        <Section title="6. Contacto de emergencia"><div className="form-grid three-cols"><Field label="Nombre completo"><input name="emergencyName" defaultValue={current.emergencyName} /></Field><Field label="Parentesco"><input name="relationship" placeholder="Ej. Madre" /></Field><Field label="Celular principal"><input name="emergencyPhone" defaultValue={current.emergencyPhone} /></Field></div></Section>
        <Section title="7. Información bancaria"><div className="form-grid three-cols"><Field label="Entidad bancaria"><select name="bank" defaultValue={current.bank || "Banco Unión"}><option>Banco Unión</option><option>Banco Nacional de Bolivia</option><option>Banco Mercantil Santa Cruz</option><option>Banco Bisa</option><option>Otro</option></select></Field><Field label="Número de cuenta"><input name="account" defaultValue={current.account} /></Field><Field label="Tipo de cuenta"><select name="accountType"><option>Ahorro</option><option>Corriente</option></select></Field><Field label="Titular"><input name="accountHolder" placeholder="Nombre completo" /></Field><Field label="Moneda"><select name="currency"><option>BOB — Bolivianos</option><option>USD — Dólares</option></select></Field></div></Section>
      </div>
      <aside className="form-aside"><Section title="Fotografía"><div className="photo-placeholder"><UserRound size={42} /><span>Sin fotografía</span></div><Field label="Seleccionar fotografía"><input type="file" accept="image/*" /></Field><small>La imagen queda seleccionada localmente durante esta demostración.</small></Section><Section title="Información del registro"><div className="form-summary"><div><span>Código de trabajador</span><strong>{current.code}</strong></div><div><span>Datos requeridos</span><strong>4 campos</strong></div><div><span>Almacenamiento</span><strong>Solo esta sesión</strong></div></div></Section></aside>
      <div className="form-actions"><Button href={existing ? `/personal/${existing.id}` : "/personal"} variant="secondary">Cancelar</Button><span>{formError && <span className="form-error">{formError}</span>}</span><Button type="submit">{existing ? "Guardar cambios" : "Registrar trabajador"}</Button></div>
    </form>
  </div>
}

const workerTabs = ["Datos personales", "Datos de contacto", "Información laboral", "Formación", "Documentos", "Emergencia", "Bancaria", "Contratos", "Asistencia", "Historial"]

export function WorkerDetailPage({ workerId }: { workerId: string }) {
  const { workers, contracts, attendance, updateWorker } = useHR()
  const [tab, setTab] = useState(workerTabs[0])
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const worker = workers.find(({ id }) => id === workerId)
  if (!worker) return <MissingWorker />
  const workerContracts = contracts.filter(({ workerId: id }) => id === worker.id)
  const workerAttendance = attendance.filter(({ workerId: id }) => id === worker.id)
  return <div className="page-stack">
    <Link href="/personal" className="back-link"><ArrowLeft size={15} />Volver al directorio</Link>
    <section className="worker-hero panel"><div className="person-avatar person-avatar-large">{worker.firstName.charAt(0)}{worker.lastName.charAt(0)}</div><div className="worker-identity"><div className="worker-name-line"><h1>{worker.firstName} {worker.lastName}</h1><Status>{worker.status}</Status></div><div className="worker-meta"><span>{worker.code}</span><span>{worker.title}</span><span>{worker.area}</span><span>{worker.site}</span><span>Ingreso: <DateText date={worker.joined} /></span></div></div><div className="worker-actions"><Button href={`/personal/${worker.id}/editar`} variant="secondary"><Pencil size={15} />Editar información</Button><Button variant="secondary" onClick={() => window.print()}><Printer size={15} />Imprimir ficha</Button><Button variant={worker.status === "Activo" ? "danger" : "primary"} onClick={() => setShowStatusDialog(true)}>{worker.status === "Activo" ? "Cambiar estado" : "Reactivar"}</Button></div></section>
    <div className="tab-list" role="tablist" aria-label="Información del trabajador">{workerTabs.map((item) => <button role="tab" aria-selected={tab === item} className={tab === item ? "tab-active" : ""} key={item} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === "Contratos" ? <Section title="Historial de contratos" action={<Button href={`/contratos/nuevo?trabajador=${worker.id}`}><Plus size={14} />Nuevo contrato</Button>}><TableFrame empty={!workerContracts.length}><table><thead><tr><th>Número</th><th>Modalidad</th><th>Inicio</th><th>Vencimiento</th><th>Estado</th><th>Acción</th></tr></thead><tbody>{workerContracts.map((contract) => <tr key={contract.id}><td className="code-cell">{contract.number}</td><td>{contract.modality}</td><td><DateText date={contract.startDate} /></td><td><DateText date={contract.endDate} /></td><td><Status>{contract.status}</Status></td><td><Link href={`/contratos/${contract.id}`} className="text-link">Abrir contrato <ArrowRight size={14} /></Link></td></tr>)}</tbody></table></TableFrame></Section>
      : tab === "Asistencia" ? <Section title="Marcaciones recientes" action={<Link className="text-link" href={`/asistencia?trabajador=${worker.id}`}>Ver historial completo <ArrowRight size={14} /></Link>}><TableFrame><table><thead><tr><th>Fecha</th><th>Ingreso</th><th>Salida</th><th>Horas</th><th>Estado</th><th>Observaciones</th></tr></thead><tbody>{workerAttendance.map((item) => <tr key={item.id}><td><DateText date={item.date} /></td><td>{item.inTime}</td><td>{item.outTime}</td><td>{item.hours}</td><td><Status>{item.status}</Status></td><td>{item.observation || "—"}</td></tr>)}</tbody></table></TableFrame></Section>
      : tab === "Historial" ? <Section title="Historial de cambios"><TableFrame><table><thead><tr><th>Fecha</th><th>Usuario responsable</th><th>Acción</th><th>Descripción</th></tr></thead><tbody><tr><td>29/10/2026</td><td>Gabriela Torrez</td><td>Consulta de expediente</td><td>Registro abierto en sesión de demostración</td></tr><tr><td><DateText date={worker.joined} /></td><td>Sistema HME</td><td>Registro de trabajador</td><td>Alta de expediente {worker.code}</td></tr></tbody></table></TableFrame></Section>
      : tab === "Documentos" ? <Section title="Documentos del trabajador"><div className="empty-state"><FileText size={20} /><span>No hay documentos cargados en este expediente de demostración.</span></div></Section>
      : <Section title={tab}><div className="details-grid">{tab === "Datos personales" ? <><Info label="Nombres" value={worker.firstName} /><Info label="Apellidos" value={worker.lastName} /><Info label="Documento" value={`CI ${worker.document}`} /><Info label="Fecha de nacimiento" value={<DateText date={worker.birthDate} />} /><Info label="Nacionalidad" value={worker.nationality} /><Info label="Estado civil" value={worker.civilStatus} /></> : tab === "Datos de contacto" ? <><Info label="Celular" value={worker.phone} /><Info label="Correo institucional" value={worker.email} /><Info label="Departamento" value={worker.department} /><Info label="Municipio" value={worker.municipality} /><Info label="Dirección" value={worker.address} /></> : tab === "Información laboral" ? <><Info label="Cargo" value={worker.title} /><Info label="Área / servicio" value={worker.area} /><Info label="Tipo de personal" value={worker.category} /><Info label="Sede" value={worker.site} /><Info label="Jornada" value={worker.shift} /><Info label="Modalidad" value={worker.modality} /><Info label="Especialidad" value={worker.specialty || "No registrada"} /><Info label="Matrícula profesional" value={worker.professionalId || "No aplica"} /><Info label="Código biométrico" value={worker.biometricId} /></> : tab === "Formación" ? <><Info label="Nivel académico" value={worker.education || "No registrado"} /><Info label="Título" value={worker.title} /></> : tab === "Emergencia" ? <><Info label="Contacto" value={worker.emergencyName} /><Info label="Celular" value={worker.emergencyPhone} /></> : <><Info label="Entidad bancaria" value={worker.bank} /><Info label="Número de cuenta" value={worker.account} /><Info label="Moneda" value="BOB — Bolivianos" /><p className="muted-small full-span">Información visible únicamente dentro de esta pestaña. Datos ficticios de demostración.</p></>}</div></Section>}
    {showStatusDialog && <div className="dialog-backdrop"><div className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="status-dialog-title"><h2 id="status-dialog-title">{worker.status === "Activo" ? "Cambiar a inactivo" : "Reactivar trabajador"}</h2><p>{worker.status === "Activo" ? `Se conservará el expediente de ${worker.firstName} ${worker.lastName}.` : "El trabajador volverá a figurar como activo en el directorio."}</p>{worker.status === "Activo" && <><Field label="Fecha de baja"><input type="date" defaultValue="2026-10-29" /></Field><Field label="Motivo"><select><option>Fin de contrato</option><option>Renuncia</option><option>Otro</option></select></Field><Field label="Observaciones"><textarea rows={3} /></Field></>}<div className="dialog-actions"><Button variant="secondary" onClick={() => setShowStatusDialog(false)}>Cancelar</Button><Button variant={worker.status === "Activo" ? "danger" : "primary"} onClick={() => { updateWorker(worker.id, { status: worker.status === "Activo" ? "Inactivo" : "Activo" }); setShowStatusDialog(false) }}>Confirmar cambio</Button></div></div></div>}
  </div>
}

function Info({ label, value }: { label: string; value: React.ReactNode }) { return <div className="info-item"><span>{label}</span><strong>{value}</strong></div> }
function MissingWorker() { return <div className="page-stack"><PageHeading title="Registro no encontrado" description="El trabajador no existe en los datos de demostración actuales." /><Button href="/personal" variant="secondary"><ArrowLeft size={15} />Volver al directorio</Button></div> }
