"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { convertServerPatchToFullTree } from "next/dist/client/components/segment-cache/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Login gagal.");
        return;
      }

      // 🛑 1. SIMPAN TOKEN KE LOCAL STORAGE AGAR TIDAK LUPA
      // (Asumsi backend merespons dengan data.session.access_token)
      if (data.session?.access_token) {
        localStorage.setItem("access_token", data.session.access_token);
        // Simpan ke cookie agar bisa dibaca oleh middleware.ts
        document.cookie = `access_token=${data.session.access_token}; path=/; max-age=86400;`;
      }

      // 🛑 2. PASTIKAN MAP ROLE SESUAI DATABASE (Contoh disamakan ke Uppercase)
      // Misal data dari Prisma: data.user.role = "VENDOR"
      const role = data.user?.role || data.role || "";
      const userRole = role.toUpperCase() // Sesuaikan dengan struktur JSON backend
      
      const roleMap: Record<string, string> = {
        "VENDOR": "/vendor/dashboard",
        "STAFF": "/petugas/dashboard",   // Di DB namanya STAFF, bukan Petugas Gudang
        "MANAGER": "/manajemen/dashboard",
        "ADMIN": "/manajemen/dashboard",        
      };

      // 🛑 3. REDIRECT
      // Ubah jadi uppercase untuk amannya saat mencocokkan
      const path = roleMap[userRole] ?? "/"; 
      router.push(path);

    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full">
      {/* KIRI - Form */}
      <div className="flex flex-col w-1/2 px-16 py-8 bg-white">
        <div className="mb-16">
          <img src="/login/logo.png" alt="Match-Up Logo" className="h-12" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-10">Welcome</h1>

        <div className="flex flex-col gap-5 max-w-sm">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 outline-none text-sm text-gray-700" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2">
              <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="flex-1 outline-none text-sm text-gray-700" />
              <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 text-sm">
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm -mt-2">{error}</p>}

          {/* Login Button */}
          <button onClick={handleLogin} disabled={loading} className="w-full bg-[#1a3a7c] text-white font-semibold py-3 rounded-lg mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Loading..." : "Login"}
          </button>
        </div>
      </div>

      {/* KANAN - Gambar */}
      <div className="w-1/2 relative">
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: "url('/login/login-hero.png')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundColor: "#f8f9fa",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, white 5%, transparent 40%)",
          }}
        />
      </div>
    </div>
  );
}
