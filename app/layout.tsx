import type { Metadata, Viewport } from "next"
import { HRProvider } from "@/components/hme/store"
import { AppShell } from "@/components/hme/app-shell"
import "./globals.css"

export const metadata: Metadata = {
  title: "Recursos Humanos | Hospital María Esperanza",
  description: "Sistema de demostración para la gestión del personal, asistencia y contratos del Hospital María Esperanza.",
  applicationName: "HME Recursos Humanos",
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
}

export const viewport: Viewport = { themeColor: "#14295c", colorScheme: "light" }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><HRProvider><AppShell>{children}</AppShell></HRProvider></body></html>
}
