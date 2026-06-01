import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const parts = await prisma.parts.findUnique({
            where: {
                id: id
            }
        })

        if (!parts) {
            return NextResponse.json({ error: 'Barang tidak ditemukan'}, { status: 404 })
        }

        return NextResponse.json(parts);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error'}, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const updateParts = await prisma.parts.update({
            where: { id: id },
            data: body
        })

        return NextResponse.json(
            { message: 'Data berhasil diperbarui'},
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json({ error: 'Invalid server error'}, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        await prisma.parts.update({
            where: { id: id },
            data: {
                deleted_at: new Date(),
            }
        })

        return NextResponse.json({ message: 'Part berhasil dihapus' }, { status: 200 });
    } catch (error) {
        console.error('DELETE_PART_ERROR', error);
        return NextResponse.json({ error: 'Gagal menghapus part' }, { status: 500 });
    }
}