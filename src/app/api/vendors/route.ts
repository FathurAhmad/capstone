import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { error } from "console";

export async function GET() {
    try {
        const vendors = await prisma.vendors.findMany({
            where: { deleted_at: null },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(vendors, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Gagal mengambil data vendor "}, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { vendor_code, name, address } = body;

        if (!name) {
            return NextResponse.json({ error: "Nama vendor wajib diisi! "}, { status: 400 });
        }

        let finalCode = vendor_code;
        if (!finalCode) {
            const vendorCount = await prisma.vendors.count();
            finalCode = `V${(vendorCount + 1).toString().padStart(3, '0')}`;
        }

        const newVendor = await prisma.vendors.create({
            data: {
                vendor_code: finalCode,
                name,
                address
            },
        });

        return NextResponse.json(newVendor, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Gagal menambahkan vendor" }, { status: 500 });
    }
}