import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { data } from "autoprefixer";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { full_name, password } = body;

    if (password) {
      const { error: authUpdateError } =
        await supabaseAdmin.auth.admin.updateUserById(id, {
          password: password || undefined,
        });

      if (authUpdateError) {
        return NextResponse.json(
          { error: authUpdateError.message },
          { status: 400 },
        );
      }
    }

    const updateProfile = await prisma.profiles.update({
        where: { id },
        data: {
            full_name,
            password,
            updated_at: new Date()
        }
    })

    return NextResponse.json({ message: 'Data berhasil diubah'}, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error'}, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;

        const { error: authDeleteError} = await supabaseAdmin.auth.admin.deleteUser(id)

        const deleteProfile = await prisma.profiles.update({
            where: { id },
            data: {
                deleted_at: new Date()
            }
        })
    } catch (error) {
        
    }
}