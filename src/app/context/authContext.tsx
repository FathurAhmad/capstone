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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchSession() {
      const token = localStorage.getItem("access_token");
      
      // Jika tidak ada token dan bukan di halaman login, biarkan user null
      if (!token) {
        setLoading(false);
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
          setUser(null);
        }
      } catch (error) {
        console.error("Gagal mengambil sesi:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, [pathname]); // Pengecekan ulang bisa ditrigger jika path berubah

  const logout = async () => {
    localStorage.removeItem("access_token");
    setUser(null);
    router.push("/login"); // Tendang ke halaman login
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook ajaib untuk dipakai di komponen mana saja
export const useAuth = () => useContext(AuthContext);