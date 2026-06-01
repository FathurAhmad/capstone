"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Link from "next/link";

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {name[0]}
    </div>
  );
}

export default function PetugasDashboard() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [manifests, setManifests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManifests = async () => {
      try {
        // Ambil semua manifest
        const res = await fetch("/api/manifests");
        const data = await res.json();
        
        // Filter hanya manifes yang BUKAN DRAFT
        const pending = data.filter((m: any) => m.status !== 'DRAFT');
        setManifests(pending);
      } catch (error) {
        console.error("Failed to fetch manifests", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchManifests();
  }, []);

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* CONTENT */}
      <div className="px-8 py-6">
        {/* Header + Search + Date */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 w-64">
              <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none text-sm text-gray-600" />
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="relative">
              <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 hover:border-blue-400">
                <span className="text-sm text-gray-600">{formatDate(selectedDate)}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              {showCalendar && (
                <div className="absolute right-0 top-10 z-50 shadow-lg rounded-xl overflow-hidden">
                  <Calendar
                    onChange={(val) => {
                      setSelectedDate(val as Date);
                      setShowCalendar(false);
                    }}
                    value={selectedDate}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {/* PENDING DECISIONS TABLE */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="font-semibold text-gray-800 mb-4">Tugas Pengecekan Menunggu</p>
          
          {loading ? (
            <div className="text-center py-10 text-gray-500">Memuat data...</div>
          ) : manifests.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Tidak ada tugas pengecekan saat ini.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-normal text-gray-400">ID Manifes</th>
                    <th className="text-left py-2 font-normal text-gray-400">Tanggal</th>
                    <th className="text-left py-2 font-normal text-gray-400">Vendor</th>
                    <th className="text-left py-2 font-normal text-gray-400">Total Item</th>
                    <th className="text-left py-2 font-normal text-gray-400">Status</th>
                    <th className="text-left py-2 font-normal text-gray-400">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {manifests.map((m: any) => (
                    <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-gray-900 font-medium">{m.manifest_number}</td>
                      <td className="py-4 text-gray-600">
                        {new Date(m.created_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="py-4 text-gray-600">{m.vendors?.name || "-"}</td>
                      <td className="py-4 text-gray-600">{m.manifest_items?.length || 0} Barang</td>
                      <td className="py-4">
                        <span className={`text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-sm ${m.status === "Approved" || m.status === "COMPLETED" ? "bg-green-500" : m.status === "Pending" ? "bg-orange-400" : m.status === "LOCKED" ? "bg-orange-500" : m.status === "CHECKING" ? "bg-blue-500" : m.status === "DRAFT" ? "bg-gray-400" : m.status === "DISCREPANCY" ? "bg-red-500" : "bg-red-500"}`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {m.status === 'LOCKED' ? (
                          <Link 
                            href={`/petugas/manifest/${m.id}`}
                            className="bg-[#1a3a7c] hover:bg-[#122859] text-white text-xs px-5 py-2 rounded-lg font-bold shadow-sm transition-colors inline-block"
                          >
                            Mulai Cek
                          </Link>
                        ) : m.status === 'CHECKING' ? (
                          <Link 
                            href={`/petugas/manifest/${m.id}`}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-5 py-2 rounded-lg font-bold shadow-sm transition-colors inline-block"
                          >
                            Lanjut Cek
                          </Link>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 text-xs px-5 py-2 rounded-lg font-bold shadow-sm inline-block">
                            Selesai
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
