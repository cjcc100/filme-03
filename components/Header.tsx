import Link from 'next/link'

export default function Header() {
  return (
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
  )
}
