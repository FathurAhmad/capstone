import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const totalManifests = await prisma.manifests.count();
    const totalDiscrepancies = await prisma.discrepancies.count({
      where: { resolution_status: "pending" }
    });
    
    // Agregat selisih per vendor (Contoh tren)
    const vendorIssues = await prisma.discrepancies.groupBy({
      by: ['manifest_id'],
      _count: { id: true },
    });

    return NextResponse.json({
      summary: {
        totalManifests,
        pendingIssues: totalDiscrepancies
      },
      vendorIssues
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat analitik" }, { status: 500 });
  }
}