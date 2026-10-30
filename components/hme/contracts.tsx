"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDownToLine, ArrowLeft, ArrowRight, BriefcaseBusiness, Check, Clock3, FileText, History, Pencil, Plus, Printer, Search, X } from "lucide-react"
import { sites, type Contract } from "./data"
import { useHR } from "./store"
import { Button, DateText, Field, PageHeading, Section, StatCard, Status, TableFrame } from "./ui"

function downloadCsv(rows: string[][]) {
  const content = rows.map((row) => row.map((item) => `"${String(item).replaceAll('"', '""')}"`).join(",")).join("\n")
  const link = document.createElement("a")
  link.href = URL.createObjectURL(new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" }))
  link.download = "hme-contratos.csv"
  link.click()
  URL.revokeObjectURL(link.href)
}
function remaining(endDate: string) {
  if (!endDate) return null
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/La_Paz", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date())
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? ""
  const today = `${part("year")}-${part("month")}-${part("day")}`
  return Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86400000)
}
function selectedStatus(contract: Contract) { const days = remaining(contract.endDate); if (contract.status === "Finalizado") return "Finalizado"; if (days !== null && days < 0) return "Vencido"; if (days !== null && days <= 30) return "Por vencer"; return "Vigente" }

export function ContractsPage() {
  const { workers, contracts, site } = useHR()
  const params = useSearchParams()
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState(params.get("estado") ?? "Todos")
  const [type, setType] = useState("Todos")
  const filtered = useMemo(() => contracts.filter((contract) => {
    const worker = workers.find(({ id }) => id === contract.workerId)
    return worker && (site === "Todas las sedes" || worker.site === site) && (!params.get("trabajador") || worker.id === params.get("trabajador")) && `${worker.firstName} ${worker.lastName} ${worker.code} ${contract.number}`.toLowerCase().includes(query.toLowerCase()) && (status === "Todos" || selectedStatus(contract) === status) && (type === "Todos" || contract.type === type)
  }), [contracts, workers, site, params, query, status, type])
  const rows = [["Contrato", "Código", "Trabajador", "Cargo", "Sede", "Tipo", "Inicio", "Vencimiento", "Estado"], ...filtered.map((contract) => { const worker = workers.find(({ id }) => id === contract.workerId)!; return [contract.number, worker.code, `${worker.firstName} ${worker.lastName}`, worker.title, worker.site, contract.type, contract.startDate, contract.endDate, selectedStatus(contract)] })]
  return <div className="page-stack">
    <PageHeading title="Gestión de contratos" description="Registro, seguimiento y administración de contratos laborales." actions={<><Button variant="secondary" onClick={() => downloadCsv(rows)}><ArrowDownToLine size={15} />Exportar</Button><Button variant="secondary" onClick={() => window.print()}><Printer size={15} />Imprimir</Button><Button href="/contratos/nuevo"><Plus size={15} />Registrar contrato</Button></>} />
    <div className="stats-grid five-stats"><StatCard label="Total de contratos" value={contracts.length} icon={<BriefcaseBusiness size={17} />} /><StatCard label="Vigentes" value={contracts.filter((item) => selectedStatus(item) === "Vigente").length} icon={<Check size={17} />} tone="green" /><StatCard label="Próximos a vencer" value={contracts.filter((item) => selectedStatus(item) === "Por vencer").length} icon={<Clock3 size={17} />} tone="amber" /><StatCard label="Vencidos" value={contracts.filter((item) => selectedStatus(item) === "Vencido").length} icon={<X size={17} />} tone="red" /><StatCard label="Finalizados" value={contracts.filter((item) => item.status === "Finalizado").length} icon={<History size={17} />} tone="gray" /></div>
    <Section title="Vencimientos y alertas"><div className="alert-strip"><span><Clock3 size={16} />Hasta 30 días</span><strong>{contracts.filter((item) => selectedStatus(item) === "Por vencer").length} contratos requieren seguimiento</strong><Link className="text-link" href="/contratos?estado=Por%20vencer">Ver vencimientos <ArrowRight size={14} /></Link></div></Section>
    <Section title="Listado de contratos"><div className="filter-bar"><label className="search-box"><Search size={17} /><input placeholder="Buscar trabajador, código o contrato..." value={query} onChange={(event) => setQuery(event.target.value)} /></label><select aria-label="Tipo de contrato" value={type} onChange={(event) => setType(event.target.value)}><option>Todos</option>{[...new Set(contracts.map(({ type: item }) => item))].map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Estado del contrato" value={status} onChange={(event) => setStatus(event.target.value)}><option>Todos</option><option>Vigente</option><option>Por vencer</option><option>Vencido</option><option>Finalizado</option></select><Button variant="ghost" onClick={() => { setQuery(""); setType("Todos"); setStatus("Todos") }}><X size={15} />Limpiar</Button></div>
      <TableFrame empty={!filtered.length} emptyText="No se encontraron contratos para los filtros seleccionados."><table><thead><tr><th>Número de contrato</th><th>Trabajador</th><th>Cargo</th><th>Sede</th><th>Tipo</th><th>Inicio</th><th>Vencimiento</th><th>Días restantes</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtered.map((contract) => {
        const worker = workers.find(({ id }) => id === contract.workerId)!
        const days = remaining(contract.endDate)
        const statusLabel = selectedStatus(contract)
        return <tr key={contract.id}><td className="code-cell">{contract.number}</td><td><Link href={`/personal/${worker.id}`} className="table-primary hover-link">{worker.firstName} {worker.lastName}</Link><small className="table-secondary">{worker.code}</small></td><td>{worker.title}</td><td>{worker.site}</td><td>{contract.type}</td><td><DateText date={contract.startDate} /></td><td>{contract.endDate ? <DateText date={contract.endDate} /> : "Sin vencimiento"}</td><td>{days === null ? "—" : days < 0 ? `Vencido hace ${Math.abs(days)} días` : `${days} días`}</td><td><Status>{statusLabel}</Status></td><td><Link className="text-link" href={`/contratos/${contract.id}`}><FileText size={14} />Ver</Link></td></tr>
      })}</tbody></table></TableFrame><div className="table-pagination"><span>{filtered.length} contratos encontrados</span><span className="muted-small">Los datos se actualizan durante la sesión actual.</span></div>
    </Section>
  </div>
}

