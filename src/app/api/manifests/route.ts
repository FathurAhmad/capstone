import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ManifestStatus } from "@prisma/client";

export async function GET() {
    try {
        const manifests = await prisma.manifests.findMany({
            orderBy: { manifest_number: 'asc'},
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