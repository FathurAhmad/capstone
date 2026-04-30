import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "console";
import { Pinyon_Script } from "next/font/google";

type RouteParams = { params: Promise<{ id: string }>};

export async function POST(request: Request, { params }: RouteParams) {
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