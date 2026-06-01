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

    // Validasi status
    const validStatuses = ["APPROVED", "RETURNED", "RECOUNT", "HOLD"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 3. Eksekusi update ke database menggunakan id yang sudah diekstrak
    const resolution = await prisma.discrepancies.update({
      where: { id: id }, 
      data: {
        resolution_status: status, // e.g., 'APPROVED', 'RETURNED', 'RECOUNT', 'HOLD'
        resolved_by: resolvedBy, // user.id (UUID)
        resolved_at: new Date(),
        // Catatan: Pastikan kolom remark sudah ditambahkan di schema Prisma jika Anda mengirimkannya dari frontend
      },
    });

    // Logika Auto-Complete Manifest
    if (resolution.manifest_id && status !== "HOLD" && status !== "RECOUNT") {
      // Cek apakah masih ada discrepancy lain dalam manifest ini yang belum selesai (masih PENDING, HOLD, atau RECOUNT)
      const unresolvedDiscrepancies = await prisma.discrepancies.count({
        where: {
          manifest_id: resolution.manifest_id,
          resolution_status: {
            in: ["PENDING", "HOLD", "RECOUNT"]
          }
        }
      });

      if (unresolvedDiscrepancies === 0) {
        // Jika semua item bermasalah sudah diputuskan, update status manifes utama menjadi COMPLETED
        await prisma.manifests.update({
          where: { id: resolution.manifest_id },
          data: { status: "COMPLETED" }
        });
      }
    }

    return NextResponse.json(resolution);
  } catch (error) {
    // Tambahkan console.error untuk mempermudah debugging di terminal
    console.error("Error pada proses resolve discrepancy:", error);
    return NextResponse.json({ error: "Gagal resolve discrepancy" }, { status: 500 });
  }
}