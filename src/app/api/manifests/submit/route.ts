import { prisma } from '@/lib/prisma';
import { ManifestStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil vendor_id asli berdasarkan user login
    const profile = await prisma.profiles.findUnique({ where: { id: user.id } });
    if (!profile || !profile.vendor_id) {
      return NextResponse.json({ error: 'Akses ditolak. Anda bukan vendor.' }, { status: 403 });
    }
    
    const secureVendorId = profile.vendor_id;

    const body = await request.json();
        // Destructuring data yang dikirim dari Frontend / Postman
    const { 
      vendor_id: spoofed_vendor_id, // Abaikan vendor_id dari body untuk keamanan BOLA
      driver_name, 
      vehicle_plate, 
      estimated_arrival, // Perlu dibuatkan jalur khusus agar menerima payload data tanggal dari fe
      items // Ini adalah array of objects (daftar barang)
    } = body;

    const vendor_id = secureVendorId; // Ganti dengan vendor_id asli dari database

    // Validasi Dasar
    if (!vendor_id || !items || !driver_name || !vehicle_plate || items.length === 0) {
      return NextResponse.json(
        { error: 'Data tidak lengkap. Pastikan semua kolom sudah terisi.' }, 
        { status: 400 }
      );
    }

    // Mencari vendor id sebagai salah satu bagian dari manifest number
    const vendor = await prisma.vendors.findFirst({
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

    console.log(`Urutan manifest:`, sequence)

    // Eksekusi Database (Prisma Transaction)
    const newManifest = await prisma.manifests.create({
      data: {
        manifest_number: generatedManifestNumber,
        vendor_id,
        driver_name,
        vehicle_plate,
        is_locked: true,
        status: ManifestStatus.LOCKED,
        // Konversi string tanggal ke object Date
        estimated_arrival: estimated_arrival ? new Date(estimated_arrival) : null, // Bisa dibuatkan api khusus untuk mengambil data tanggal dari frontend

        // Insert ke tabel manifest_items secara bersamaan
        manifest_items: {
          create: items.map((item: any) => ({
            part_id: item.part_id,
            expected_qty: item.expected_qty,
            expected_boxes: item.expected_boxes,
            batch_code: item.batch_code, //diisi manual oleh petugas karena harus melihat kode produksi pada barang
            qr_codes: {
              create: [
                { qr_payload: uuidv4() } // Auto-generate QR Payload unik
              ]
            }
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
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Nomor manifest sudah pernah digunakan.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}