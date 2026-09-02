import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CJCCHUB - Filmes e Séries',
  description: 'Plataforma de streaming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="flex flex-col min-h-screen">
        <main className="flex-1">
          {children}
        </main>
        <footer className="footer">
          <div className="container">
            <p className="footer-text">© 2024 CJCCHUB. Todos os direitos reservados.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
