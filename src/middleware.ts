import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  // Jika token tidak ada di cookie, arahkan ke login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Lanjutkan request jika ada token
  return NextResponse.next();
}

export const config = {
  // Hanya jalankan middleware di route yang harus diproteksi
  matcher: [
    '/manajemen/:path*',
    '/petugas/:path*',
    '/vendor/:path*'
  ],
};
