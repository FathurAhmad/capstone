import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { error } from 'console';

const prisma = new PrismaClient;

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