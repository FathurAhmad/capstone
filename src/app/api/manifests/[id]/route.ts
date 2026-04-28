import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RedirectType } from "next/navigation";
import { requestFormReset } from "react-dom";
import { error } from "console";

type RouteParams = { params: Promise<{ id: string }>};

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const manifest = await prisma.manifests.findUnique({
            where: { 
                id: id 
            },
            include: {
                manifest_items: true,
            }
        })

        if (!manifest) {
            return NextResponse.json({ error: 'Data manifest tidak ditemukan' }, { status: 404})
        }

        return NextResponse.json(manifest, { status: 200} );
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error'}, { status: 500 });
    }    
}