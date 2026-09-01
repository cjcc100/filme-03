export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <header className="sticky top-0 z-50 bg-zinc-900/30 backdrop-blur-md border-b border-zinc-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-white font-semibold text-lg">CJCCHUB</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-zinc-300 hover:text-white transition-colors">Início</a>
              <a href="/" className="text-zinc-300 hover:text-white transition-colors">Filmes</a>
              <a href="/series" className="text-zinc-300 hover:text-white transition-colors">Séries</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Bem-vindo ao CJCCHUB</h1>
          <p className="text-zinc-400 text-lg mb-8">Plataforma de streaming em construção</p>
          <div className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg font-medium">
            ✅ Site no ar! Deploy funcionando
          </div>
        </div>
      </main>

      <footer className="bg-zinc-900 border-t border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-zinc-400 text-sm">
            © 2024 CJCCHUB. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}