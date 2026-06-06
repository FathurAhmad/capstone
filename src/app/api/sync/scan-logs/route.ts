import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Fungsi bantuan untuk mengunggah Base64 ke Supabase Storage
async function uploadBase64Image(base64Str: string, bucket: string, path: string): Promise<string | null> {
  try {
    // Mengekstrak mime type dan data base64
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error("Format base64 tidak valid");
      return null;
    }
    
    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`Gagal mengunggah ke bucket ${bucket}:`, error.message);
      return null;
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.error("Kesalahan saat unggah Base64:", err);
    return null;
  }
}

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

    // 1. Upload Signatures (Driver & Staff)
    let driverSigUrl = null;
    let staffSigUrl = null;

    if (signatures?.driver) {
      const fileName = `${manifest_id}/driver_${Date.now()}.png`;
      driverSigUrl = await uploadBase64Image(signatures.driver, 'signatures', fileName);
    }
    
    if (signatures?.staff) {
      const fileName = `${manifest_id}/staff_${Date.now()}.png`;
      staffSigUrl = await uploadBase64Image(signatures.staff, 'signatures', fileName);
    }

    // 2. Upload Evidences secara paralel untuk mempercepat proses
    const evidenceUrls = new Map<string, string>(); // scan_id -> url
    if (evidences.length > 0) {
      const uploadPromises = evidences.map(async (ev: any) => {
        if (ev.photo_base64) {
          const fileName = `${manifest_id}/${ev.scan_id}_${Date.now()}.jpg`;
          const url = await uploadBase64Image(ev.photo_base64, 'evidences', fileName);
          if (url) {
            evidenceUrls.set(ev.scan_id, url);
          }
        }
      });
      await Promise.all(uploadPromises);
    }

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
        const evUrl = evidenceUrls.get(log.id);
        
        if (ev && evUrl) {
          await tx.digital_evidence.create({
            data: {
              id: ev.id,
              scan_id: log.id,
              photo_url: evUrl,
              remark: ev.remark || "",
            }
          });
        }

        // C. Otomatisasi Tabel Discrepancies
        if (log.actual_qty !== log.expected_qty || log.scan_status !== 'MATCH') {
          hasDiscrepancy = true;
          
          // Cari apakah sudah ada discrepancy untuk part ini di manifest ini (mencegah duplikasi dari concurrent scan)
          const existingDisc = await tx.discrepancies.findFirst({
            where: {
              manifest_id: manifest_id,
              part_id: log.part_id,
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
                manifest_id: manifest_id,
                part_id: log.part_id,
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
