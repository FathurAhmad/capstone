import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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