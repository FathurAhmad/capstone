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

      let hasDiscrepancy = false;

      // Proses setiap scan_log
      for (const log of scan_logs) {
        // A. Insert Scan Log
        await tx.scan_logs.create({
          data: {
            id: log.id,
            session_id: session_id,
            part_id: log.part_id,
            actual_qty: log.actual_qty,
            scan_status: log.scan_status,
            scanned_at: new Date(log.scanned_at || Date.now()),
          }
        });

        // B. Cek apakah ada foto bukti (Digital Evidence) untuk scan_log ini
        const ev = evidences.find((e: any) => e.scan_id === log.id);
        
        if (ev && ev.photo_url) {
          await tx.digital_evidence.create({
            data: {
              id: ev.id,
              scan_id: log.id,
              photo_url: ev.photo_url,
              remark: ev.remark || "",
            }
          });
        }

        // C. Otomatisasi Tabel Discrepancies
        if (log.actual_qty !== log.expected_qty || log.scan_status !== 'MATCH') {
          hasDiscrepancy = true;

          const manifestItem = await tx.manifest_items.findFirst({
            where: { manifest_id: manifest_id, part_id: log.part_id }
          });
          
          if (manifestItem) {
            // Cari apakah sudah ada discrepancy untuk part ini di manifest ini (mencegah duplikasi dari concurrent scan)
            const existingDisc = await tx.discrepancies.findFirst({
              where: {
                manifest_item_id: manifestItem.id,
              }
            });

            if (existingDisc) {
              // Jika sudah ada, tambahkan (aggregate) actual_qty
              const newActualQty = existingDisc.actual_qty + log.actual_qty;
              const newVariance = newActualQty - log.expected_qty;
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
              // Buat baru jika belum ada
              const variance = log.actual_qty - log.expected_qty;
              const discrepancyType = variance < 0 ? 'MISSING' : (variance > 0 ? 'OVER' : 'DAMAGED');
              
              await tx.discrepancies.create({
                data: {
                  manifest_item_id: manifestItem.id,
                  expected_qty: log.expected_qty,
                  actual_qty: log.actual_qty,
                  variance: variance,
                  discrepancy_type: discrepancyType,
                  resolution_status: 'PENDING',
                }
              });
            }
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
