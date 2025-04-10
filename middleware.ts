// middleware.ts
import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Rutas protegidas
  const protectedRoutes = [
    '/inicio',
    '/inicio/modulos/clientes',
    '/inicio/modulos/destruccion',
    '/inicio/modulos/mantenimiento',
    '/inicio/modulos/productos',
    '/inicio/modulos/recursosHumanos',
    '/inicio/modulos/reportes',
    '/inicio/modulos/vehiculos',
    '/inicio/modulos/accesos',
  ];

  // Verificar si la ruta solicitada está protegida
  if (protectedRoutes.includes(url.pathname)) {
    // Obtener el token de autenticación de las cookies
    const token = req.cookies.get('authToken')?.value;

    // Si no hay token, redirigir al usuario a la página de inicio de sesión
    if (!token) {
      url.pathname = '/'; // Redirigir a la página de login
      return NextResponse.redirect(url);
    }
  }

  // Si hay token o la ruta no está protegida, permitir el acceso
  return NextResponse.next();
}

// Configuración del middleware para aplicar a rutas específicas
export const config = {
  matcher: [
    '/inicio',
    '/inicio/modulos/clientes',
    '/inicio/modulos/destruccion',
    '/inicio/modulos/mantenimiento',
    '/inicio/modulos/productos',
    '/inicio/modulos/recursosHumanos',
    '/inicio/modulos/reportes',
    '/inicio/modulos/vehiculos',
    '/inicio/modulos/accesos',
  ],
};