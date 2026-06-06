import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Ambil kredensial dari environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;

  // Jika token tidak ada di cookie, arahkan ke login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verifikasi token menggunakan native fetch (sangat ringan untuk Edge Runtime)
  if (supabaseUrl && supabaseAnonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: supabaseAnonKey,
        },
      });

      if (!res.ok) {
        // Token palsu, kedaluwarsa, atau tidak valid
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      const user = await res.json();
      if (!user || !user.id) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (e) {
      // Jika terjadi error saat memanggil API Supabase
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Lanjutkan request jika ada token dan valid
  return NextResponse.next();
}

export const config = {
  // Hanya jalankan middleware di route yang harus diproteksi
  matcher: [
    '/admin/:path*',
    '/manajemen/:path*',
    '/petugas/:path*',
    '/vendor/:path*'
  ],
};