export function ContractFormPage({ contractId }: { contractId?: string }) {
  const { workers, contracts, addContract, updateContract } = useHR()
  const params = useSearchParams()
  const router = useRouter()
  const existing = contractId ? contracts.find(({ id }) => id === contractId) : undefined
  const preselected = params.get("trabajador") ?? existing?.workerId ?? ""
  const [workerId, setWorkerId] = useState(preselected)
  const [indefinite, setIndefinite] = useState(existing?.modality === "Tiempo indefinido")
  const [error, setError] = useState("")
  const [file, setFile] = useState("")
  const worker = workers.find(({ id }) => id === workerId)
  if (contractId && !existing) return <MissingContract />
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!worker) { setError("Selecciona un trabajador."); return }
    const data = new FormData(event.currentTarget)
    const startDate = String(data.get("startDate") || "")
    const endDate = indefinite ? "" : String(data.get("endDate") || "")
    if (!startDate || (!indefinite && !endDate)) { setError("Completa las fechas obligatorias."); return }
    if (existing) {
      updateContract(existing.id, { workerId, type: String(data.get("type")), modality: indefinite ? "Tiempo indefinido" : "Plazo fijo", startDate, endDate, salary: Number(data.get("salary")), notes: String(data.get("notes")) })
      router.push(`/contratos/${existing.id}`)
    } else {
      const created = addContract({ workerId, type: String(data.get("type")), modality: indefinite ? "Tiempo indefinido" : "Plazo fijo", startDate, endDate, salary: Number(data.get("salary")), status: indefinite ? "Vigente" : selectedStatus({ endDate, status: "Vigente" } as Contract), notes: String(data.get("notes")) })
      router.push(`/contratos/${created.id}`)
    }
  }
  return <div className="page-stack"><Link href={existing ? `/contratos/${existing.id}` : "/contratos"} className="back-link"><ArrowLeft size={15} />Volver a contratos</Link><PageHeading title={existing ? "Editar contrato" : "Registrar contrato"} description={existing ? `Actualiza la información del contrato ${existing.number}.` : "Asocia un contrato laboral a un trabajador registrado."} />
    <form className="form-layout contract-form" onSubmit={submit}><div className="form-main"><Section title="Datos del contrato"><div className="form-grid two-cols"><Field label="Número de contrato"><input readOnly className="readonly-input" value={existing?.number ?? `HME-CT-${String(contracts.length + 1).padStart(4, "0")}`} /></Field><Field label="Trabajador" required><select value={workerId} onChange={(event) => setWorkerId(event.target.value)} required><option value="">Seleccionar trabajador</option>{workers.filter(({ status }) => status === "Activo").map((item) => <option key={item.id} value={item.id}>{item.code} · {item.firstName} {item.lastName}</option>)}</select></Field>
      <Field label="Código del trabajador"><input readOnly className="readonly-input" value={worker?.code ?? "Se completa al seleccionar"} /></Field><Field label="Sede"><input readOnly className="readonly-input" value={worker?.site ?? "—"} /></Field><Field label="Cargo"><input readOnly className="readonly-input" value={worker?.title ?? "—"} /></Field><Field label="Área o servicio"><input readOnly className="readonly-input" value={worker?.area ?? "—"} /></Field>
      <Field label="Tipo de contrato" required><select name="type" defaultValue={existing?.type ?? "Contrato a plazo fijo"}><option>Contrato a plazo fijo</option><option>Ítem</option><option>Consultoría</option><option>Eventual</option><option>Práctica profesional</option></select></Field><Field label="Modalidad de contratación"><select value={indefinite ? "Tiempo indefinido" : "Plazo fijo"} onChange={(event) => setIndefinite(event.target.value === "Tiempo indefinido")}><option>Plazo fijo</option><option>Tiempo indefinido</option></select></Field>
      <Field label="Fecha de inicio" required><input name="startDate" type="date" defaultValue={existing?.startDate ?? "2026-10-29"} required /></Field><Field label="Fecha de vencimiento" required={!indefinite}><input name="endDate" type="date" defaultValue={existing?.endDate ?? "2027-10-29"} disabled={indefinite} required={!indefinite} /></Field><Field label="Remuneración mensual"><input name="salary" type="number" min="0" step="0.01" defaultValue={existing?.salary ?? "5200"} /></Field><Field label="Moneda"><select name="currency"><option>BOB — Bolivianos</option><option>USD — Dólares</option></select></Field>
      <Field label="Observaciones"><textarea className="full-span" name="notes" rows={3} defaultValue={existing?.notes ?? ""} /></Field><Field label="Documento PDF"><input type="file" accept=".pdf,application/pdf" onChange={(event) => setFile(event.target.files?.[0]?.name ?? "")} /></Field></div>{file && <p className="muted-small">Archivo seleccionado localmente: {file}. No se ha subido a un servidor.</p>}{error && <p className="form-error">{error}</p>}</Section></div><aside className="form-aside"><Section title="Resumen"><div className="form-summary"><div><span>Trabajador</span><strong>{worker ? `${worker.firstName} ${worker.lastName}` : "Sin seleccionar"}</strong></div><div><span>Estado</span><strong>{indefinite ? "Tiempo indefinido" : "Con vencimiento"}</strong></div><div><span>Almacenamiento</span><strong>Solo esta sesión</strong></div></div></Section></aside><div className="form-actions"><Button href={existing ? `/contratos/${existing.id}` : "/contratos"} variant="secondary">Cancelar</Button><span /> <Button type="submit">{existing ? "Guardar cambios" : "Guardar contrato"}</Button></div></form>
  </div>
}

