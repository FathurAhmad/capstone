import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  try {
    // 1. Ambil token daripada header Authorization
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    // 2. Sahkan token terus ke Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Access token failed" },
        { status: 401 }
      );
    }

    // 3. Ambil data profil terkini daripada Prisma
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
    });

    // 4. Kembalikan data pengguna yang sah
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          full_name: profile?.full_name || "",
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