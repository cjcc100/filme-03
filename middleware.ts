import { NextResponse } from "next/server"

export function middleware(req: any) {
  const url = req.nextUrl
  const isAuthPage = url.pathname.startsWith("/login") || 
                     url.pathname.startsWith("/register")
  const isProfilePage = url.pathname.startsWith("/profile")

  // Verificar autenticação via localStorage (no cliente)
  // No middleware do servidor, não temos acesso ao localStorage
  // então vamos apenas fazer redirecionamentos básicos
  
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}