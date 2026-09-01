import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CJCCHUB - Filmes e Séries",
  description: "Plataforma de streaming de filmes e séries",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
