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