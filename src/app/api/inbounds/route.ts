import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const inbounds = await prisma.inbound_sessions.findMany({
            orderBy: { started_at: 'asc' }
        })

        return NextResponse.json(inbounds, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error'}, { status: 500 })       
    }
}