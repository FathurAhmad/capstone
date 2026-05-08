"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NavbarProps = {
  items: NavItem[];
};

export default function Navbar({ items }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const activeClass = "text-[#1a3a7c] font-semibold";
  const inactiveClass = "text-gray-600 hover:text-[#1a3a7c]";

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <img src="/login/logo.png" alt="Match-Up Logo" className="h-9 md:h-12" />

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {items.map((item) => (
            <a key={item.href} href={item.href} className={`flex flex-col items-center gap-1 text-xs transition-colors ${pathname === item.href ? activeClass : inactiveClass}`}>
              {item.icon}
              {item.label}
            </a>
          ))}
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Ailsa Zahra</span>
            <div className="w-9 h-9 rounded-full bg-gray-300 overflow-hidden">
              <img
                src="/vendor/avatar.png"
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile: profile + hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
            <img
              src="/vendor/avatar.png"
              alt="avatar"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
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

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-1 border-t border-gray-100 pt-3">
          <div className="px-2 py-2 flex items-center gap-2 border-b border-gray-100 mb-1">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
              <img
                src="/vendor/avatar.png"
                alt="avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700">Ailsa Zahra</span>
          </div>
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${pathname === item.href ? "bg-blue-50 text-[#1a3a7c] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
