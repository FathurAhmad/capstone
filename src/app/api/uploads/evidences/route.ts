import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin'; // Helper supabase admin/server

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    
    // Upload ke bucket 'evidences'
    const { data, error } = await supabaseAdmin.storage
      .from('evidences')
      .upload(`public/${Date.now()}_${fileName}`, file);

    if (error) throw error;

    // Ambil Public URL
    const { data: urlData } = supabaseAdmin.storage.from('evidences').getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}