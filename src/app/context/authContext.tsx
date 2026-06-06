"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Tipe data sesuai dengan yang dikirim backend Anda
interface User {
  id: string;
  email: string;
  full_name: string;
  role: string; // "VENDOR", "STAFF", "MANAGER"
  vendor_id: string | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setSession: (user: User, token: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  setSession: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchSession() {
      const token = localStorage.getItem("access_token");
      
      const publicPaths = ["/login"]; // Tambahkan path public lainnya jika ada (misal: "/")

      // Jika tidak ada token dan user mengakses halaman protected, lempar ke login
      if (!token) {
        setLoading(false);
        if (!publicPaths.includes(pathname)) {
          router.push("/login");
        }
        return;
      }

      try {
        const res = await fetch("/api/auth/session", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user); // Simpan profil user secara global!
        } else {
          // Token tidak valid atau expired
          localStorage.removeItem("access_token");
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          setUser(null);
          if (!publicPaths.includes(pathname)) {
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("Gagal mengambil sesi:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []); // Hanya fetch satu kali saat aplikasi pertama kali dimuat

  const setSession = (userData: User, token: string) => {
    localStorage.setItem("access_token", token);
    document.cookie = `access_token=${token}; path=/; max-age=86400;`;
    setUser(userData);
  };

  const logout = async () => {
    localStorage.removeItem("access_token");
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    setUser(null);
    router.push("/login"); // Tendang ke halaman login
  };

  const publicPaths = ["/login"];
  const isProtectedRoute = !publicPaths.includes(pathname);

  // Mencegah "flash of unauthenticated content" (halaman terlihat sepersekian detik)
  // Tampilkan loading jika masih proses cek sesi, atau jika user di route protected tapi belum ada data user (sedang mau redirect)
  const isPageLoading = loading || (isProtectedRoute && !user);

  return (
    <AuthContext.Provider value={{ user, loading, logout, setSession }}>
      {isPageLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
          <div className="flex flex-col items-center gap-3">
            <svg className="w-8 h-8 text-[#1a3a7c] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-[#1a3a7c] font-semibold animate-pulse">Memuat...</span>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Hook ajaib untuk dipakai di komponen mana saja
export const useAuth = () => useContext(AuthContext);