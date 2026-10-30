export type Worker = {
  id: string
  code: string
  firstName: string
  lastName: string
  document: string
  title: string
  area: string
  site: string
  joined: string
  status: "Activo" | "Inactivo"
  category: string
  shift: string
  phone: string
  email: string
  specialty: string
  professionalId: string
  biometricId: string
  modality: string
  superior: string
  civilStatus: string
  nationality: string
  birthDate: string
  department: string
  municipality: string
  address: string
  emergencyName: string
  emergencyPhone: string
  bank: string
  account: string
  education: string
}

export type Contract = {
  id: string
  number: string
  workerId: string
  type: string
  modality: string
  startDate: string
  endDate: string
  salary: number
  status: "Vigente" | "Por vencer" | "Vencido" | "Finalizado"
  notes: string
  previousId?: string
}

export type AttendanceRecord = {
  id: string
  workerId: string
  date: string
  schedule: string
  inTime: string
  outTime: string
  hours: string
  status: string
  observation: string
  site: string
}

const baseWorkers: Worker[] = [
  ["Ana Lucía", "Rojas Mendoza", "4521836", "Médica internista", "Hospitalización", "Sede principal", "2021-03-15", "Médicos", "07:30–15:30", "71420381", "ana.rojas@hme.bo", "Medicina interna", "MED-1245", "BIO-0031"],
  ["Carlos Andrés", "Mamani Quispe", "6082914", "Enfermero", "Emergencias", "Sede principal", "2022-08-01", "Enfermería", "07:00–15:00", "72561043", "carlos.mamani@hme.bo", "Urgencias", "PRO-5582", "BIO-0032"],
  ["María Fernanda", "Vargas Salazar", "4952271", "Administradora", "Administración", "Sede Norte", "2020-02-10", "Administrativos", "08:00–16:00", "70145678", "maria.vargas@hme.bo", "", "", "BIO-0033"],
  ["Jorge Luis", "Choque Apaza", "8330952", "Técnico de laboratorio", "Laboratorio", "Sede principal", "2023-01-09", "Técnicos y auxiliares", "07:30–15:30", "72890541", "jorge.choque@hme.bo", "Hematología", "TEC-0917", "BIO-0034"],
  ["Daniela", "Pérez Alarcón", "6381102", "Bioquímica farmacéutica", "Farmacia", "Sede Sur", "2024-04-22", "Técnicos y auxiliares", "08:00–16:00", "71908352", "daniela.perez@hme.bo", "Farmacia clínica", "BIO-2468", "BIO-0035"],
  ["Miguel Ángel", "Flores Gutiérrez", "3946752", "Cirujano general", "Quirófano", "Sede principal", "2019-06-03", "Médicos", "07:00–15:00", "70651293", "miguel.flores@hme.bo", "Cirugía general", "MED-0831", "BIO-0036"],
  ["Verónica", "López Rivero", "7019326", "Enfermera", "Hospitalización", "Sede Norte", "2021-11-15", "Enfermería", "19:00–07:00", "77762091", "veronica.lopez@hme.bo", "Cuidados críticos", "PRO-6721", "BIO-0037"],
  ["Roberto", "Calle Condori", "5628104", "Auxiliar de enfermería", "Emergencias", "Sede principal", "2025-01-13", "Técnicos y auxiliares", "15:00–23:00", "72045819", "roberto.calle@hme.bo", "", "", "BIO-0038"],
  ["Paola Andrea", "Méndez Arias", "4851062", "Psicóloga", "Consulta externa", "Sede Sur", "2022-05-02", "Personal de apoyo externo", "08:00–16:00", "70777812", "paola.mendez@hme.bo", "Psicología clínica", "PSI-1405", "BIO-0039"],
  ["Fernando", "Gutiérrez Ríos", "6179523", "Contador", "Administración", "Sede principal", "2020-09-07", "Administrativos", "08:00–16:00", "71534069", "fernando.gutierrez@hme.bo", "", "", "BIO-0040"],
  ["Carla Sofía", "Sánchez Méndez", "5261948", "Pediatra", "Consulta externa", "Sede Norte", "2023-03-20", "Médicos", "08:00–16:00", "71204083", "carla.sanchez@hme.bo", "Pediatría", "MED-3108", "BIO-0041"],
  ["Óscar David", "Rivera Vargas", "8290135", "Camillero", "Servicios generales", "Sede principal", "2024-10-01", "Servicios generales", "07:00–15:00", "72110987", "oscar.rivera@hme.bo", "", "", "BIO-0042"],
  ["Teresa", "Mendoza Pacheco", "3985106", "Enfermera", "Quirófano", "Sede Sur", "2018-12-03", "Enfermería", "07:00–15:00", "71945260", "teresa.mendoza@hme.bo", "Instrumentación", "PRO-3890", "BIO-0043"],
  ["Raúl", "Paredes Lima", "6832109", "Técnico en imagenología", "Emergencias", "Sede principal", "2022-01-17", "Técnicos y auxiliares", "15:00–23:00", "70341985", "raul.paredes@hme.bo", "Radiología", "TEC-1042", "BIO-0044"],
  ["Gabriela", "Torrez Cárdenas", "5972103", "Responsable de RR. HH.", "Recursos Humanos", "Sede principal", "2019-09-02", "Administrativos", "08:00–16:00", "71660342", "gabriela.torrez@hme.bo", "Gestión hospitalaria", "", "BIO-0045"],
  ["Sergio", "Cruz Alvarado", "4526738", "Médico general", "Emergencias", "Sede Norte", "2021-07-12", "Médicos", "19:00–07:00", "72509031", "sergio.cruz@hme.bo", "Medicina general", "MED-2011", "BIO-0046"],
  ["Elena", "Quispe Rocha", "7118650", "Auxiliar de farmacia", "Farmacia", "Sede principal", "2025-06-02", "Técnicos y auxiliares", "08:00–16:00", "71487620", "elena.quispe@hme.bo", "", "", "BIO-0047"],
  ["Ramiro", "Peña Durán", "3249170", "Conductor de ambulancia", "Servicios generales", "Sede Sur", "2017-02-06", "Servicios generales", "07:00–19:00", "70894261", "ramiro.pena@hme.bo", "", "", "BIO-0048"],
  ["Lucía", "Arce Montaño", "6308251", "Odontóloga", "Consulta externa", "Sede Norte", "2024-02-19", "Médicos", "08:00–16:00", "77042168", "lucia.arce@hme.bo", "Odontología", "ODO-0533", "BIO-0049"],
  ["Pedro", "Villarroel Soria", "5097364", "Personal de limpieza", "Servicios generales", "Sede principal", "2020-12-14", "Servicios generales", "06:00–14:00", "70120643", "pedro.villarroel@hme.bo", "", "", "BIO-0050"],
].map((row, index) => ({
  id: String(index + 1),
  code: `HME-${String(index + 1).padStart(4, "0")}`,
  firstName: row[0], lastName: row[1], document: row[2], title: row[3], area: row[4], site: row[5], joined: row[6],
  status: index === 11 || index === 17 ? "Inactivo" : "Activo",
  category: row[7], shift: row[8], phone: row[9], email: row[10], specialty: row[11], professionalId: row[12], biometricId: row[13],
  modality: index % 3 === 0 ? "Ítem" : "Plazo fijo", superior: "Gabriela Torrez Cárdenas", civilStatus: index % 2 ? "Soltero/a" : "Casado/a", nationality: "Boliviana", birthDate: "1990-05-18", department: "La Paz", municipality: "La Paz", address: "Zona Central, La Paz", emergencyName: "Contacto familiar", emergencyPhone: row[9], bank: "Banco Unión", account: `100${index + 1}458901`, education: index % 2 ? "Licenciatura" : "Especialidad",
}))

