"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { initialAttendance, initialContracts, initialWorkers, type AttendanceRecord, type Contract, type Worker } from "./data"

type HRContextValue = {
  workers: Worker[]
  contracts: Contract[]
  attendance: AttendanceRecord[]
  site: string
  setSite: (site: string) => void
  addWorker: (worker: Omit<Worker, "id" | "code">) => Worker
  updateWorker: (id: string, updates: Partial<Worker>) => void
  addContract: (contract: Omit<Contract, "id" | "number">) => Contract
  updateContract: (id: string, updates: Partial<Contract>) => void
}

const HRContext = createContext<HRContextValue | null>(null)

export function HRProvider({ children }: { children: ReactNode }) {
  const [workers, setWorkers] = useState(initialWorkers)
  const [contracts, setContracts] = useState(initialContracts)
  const [site, setSite] = useState("Todas las sedes")

  const value = useMemo<HRContextValue>(() => ({
    workers,
    contracts,
    attendance: initialAttendance,
    site,
    setSite,
    addWorker: (worker) => {
      const nextId = String(Math.max(0, ...workers.map(({ id }) => Number(id))) + 1)
      const next = { ...worker, id: nextId, code: `HME-${String(Number(nextId)).padStart(4, "0")}` } as Worker
      setWorkers((current) => [next, ...current])
      return next
    },
    updateWorker: (id, updates) => setWorkers((current) => current.map((worker) => worker.id === id ? { ...worker, ...updates, id, code: worker.code } : worker)),
    addContract: (contract) => {
      const nextId = String(Math.max(0, ...contracts.map(({ id }) => Number(id))) + 1)
      const next = { ...contract, id: nextId, number: `HME-CT-${String(Number(nextId)).padStart(4, "0")}` } as Contract
      setContracts((current) => [next, ...current])
      return next
    },
    updateContract: (id, updates) => setContracts((current) => current.map((contract) => contract.id === id ? { ...contract, ...updates, id } : contract)),
  }), [workers, contracts, site])

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>
}

export function useHR() {
  const value = useContext(HRContext)
  if (!value) throw new Error("useHR debe usarse dentro de HRProvider")
  return value
}
