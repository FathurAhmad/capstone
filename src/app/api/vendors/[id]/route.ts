import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const vendor = await prisma.vendors.findUnique({
            where: {
                id: id
            }
        });

        if (!vendor) {
            return NextResponse.json({ error: 'Vendor tidak ditemukan '}, { status: 404 });
        }

        console.log(vendor);

        return NextResponse.json(vendor);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error '}, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        const vendorUpdate = await prisma.vendors.update({
            where: { id: id },
            data: body
        })

        return NextResponse.json(vendorUpdate)
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengubah data vendor' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params}: RouteParams ) {
    try {
        const { id } = await params;

        await prisma.vendors.update({
            where: { id: id},
            data: {
                deleted_at: new Date(),
            }
        })
        return NextResponse.json({ message: 'Vendor berhasil dihapus'}, { status: 200 })
    } catch (error) {
        console.error('DELETE_VENDOR_ERROR', error);
        return NextResponse.json({ error: 'Gagal menghapus vendor' }, { status: 500 })
    }    
}