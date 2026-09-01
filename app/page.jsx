export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <div className="logo-icon">C</div>
            <span className="logo-text">CJCCHUB</span>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="content">
          <h1 className="title">Bem-vindo ao CJCCHUB</h1>
          <p className="subtitle">Plataforma de streaming funcionando!</p>
          <div className="badge">✅ Site no ar e funcionando</div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">© 2024 CJCCHUB. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
