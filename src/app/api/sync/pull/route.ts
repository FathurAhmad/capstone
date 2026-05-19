import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get("vendorId");

    const manifests = await prisma.manifests.findMany({
      where: {
        status: "LOCKED",
        ...(vendorId && { vendor_id: vendorId }),
      },
      include: {
        manifest_items: {
          include: { parts: true }
        },
        vendors: true,
      },
    });

    return NextResponse.json(manifests);
  } catch (error) {
    return NextResponse.json({ error: "Gagal menarik data sync" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { scanLogs } = await request.json();

    const result = await prisma.$transaction(async (tx) => {
      for (const log of scanLogs) {
        // 1. Simpan Log Scan (Idempotent menggunakan upsert)
        await tx.scan_logs.upsert({
          where: { id: log.id },
          update: { actual_qty: log.actual_qty },
          create: {
            id: log.id,
            session_id: log.session_id,
            part_id: log.part_id,
            actual_qty: log.actual_qty,
            qr_payload: log.qr_payload,
            scanned_at: new Date(log.scanned_at),
          },
        });

        // 2. Ambil target ekspektasi dari manifest_items
        const item = await tx.manifest_items.findFirst({
          where: { manifest_id: log.manifest_id, part_id: log.part_id }
        });

        if (item) {
          const variance = log.actual_qty - item.expected_qty;
          
          // 3. Jika ada selisih, catat ke tabel discrepancies
          if (variance !== 0) {
            await tx.discrepancies.upsert({
              where: { 
                manifest_id_part_id: { 
                  manifest_id: log.manifest_id, 
                  part_id: log.part_id 
                } 
              },
              update: { actual_qty: log.actual_qty, variance: variance },
              create: {
                manifest_id: log.manifest_id,
                part_id: log.part_id,
                expected_qty: item.expected_qty,
                actual_qty: log.actual_qty,
                variance: variance,
                discrepancy_type: variance < 0 ? "MISSING" : "OVER",
              },
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal sinkronisasi data" }, { status: 500 });
  }
}