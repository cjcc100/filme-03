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
        <header className="header">
          <div className="container header-content">
            <Link href="/" className="logo">
              <div className="logo-icon">C</div>
              <span className="logo-text">CJCCHUB</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-zinc-300 hover:text-white transition-colors">Início</Link>
              <Link href="/filmes" className="text-zinc-300 hover:text-white transition-colors">Filmes</Link>
              <Link href="/series" className="text-zinc-300 hover:text-white transition-colors">Séries</Link>
            </nav>
          </div>
        </header>
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
