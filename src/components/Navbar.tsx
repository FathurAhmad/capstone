"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link"; // Wajib gunakan Link dari Next.js
import { useAuth } from "@/app/context/authContext";

// Import konfigurasi yang sudah kita buat sebelumnya
import { NAV_ITEMS, Role } from "@/config/Navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Mengambil state auth, pastikan object user memiliki properti role
  const { user, logout } = useAuth();

  if (pathname === "/login") {
    return null;
  }

  // Jika user belum load, kita anggap guest/staff (atau kembalikan null untuk loading screen)
  const userRole = (user?.role as Role);

  // Filter menu secara dinamis berdasarkan role user yang login
  const allowedMenus = NAV_ITEMS.filter(item =>
    item.allowedRoles.includes(userRole)
  );

  const activeClass = "text-[#1a3a7c] font-semibold";
  const inactiveClass = "text-gray-600 hover:text-[#1a3a7c]";

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <Link href="/">
          <img src="/login/logo.png" alt="Match-Up Logo" className="h-9 md:h-12" />
        </Link>

        {/* --- DESKTOP MENU --- */}
        <div className="hidden md:flex items-center gap-6">
          {allowedMenus.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs transition-colors ${isActive ? activeClass : inactiveClass}`}
              >
                <Icon className="w-6 h-6" />
                {item.label}
              </Link>
            );
          })}

          <div className="w-px h-8 bg-gray-200" />

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {user.full_name}
              </span>
              <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden">
                <img
                  src="/vendor/avatar.png"
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <button
                onClick={logout}
                className="flex flex-col items-center justify-between text-sm itemc font-medium text-red-600 hover:text-red-700 ml-1 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium text-[#1a3a7c]">
              Login
            </Link>
          )}
        </div>

        {/* --- MOBILE: PROFILE + HAMBURGER --- */}
        <div className="flex md:hidden items-center gap-3">
          {user && (
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <img
                src="/vendor/avatar.png"
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 hover:text-[#1a3a7c]">
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* --- MOBILE DROPDOWN MENU --- */}
      {menuOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3">
          {user && (
            <div className="px-2 py-2 flex items-center gap-2 border-b border-gray-100 mb-1">
              <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                <img
                  src="/vendor/avatar.png"
                  alt="avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{user.full_name}</span>
            </div>
          )}

          {allowedMenus.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "bg-blue-50 text-[#1a3a7c] font-semibold" : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          {user && (
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 mt-1 transition-colors text-left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}