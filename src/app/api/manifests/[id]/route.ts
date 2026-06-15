import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const manifest = await prisma.manifests.findUnique({
      where: {
        id: id,
      },
      include: {
        manifest_items: {
          include: {
            parts: true,
            qr_codes: true,
            discrepancies: true
          }
        },
        inbound_sessions: {
          include: {
            scan_logs: {
              include: {
                digital_evidence: true
              }
            }
          }
        },
        vendors: true
      },
    });

    if (!manifest) {
      return NextResponse.json(
        { error: "Data manifest tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(manifest, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    console.log(`Debug 1: Mendapatkan ID:`, id)

    const { items, id: _id, status: _status, ...headerData } = body;

    console.log(`Debug 2: Mendapatkan Payload Body:`, JSON.stringify(body, null, 2))

    const existing = await prisma.manifests.findUnique({
      where: { id },
      select: { is_locked: true }
    })

    console.log(`Debug 3: Mendapatkan manifests yang terkunci atau tidak:`, existing)

    if (!existing || existing.is_locked) {
      return NextResponse.json({ error: 'Dokumen sudah terkunci atau dokumen tidak ditemukan'}, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update Header secara dinamis
      // Semua field yang ada di 'headerData' (misal: driver, vehicle, notes, date, dll)
      // akan otomatis diperbarui selama nama field di JSON sama dengan di schema.prisma
      await tx.manifests.update({
        where: { id },
        data: headerData,
      });

      // Logika Hapus & Buat Ulang Items (Data Anak)
      if (items && Array.isArray(items)) {
        await tx.manifest_items.deleteMany({
          where: { manifest_id: id },
        });

        // Jika datanya ada, maka akan dibuatkan per baris agar bisa support nested create untuk qr_codes
        if (items.length > 0) {
          await Promise.all(
            items.map((item: any) =>
              tx.manifest_items.create({
                data: {
                  manifest_id: id,
                  part_id: item.part_id,
                  expected_qty: item.expected_qty,
                  expected_boxes: item.expected_boxes,
                  batch_code: item.batch_code,
                  qr_codes: {
                    create: [
                      { qr_payload: uuidv4() }
                    ]
                  }
                }
              })
            )
          );
        }
      }

      // Mengembalikan agar manifests update berdasarkan id dan mengikutkan manifest_items in case ada data item yang diubah
      return tx.manifests.findUnique({
        where: { id },
        include: { manifest_items: true },
      });
    });

    console.log(`Debug 4: Mendapatkan hasil update data:`, result);
    return NextResponse.json({ message: "Manifest diperbarui", data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error'}, { status: 500} )
  }
}