export const initialWorkers = baseWorkers

export const initialContracts: Contract[] = baseWorkers.slice(0, 17).map((worker, index) => {
  const soon = [1, 4, 10, 14].includes(index)
  const expired = index === 7 || index === 12
  const indefinite = index === 9
  return {
    id: String(index + 1),
    number: `HME-CT-${String(index + 1).padStart(4, "0")}`,
    workerId: worker.id,
    type: index % 3 === 0 ? "Contrato a plazo fijo" : index % 3 === 1 ? "Ítem" : "Consultoría",
    modality: indefinite ? "Tiempo indefinido" : "Plazo fijo",
    startDate: "2025-01-02",
    endDate: indefinite ? "" : soon ? "2026-11-12" : expired ? "2026-09-30" : "2027-06-30",
    salary: 5200 + index * 250,
    status: indefinite ? "Vigente" : expired ? "Vencido" : soon ? "Por vencer" : worker.status === "Inactivo" ? "Finalizado" : "Vigente",
    notes: "Documento de demostración. Datos ficticios para revisión de interfaz.",
  }
})

const attendanceStatuses = ["Puntual", "Con retraso", "Puntual", "Ausente", "Marcación incompleta", "Puntual", "Justificado", "Ausente", "Con retraso", "Puntual", "Salida anticipada", "Pendiente de revisión", "Puntual", "Puntual", "Con retraso", "Puntual", "Puntual", "Ausente", "Puntual", "Marcación incompleta"]

export const initialAttendance: AttendanceRecord[] = baseWorkers.filter((worker) => worker.status === "Activo").map((worker, index) => {
  const status = attendanceStatuses[Number(worker.id) - 1]
  return {
    id: worker.id,
    workerId: worker.id,
    date: "2026-10-29",
    schedule: worker.shift,
    inTime: status === "Ausente" ? "—" : index % 5 === 1 ? "07:42" : "07:26",
    outTime: status === "Marcación incompleta" ? "Pendiente" : status === "Ausente" ? "—" : "15:34",
    hours: status === "Ausente" ? "0 h" : status === "Marcación incompleta" ? "—" : "8 h 08 min",
    status,
    observation: status === "Marcación incompleta" ? "Sin marcación de salida" : status === "Con retraso" ? "Ingreso posterior al horario programado" : "",
    site: worker.site,
  }
})

export const sites = ["Todas las sedes", "Sede principal", "Sede Norte", "Sede Sur"]
export const areas = ["Emergencias", "Consulta externa", "Hospitalización", "Quirófano", "Laboratorio", "Farmacia", "Administración", "Recursos Humanos", "Servicios generales"]
export const categories = ["Médicos", "Enfermería", "Administrativos", "Técnicos y auxiliares", "Servicios generales", "Personal de apoyo externo"]
