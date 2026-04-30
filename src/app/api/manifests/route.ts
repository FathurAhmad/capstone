import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const manifests = await prisma.manifests.findMany({
            orderBy: { manifest_number: 'asc'},
            include: {
                manifest_items: true
            }
        })

        return NextResponse.json(manifests, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data manifests'}, { status: 500});
    }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
        // Destructuring data yang dikirim dari Frontend / Postman
    const { 
      vendor_id, 
      driver_name, 
      vehicle_plate, 
      estimated_arrival, 
      items // Ini adalah array of objects (daftar barang)
    } = body;

    // Validasi Dasar
    if (!vendor_id || !items || !driver_name || !vehicle_plate || items.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak lengkap. Pastikan semua kolom sudah terisi.' }, 
        { status: 400 }
      );
    }

    // Mencari vendor id sebagai salah satu bagian dari manifest number
    const vendor = await prisma.vendors.findUnique({
      where: { id: vendor_id },
      select: { name: true } // Mengambil id berdasarkan input nama
    })

    // Mengambil 4 digit pertama dari vendor id
    const vendorCode = vendor?.name.substring(0, 3).toUpperCase() || "VND";

    // Mengambil data tanggal hari ini
    const todayDate = new Date();
    const dateString = todayDate.toISOString().split('T')[0].replace(/-/g, '');

    // Menghitung jumlah manifest yang sudah dibuat dalam 1 hari di vendor yang sama
    const dailyManifestsCount = await prisma.manifests.count({
      where: {
        vendor_id: vendor_id,
        created_at: {
          gte: new Date(todayDate.setHours(0,0,0,0)),
          lt: new Date(todayDate.setHours(23,59,59,999))
        }
      }
    })    

    // Menggabungkan beberapa data di atas menjadi manifest number
    const sequence = (dailyManifestsCount + 1).toString().padStart(3, '0');
    const generatedManifestNumber = `${vendorCode}-${dateString}-${sequence}`;

    // Eksekusi Database (Prisma Transaction)
    const newManifest = await prisma.manifests.create({
      data: {
        manifest_number: generatedManifestNumber,
        vendor_id,
        driver_name,
        vehicle_plate,
        // Konversi string tanggal ke object Date
        estimated_arrival: estimated_arrival ? new Date(estimated_arrival) : null, // Bisa dibuatkan api khusus untuk mengambil data tanggal dari frontend
        status: 'draft',

        // Insert ke tabel manifest_items secara bersamaan
        manifest_items: {
          create: items.map((item: any) => ({
            part_id: item.part_id,
            expected_qty: item.expected_qty,
            expected_boxes: item.expected_boxes,
            batch_code: item.batch_code, //diisi manual oleh petugas karena harus melihat kode produksi pada barang
          }))
        }
      },
      // Beri tahu Prisma untuk mengembalikan data beserta items-nya sebagai response
      include: {
        manifest_items: true 
      }
    });

    // 3. Kembalikan Response Sukses
    return NextResponse.json(
      { 
        message: 'Manifest berhasil disimpan.', 
        data: newManifest 
      }, 
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error saat membuat manifest:', error);
    
    // Tangani error jika manifest_number duplikat (Unique Constraint)
    // if (error.code === 'P2002') {
    //   return NextResponse.json({ error: 'Nomor manifest sudah pernah digunakan.' }, { status: 409 });
    // }

    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}