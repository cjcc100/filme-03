import './globals.css';

export const metadata = {
  title: 'CJCCHUB - Filmes e Séries',
  description: 'Plataforma de streaming de filmes e séries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
