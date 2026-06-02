import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Method GET: Untuk memvalidasi access token secara konvensional (Bearer token)
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Access token failed" },
        { status: 401 }
      );
    }

    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
    });

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || "",
          avatar_url: profile?.avatar_url || null,
          role: profile?.role || "USER",
          vendor_id: profile?.vendor_id || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Method POST: Gabungan Cerdas (Smart Session Validating & Auto-Refreshing)
// Menerima access_token dan refresh_token. Jika access_token kedaluwarsa, 
// akan otomatis di-refresh menggunakan refresh_token sebelum mengembalikan data profil.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { access_token, refresh_token } = body;

    if (!access_token && !refresh_token) {
      return NextResponse.json(
        { error: "Access token atau refresh token wajib diisi" },
        { status: 400 }
      );
    }

    let activeUser = null;
    let newSession = null;

    // 1. Coba verifikasi Access Token terlebih dahulu jika ada
    if (access_token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(access_token);
      if (!authError && user) {
        activeUser = user;
      }
    }

    // 2. Jika Access Token tidak valid/kedaluwarsa, coba perbarui sesi menggunakan Refresh Token
    if (!activeUser && refresh_token) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
        refresh_token,
      });

      if (!refreshError && refreshData.session && refreshData.user) {
        activeUser = refreshData.user;
        newSession = refreshData.session; // Ini berisi access_token & refresh_token baru
      }
    }

    // 3. Jika kedua upaya gagal, berarti sesi benar-benar sudah habis (user harus login ulang)
    if (!activeUser) {
      return NextResponse.json(
        { error: "Sesi telah kedaluwarsa atau tidak valid. Silakan login kembali." },
        { status: 401 }
      );
    }

    // 4. Ambil profil pengguna terbaru dari database Prisma
    const profile = await prisma.profiles.findUnique({
      where: { id: activeUser.id },
    });

    // 5. Kembalikan respons ke frontend
    return NextResponse.json(
      {
        authenticated: true,
        session: newSession || null, // Jika bernilai session (tidak null), frontend WAJIB menyimpan token baru ini
        user: {
          id: activeUser.id,
          email: activeUser.email,
          full_name: profile?.full_name || "",
          avatar_url: profile?.avatar_url || null,
          role: profile?.role || "USER",
          vendor_id: profile?.vendor_id || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error pada POST session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}