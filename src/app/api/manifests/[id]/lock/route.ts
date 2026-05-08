import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ManifestStatus } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.manifests.findUnique({
      where: {
        id,
      },
      select: {
        is_locked: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Dokumen tidak ditemukan" },
        { status: 404 },
      );
    }

    if (existing.is_locked) {
      return NextResponse.json(
        { error: "Dokumen sudah terkunci" },
        { status: 403 },
      );
    }

    const lockedManifest = await prisma.manifests.update({
      where: { id },
      data: {
        is_locked: true,
        status: ManifestStatus.LOCKED,
        departure_date: new Date(),
        locked_at: new Date()
      },
    });

    return NextResponse.json(
      {
        message: "Manifest berhasil dikunci, barang siap untuk diberangkatkan",
        data: lockedManifest,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
