"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/app/context/authContext";
import { getSupabaseClient } from "@/lib/supabase-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
    }
  }, [user]);

  if (!user) {
    return <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">Memuat profil...</div>;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const payload: any = { full_name: fullName };
      if (password) {
        payload.password = password;
      }

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Profil berhasil diperbarui!");
        setPassword("");
        // Reload untuk memperbarui state auth secara penuh
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal memperbarui profil");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan server");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran maksimal foto adalah 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const token = localStorage.getItem("access_token");

      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/avatars/${filePath}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": file.type
        },
        body: file
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.message || "Gagal mengunggah foto ke storage");
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${filePath}`;

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar_url: publicUrl }),
      });

      if (res.ok) {
        toast.success("Foto profil berhasil diperbarui!");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error("Gagal menyimpan foto profil");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan saat mengunggah foto");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] py-8">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 border border-gray-100">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()}
              className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
          </div>

          <div className="flex flex-col md:flex-row gap-10">
            {/* Kolom Foto Profil */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group w-40 h-40 rounded-full border-4 border-gray-50 shadow-md overflow-hidden bg-gray-100">
                <img 
                  src={user.avatar_url || "/vendor/avatar.png"} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="text-white text-sm font-medium px-4 py-2 bg-black bg-opacity-50 rounded-lg hover:bg-opacity-80"
                  >
                    {isUploading ? "Mengunggah..." : "Ubah Foto"}
                  </button>
                </div>
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <p className="text-xs text-gray-500 text-center max-w-[160px]">
                Format yang didukung: JPG, PNG. Ukuran maksimal 2MB.
              </p>
            </div>

            {/* Kolom Form Profil */}
            <div className="flex-1">
              <div className="mb-6 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
                <p className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-1">Role Anda</p>
                <p className="text-xl font-bold">{user.role}</p>
                <p className="text-sm opacity-80 mt-1">{user.email}</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] transition-shadow"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubah Password (Opsional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] transition-shadow"
                    placeholder="Kosongkan jika tidak ingin mengubah"
                    minLength={6}
                  />
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full md:w-auto px-8 py-3 bg-[#1a3a7c] text-white font-bold rounded-xl shadow-md hover:bg-[#122859] hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
