// lib/supabase/server.ts (atau nama file Anda)
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false, // Mencegah warning localStorage di server
      detectSessionInUrl: false
    }
  }
);