import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { driverSignatureUrl, staffSignatureUrl, id } = await request.json();

    const updatedSession = await prisma.inbound_sessions.update({
      where: { id: id },
      data: {
        driver_signature_url: driverSignatureUrl,
        staff_signature_url: staffSignatureUrl,
        completed_at: new Date(),
        status: "COMPLETED",
      },
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    return NextResponse.json({ error: "Gagal proses sign-off" }, { status: 500 });
  }
}