import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            part_number,
            part_name,
            unit, //Jenis satuan (apakah pcs, box, dsb)
        } = body;

        if (!part_number || !part_name || !unit) {
            return NextResponse.json(
                { error: 'Data tidak lengkap, pastikan semua kolom sudah terisi' },
                {status: 400}
            );
        }

        const newParts = await prisma.parts.create({
            data: {
                part_number,
                part_name,
                unit
            }
        });

        return NextResponse.json(
            {
                message: 'Item berhasil ditamnbahkan.',
                data: newParts
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error saat menambahkan item baru: ', error);

        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Nomor items sudah pernah digunakan.' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Terjadi kesalahan pada server.' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const parts = await prisma.parts.findMany({
            where: { deleted_at: null },
            orderBy: { part_name: 'asc'}
        })

        return NextResponse.json(parts, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: "Gagal mengambil data parts "}, { status: 500 })
    }
}