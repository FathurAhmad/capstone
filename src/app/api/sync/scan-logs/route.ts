import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Tidak lagi menggunakan uploadBase64Image karena Frontend yang akan langsung upload ke Supabase

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, manifest_id, scan_logs = [], evidences = [], signatures } = body;

    if (!session_id || !manifest_id) {
      return NextResponse.json({ error: "Missing session_id or manifest_id" }, { status: 400 });
    }

    // --- Validasi Poin 3: Payload & DoS Protection ---
    if (!Array.isArray(scan_logs) || scan_logs.length > 500) {
      return NextResponse.json({ error: "Payload scan_logs tidak valid atau melebihi batas (maks 500 item)" }, { status: 400 });
    }

    for (const log of scan_logs) {
      if (typeof log.actual_qty !== 'number' || log.actual_qty < 0 || typeof log.expected_qty !== 'number') {
        return NextResponse.json({ error: "Tipe data kuantitas tidak valid. Harus berupa angka positif." }, { status: 400 });
      }
    }

    // --- Validasi Poin 5: Logical Flaw pada Relasi Data ---
    // Pastikan part_id yang dikirim benar-benar ada di dalam manifest_items untuk manifest_id ini
    const validManifestItems = await prisma.manifest_items.findMany({
      where: { manifest_id: manifest_id },
      select: { part_id: true }
    });
    
    const validPartIds = new Set(validManifestItems.map(item => item.part_id));

    for (const log of scan_logs) {
      if (!validPartIds.has(log.part_id)) {
        return NextResponse.json({ error: `Terdapat barang ilegal! Part ID ${log.part_id} tidak terdaftar pada manifest ini.` }, { status: 400 });
      }
    }

    // 1 & 2. Mengambil URL langsung dari payload (Frontend sudah melakukan proses upload ke Supabase)
    const driverSigUrl = signatures?.driver_url || null;
    const staffSigUrl = signatures?.staff_url || null;

    // 3. Simpan data menggunakan Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      // Buat atau Update Sesi Inbound
      const inboundSession = await tx.inbound_sessions.upsert({
        where: { id: session_id },
        update: {
          completed_at: new Date(),
          driver_signature_url: driverSigUrl,
          staff_signature_url: staffSigUrl,
        },
        create: {
          id: session_id,
          manifest_id: manifest_id,
          completed_at: new Date(),
          driver_signature_url: driverSigUrl,
          staff_signature_url: staffSigUrl,
        }
      });

      // 2. Siapkan data untuk Bulk Insert (Menghindari N+1 Query)
      const scanLogsData = scan_logs.map((log: any) => ({
        id: log.id,
        session_id: session_id,
        part_id: log.part_id,
        actual_qty: log.actual_qty,
        scan_status: log.scan_status,
        scanned_at: new Date(log.scanned_at || Date.now()),
      }));

      const evidencesData = evidences
        .filter((ev: any) => ev.photo_url)
        .map((ev: any) => ({
          id: ev.id,
          scan_id: ev.scan_id,
          photo_url: ev.photo_url,
          remark: ev.remark || "",
        }));

      // Eksekusi Bulk Insert Sekaligus
      if (scanLogsData.length > 0) {
        await tx.scan_logs.createMany({
          data: scanLogsData,
          skipDuplicates: true, // Aman dari percobaan ulang
        });
      }

      if (evidencesData.length > 0) {
        await tx.digital_evidence.createMany({
          data: evidencesData,
          skipDuplicates: true,
        });
      }

      // 3. Proses Discrepancies menggunakan In-Memory Aggregation
      let hasDiscrepancy = false;
      const problematicScanLogs = scan_logs.filter((log: any) => log.actual_qty !== log.expected_qty || log.scan_status !== 'MATCH');

      if (problematicScanLogs.length > 0) {
        hasDiscrepancy = true;

        // Ambil master item sekaligus (1 Query)
        const manifestItems = await tx.manifest_items.findMany({
          where: { manifest_id: manifest_id }
        });
        const manifestItemsMap = new Map(manifestItems.map(item => [item.part_id, item]));

        // Hitung total scan per part_id dari payload ini di RAM
        const scanAggregates = new Map<string, number>(); 
        for (const log of problematicScanLogs) {
           scanAggregates.set(log.part_id, (scanAggregates.get(log.part_id) || 0) + log.actual_qty);
        }

        // Ambil data selisih yang sudah ada sekaligus (1 Query)
        const manifestItemIds = manifestItems.map(m => m.id);
        const existingDiscs = await tx.discrepancies.findMany({
          where: { manifest_item_id: { in: manifestItemIds } }
        });
        const existingDiscMap = new Map(existingDiscs.map(d => [d.manifest_item_id, d]));

        // Lakukan Create/Update berdasarkan rangkuman memori
        for (const [part_id, total_actual_qty] of scanAggregates.entries()) {
          const mItem = manifestItemsMap.get(part_id);
          if (!mItem) continue;

          const existingDisc = existingDiscMap.get(mItem.id);
          
          if (existingDisc) {
            // Update
            const newActualQty = existingDisc.actual_qty + total_actual_qty;
            const newVariance = newActualQty - mItem.expected_qty;
            const newType = newVariance < 0 ? 'MISSING' : (newVariance > 0 ? 'OVER' : 'DAMAGED');
            
            await tx.discrepancies.update({
              where: { id: existingDisc.id },
              data: {
                actual_qty: newActualQty,
                variance: newVariance,
                discrepancy_type: newType
              }
            });
          } else {
            // Create
            const expected_qty = mItem.expected_qty;
            const variance = total_actual_qty - expected_qty;
            const newType = variance < 0 ? 'MISSING' : (variance > 0 ? 'OVER' : 'DAMAGED');

            await tx.discrepancies.create({
              data: {
                manifest_item_id: mItem.id,
                expected_qty: expected_qty,
                actual_qty: total_actual_qty,
                variance: variance,
                discrepancy_type: newType,
                resolution_status: 'PENDING',
              }
            });
          }
        }
      }

      // 4. Update Status Manifes
      const newStatus = hasDiscrepancy ? 'DISCREPANCY' : 'COMPLETED';
      await tx.manifests.update({
        where: { id: manifest_id },
        data: { status: newStatus }
      });

      return { sessionId: inboundSession.id, newStatus };
    });

    return NextResponse.json({ 
      message: "Data tersinkronisasi", 
      status: result.newStatus 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Sinkronisasi gagal:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
