import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Mendefinisikan tipe params sebagai Promise sesuai standar Next.js 15
type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    // 1. Await params untuk mendapatkan ID (dari URL endpoint)
    const { id } = await params;

    // 2. Ambil payload dari body request
    const { status, resolvedBy, remark } = await req.json();

    // 3. Eksekusi update ke database menggunakan id yang sudah diekstrak
    const resolution = await prisma.discrepancies.update({
      where: { id: id }, 
      data: {
        resolution_status: status, // e.g., 'APPROVED', 'RETURNED', 'RECOUNT'
        resolved_by: resolvedBy,
        resolved_at: new Date(),
        // Catatan: Pastikan kolom remark sudah ditambahkan di schema Prisma jika Anda mengirimkannya dari frontend
      },
    });

    return NextResponse.json(resolution);
  } catch (error) {
    // Tambahkan console.error untuk mempermudah debugging di terminal
    console.error("Error pada proses resolve discrepancy:", error);
    return NextResponse.json({ error: "Gagal resolve discrepancy" }, { status: 500 });
  }
}