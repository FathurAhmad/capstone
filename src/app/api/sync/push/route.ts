import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Sesuaikan path prisma client Anda

export async function POST(request: Request) {
  try {
    const { scanLogs } = await request.json(); // Array dari log scan luring

    // Menggunakan Transaction untuk memastikan integritas data
    const result = await prisma.$transaction(async (tx) => {
      const syncResults = [];

      for (const log of scanLogs) {
        // 1. Catat log scan menggunakan upsert (idempotensi)
        const savedLog = await tx.scan_logs.upsert({
          where: { id: log.id }, // UUID yang dibuat di client
          update: {}, 
          create: {
            id: log.id,
            manifest_id: log.manifest_id,
            part_id: log.part_id,
            actual_qty: log.actual_qty,
            scanned_at: new Date(log.scanned_at),
          },
        });

        // 2. Ambil data ekspektasi dari manifest_items
        const manifestItem = await tx.manifest_items.findUnique({
          where: {
            manifest_id_part_id: {
              manifest_id: log.manifest_id,
              part_id: log.part_id,
            },
          },
        });

        // 3. Logika Rekonsiliasi: Cek Selisih
        if (manifestItem && log.actual_qty !== manifestItem.expected_qty) {
          const variance = log.actual_qty - manifestItem.expected_qty;
          
          await tx.discrepancies.upsert({
            where: { 
              manifest_id_part_id: { 
                manifest_id: log.manifest_id, 
                part_id: log.part_id 
              } 
            },
            update: {
              actual_qty: log.actual_qty,
              variance: variance,
              updated_at: new Date(),
            },
            create: {
              manifest_id: log.manifest_id,
              part_id: log.part_id,
              expected_qty: manifestItem.expected_qty,
              actual_qty: log.actual_qty,
              variance: variance,
              discrepancy_type: variance < 0 ? 'MISSING' : 'OVER',
              resolution_status: 'PENDING',
            },
          });
        }
        syncResults.push(savedLog.id);
      }
      return syncResults;
    });

    return NextResponse.json({ success: true, processed: result.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}