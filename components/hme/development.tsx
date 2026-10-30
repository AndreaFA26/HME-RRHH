import { ArrowLeft, Clock3 } from "lucide-react"
import { Button, PageHeading } from "./ui"

export function DevelopmentPage({ title, description }: { title: string; description: string }) {
  return <div className="page-stack"><PageHeading title={title} description={description} /><section className="development-panel"><span className="development-icon"><Clock3 size={24} /></span><h2>Módulo en desarrollo</h2><p>Esta funcionalidad estará disponible en una próxima actualización del Sistema de Recursos Humanos del Hospital María Esperanza.</p><Button href="/" variant="secondary"><ArrowLeft size={15} />Volver al inicio</Button></section></div>
}
