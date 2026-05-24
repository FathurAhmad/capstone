import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ManifestStatus } from "@prisma/client";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const vendor_id = searchParams.get('vendor_id');

        const manifests = await prisma.manifests.findMany({
            where: vendor_id ? { vendor_id } : undefined,
            orderBy: { created_at: 'desc' }, // Lebih baik diurutkan berdasarkan terbaru
            include: {
                manifest_items: {
                    include: {
                        parts: true
                    }
                },
                vendors: true,
                discrepancies: true
            }
        });

        return NextResponse.json(manifests, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data manifests'}, { status: 500});
    }
}