export function ContractDetailPage({ contractId }: { contractId: string }) {
  const { contracts, workers, addContract, updateContract } = useHR()
  const router = useRouter()
  const [renew, setRenew] = useState(false)
  const contract = contracts.find(({ id }) => id === contractId)
  if (!contract) return <MissingContract />
  const worker = workers.find(({ id }) => id === contract.workerId)
  const days = remaining(contract.endDate)
  const onRenew = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const startDate = String(form.get("startDate")); const endDate = String(form.get("endDate")); const salary = Number(form.get("salary") || contract.salary)
    updateContract(contract.id, { status: "Finalizado" })
    const next = addContract({ workerId: contract.workerId, type: contract.type, modality: contract.modality, startDate, endDate, salary, status: "Vigente", notes: String(form.get("notes") || "Renovación de contrato."), previousId: contract.id })
    setRenew(false)
    router.push(`/contratos/${next.id}`)
  }
  return <div className="page-stack"><Link href="/contratos" className="back-link"><ArrowLeft size={15} />Volver a contratos</Link><PageHeading title={`Contrato ${contract.number}`} description="Detalle y seguimiento del contrato laboral." actions={<><Button href={`/contratos/${contract.id}/editar`} variant="secondary"><Pencil size={15} />Editar</Button><Button variant="secondary" onClick={() => setRenew(true)}><History size={15} />Renovar</Button><Button variant="secondary" onClick={() => window.print()}><Printer size={15} />Imprimir</Button></>} />
    <div className="contract-hero panel"><div className="contract-number-icon"><BriefcaseBusiness size={23} /></div><div><span className="eyebrow">Número de contrato</span><strong>{contract.number}</strong><span className="muted-small">{contract.type}</span></div><Status>{selectedStatus(contract)}</Status></div>
    <div className="dashboard-two-col"><Section title="Información contractual"><div className="details-grid"><Detail label="Trabajador" value={worker ? <Link href={`/personal/${worker.id}`} className="text-link">{worker.firstName} {worker.lastName}</Link> : "—"} /><Detail label="Código HME" value={worker?.code ?? "—"} /><Detail label="Cargo" value={worker?.title ?? "—"} /><Detail label="Sede" value={worker?.site ?? "—"} /><Detail label="Modalidad" value={contract.modality} /><Detail label="Fecha de inicio" value={<DateText date={contract.startDate} />} /><Detail label="Fecha de vencimiento" value={contract.endDate ? <DateText date={contract.endDate} /> : "Sin vencimiento"} /><Detail label="Duración" value={days === null ? "Indefinido" : `${Math.max(0, Math.round((new Date(`${contract.endDate}T12:00:00`).getTime() - new Date(`${contract.startDate}T12:00:00`).getTime()) / 86400000))} días`} /><Detail label="Remuneración" value={`Bs ${contract.salary.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`} /><Detail label="Estado" value={<Status>{selectedStatus(contract)}</Status>} /><Detail label="Contrato anterior" value={contract.previousId ? <Link href={`/contratos/${contract.previousId}`} className="text-link">Ver anterior</Link> : "—"} /></div><p className="contract-notes">{contract.notes}</p></Section><Section title="Documento adjunto"><div className="document-preview"><FileText size={30} /><strong>Sin documento adjunto</strong><span>Los archivos PDF seleccionados no se guardan en el prototipo.</span></div></Section></div>
    {renew && <div className="dialog-backdrop"><form className="dialog-card" onSubmit={onRenew}><h2>Renovar contrato</h2><p>Se conservará el contrato anterior en el historial.</p><Field label="Nueva fecha de inicio" required><input name="startDate" type="date" required defaultValue="2026-11-13" /></Field><Field label="Nueva fecha de vencimiento" required><input name="endDate" type="date" required defaultValue="2027-11-12" /></Field><Field label="Nueva remuneración mensual (Bs)"><input name="salary" type="number" min="0" defaultValue={contract.salary} /></Field><Field label="Observaciones"><textarea name="notes" rows={3} /></Field><div className="dialog-actions"><Button variant="secondary" onClick={() => setRenew(false)}>Cancelar</Button><Button type="submit">Confirmar renovación</Button></div></form></div>}
  </div>
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) { return <div className="info-item"><span>{label}</span><strong>{value}</strong></div> }
function MissingContract() { return <div className="page-stack"><PageHeading title="Contrato no encontrado" description="Este registro no está disponible en los datos de demostración." /><Button href="/contratos" variant="secondary"><ArrowLeft size={15} />Volver a contratos</Button></div> }
