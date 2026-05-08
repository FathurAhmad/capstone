import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");

    const users = await prisma.profiles.findMany({
      where: roleFilter ? { role: roleFilter } : undefined,
      include: {
        vendors: true,
      },
      orderBy: { updated_at: "desc" },
    });

    console.log(users);

    if (!users) {
      return NextResponse.json(
        `User dengan role ${roleFilter} tidak ditemukan`,
      );
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
    // console.error("GET vendors error:", error);
    // throw error; // biar Next.js tampilkan stack trace
  }
}

export async function POST(request: Request) {
  let createdUserId: string | null = null;

  try {
    const body = await request.json();
    const { full_name, email, role } = body;

    // validasi input
    if (!full_name || !email || !role) {
      return NextResponse.json(
        { error: "Kolom masih tidak lengkap" },
        { status: 400 },
      );
    }

    const tempPassword = crypto.randomUUID().split("-")[0];

    // 1. Buat user di Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Gagal membuat auth user" },
        { status: 400 },
      );
    }

    createdUserId = authData.user.id;

    // 2. Buat profile (Prisma)
    await prisma.profiles.create({
      data: {
        id: createdUserId,
        full_name,
        role,
        // vendor_id: role === "vendor" ? vendor_id : null,
      },
    });

    return NextResponse.json(
      { message: "User baru berhasil ditambahkan" },
      { status: 201 },
    );
  } catch (error) {
    // rollback auth user jika profile gagal
    if (createdUserId) {
      await supabaseAdmin.auth.admin.deleteUser(createdUserId);
    }
  
    console.error("GET vendors error:", error);
    throw error; // biar Next.js tampilkan stack trace
  

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}