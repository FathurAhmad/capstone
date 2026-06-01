import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { full_name, password } = body;

    // 1. Update password di Supabase Auth (JIKA password diisi)
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password minimal harus 6 karakter" },
          { status: 400 }
        );
      }

      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(id, {
        password: password,
      });

      if (authUpdateError) {
        return NextResponse.json(
          { error: authUpdateError.message || "Gagal mengubah password" },
          { status: 400 }
        );
      }
    }

    // 2. Update data profil di Prisma (JANGAN masukkan password ke sini)
    // Buat object update dinamis agar tidak error kalau full_name kosong
    const updateData: any = {
      updated_at: new Date(),
    };
    
    if (full_name) {
      updateData.full_name = full_name;
    }

    await prisma.profiles.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Data profil berhasil diperbarui" }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH User Error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { error: authDeleteError} = await supabaseAdmin.auth.admin.deleteUser(id)

        if (authDeleteError) {
            console.error("Supabase Auth Delete Error:", authDeleteError);
        }

        await prisma.profiles.update({
            where: { id },
            data: {
                deleted_at: new Date()
            }
        })

        return NextResponse.json({ message: "User berhasil dihapus" }, { status: 200 });
    } catch (error) {
        console.error("DELETE User Error:", error);
        return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
    }
}