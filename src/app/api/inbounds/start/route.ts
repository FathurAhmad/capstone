import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { ManifestStatus } from "@prisma/client";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const { manifest_number, user_id, gate_number } = body

        if(!manifest_number) {
            return NextResponse.json({ message: 'Kolom manifest number wajib diisi'}, { status: 404 })
        }

        const manifest = await prisma.manifests.findFirst({
            where: { manifest_number: manifest_number }
        })

        console.log(manifest)

        if (!manifest) {
            return NextResponse.json({ message: 'Data tidak ditemukan'}, { status: 404});
        }

        if(manifest.status !== ManifestStatus.LOCKED) {
            return NextResponse.json({ message: `Proses inbound tidak bisa dilakukan karena dokumen dengan nomor: ${manifest_number} sudah dikunci`}, { status: 403 })
        }

        const result = await prisma.$transaction(async (tx) => {
            await tx.manifests.update({
                where: { id: manifest.id },
                data: { 
                    status:ManifestStatus.CHECKING,
                    is_locked: false
                }
            })

            const newSession = await tx.inbound_sessions.create({
                data:{
                    manifest_id: manifest.id,
                    created_by: user_id,
                    gate_number: gate_number || null,
                    started_at: new Date
                }
            })

            return newSession
        })

        return NextResponse.json(
            { message: 'Sesi inbound dibuka'},
            { status: 201 }
        )
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error'}, { status: 500})
    }
}