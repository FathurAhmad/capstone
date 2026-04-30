"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = ["Vendor", "Petugas Gudang", "Manager"];

  const roleDashboardMap: Record<string, string> = {
    Vendor: "/vendor/dashboard",
    "Petugas Gudang": "/petugas/dashboard",
    Manager: "/manajemen/dashboard",
  };

  const handleLogin = async () => {
    if (!email || !password || !role) {
      setError("Email, password, dan role wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login gagal.");
        return;
      }

      const path = roleDashboardMap[data.role] ?? "/";
      router.push(path);
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
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

          {/* Select Role */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Role</label>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              <span className={role ? "text-gray-700" : "text-gray-400"}>{role || "Role"}</span>
              <span>▾</span>
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setRole(r);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
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
