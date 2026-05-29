import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ManifestStatus } from "@prisma/client";

export async function GET(request: Request) {

    try {
        const { searchParams } = new URL(request.url);
        const manifestStatus = searchParams.get('status');
        const manifests = await prisma.manifests.findMany({
            where: { status: manifestStatus as ManifestStatus },
            orderBy: { manifest_number: 'asc'},
            include: {
                manifest_items: true,
                vendors: true
            }
        })

        return NextResponse.json(manifests, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data manifests'}, { status: 500});
    }
}