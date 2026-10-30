"use client"

import { usePathname } from "next/navigation"
import { Dashboard } from "@/components/hme/dashboard"
import { PersonnelPage, WorkerDetailPage, WorkerFormPage } from "@/components/hme/personnel"
import { AttendancePage } from "@/components/hme/attendance"
import { ContractsPage, ContractDetailPage, ContractFormPage } from "@/components/hme/contracts"
import { DevelopmentPage } from "@/components/hme/development"

const modules: Record<string, { title: string; description: string }> = {
  horarios: { title: "Horarios y turnos", description: "Planificación de turnos y jornadas del personal hospitalario." },
  permisos: { title: "Permisos, licencias y vacaciones", description: "Administración de solicitudes y saldos del personal." },
  planillas: { title: "Planillas y remuneraciones", description: "Consulta y gestión de planillas de remuneración." },
  reclutamiento: { title: "Reclutamiento y selección", description: "Seguimiento de procesos de selección y nuevas incorporaciones." },
  reportes: { title: "Reportes", description: "Informes y consultas administrativas de Recursos Humanos." },
  configuracion: { title: "Configuración", description: "Catálogos y preferencias del sistema de Recursos Humanos." },
}

export default function RoutePage() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)
  if (!segments.length) return <Dashboard />
  if (segments[0] === "personal") {
    if (segments.length === 1) return <PersonnelPage />
    if (segments[1] === "nuevo") return <WorkerFormPage />
    if (segments[2] === "editar") return <WorkerFormPage workerId={segments[1]} />
    return <WorkerDetailPage workerId={segments[1]} />
  }
  if (segments[0] === "asistencia") return <AttendancePage />
  if (segments[0] === "contratos") {
    if (segments.length === 1) return <ContractsPage />
    if (segments[1] === "nuevo") return <ContractFormPage />
    if (segments[2] === "editar") return <ContractFormPage contractId={segments[1]} />
    return <ContractDetailPage contractId={segments[1]} />
  }
  return modules[segments[0]] ? <DevelopmentPage {...modules[segments[0]]} /> : <DevelopmentPage title="Página no encontrada" description="La ruta solicitada no corresponde a un módulo disponible." />
}
