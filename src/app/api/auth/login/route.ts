import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase menggunakan Anon Key biasa
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Validasi input asas
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // 2. Log masuk menggunakan Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
        console.error(authError?.message)
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // 3. Ambil data profil tambahan (role, vendor_id, dll) daripada Prisma
    const profile = await prisma.profiles.findUnique({
      where: { id: authData.user.id },
    });

    // 4. Kembalikan data sesi dan profil ke frontend
    return NextResponse.json(
      {
        message: "Login berhasil",
        session: authData.session, // Menyimpan access token dan refresh token
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: profile?.full_name || "",
          role: profile?.role || "USER",
          vendor_id: profile?.vendor_id || null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ralat log masuk:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}