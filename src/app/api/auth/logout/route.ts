import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Gunakan Service Role Key untuk operasi admin seperti memaksa log keluar di server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Session ended" }, { status: 200 });
    }

    const token = authHeader.split(" ")[1];

    // Batalkan sesi menggunakan token jwt pengguna di Supabase Auth
    await supabaseAdmin.auth.admin.signOut(token);

    return NextResponse.json(
      { message: "Berhasil logout" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}