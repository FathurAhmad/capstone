"use client";

import { useState, useEffect, useDeferredValue } from "react";
import dynamic from "next/dynamic";
const Calendar = dynamic(() => import("react-calendar"), { ssr: false });
import "react-calendar/dist/Calendar.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import Pagination from "@/components/Pagination";

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {name[0]}
    </div>
  );
}

export default function PetugasDashboard() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedDate]);

  const [rawManifests, setRawManifests] = useState<any[]>([]);
  const [manifests, setManifests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchManifests = async () => {
      try {
        // Ambil semua manifest
        const res = await fetch("/api/manifests");
        const data = await res.json();

        // Filter hanya manifes yang BUKAN DRAFT
        const pending = data.filter((m: any) => m.status !== "DRAFT");
        setRawManifests(pending);
        setManifests(pending);
      } catch (error) {
        console.error("Failed to fetch manifests", error);
      } finally {
        setLoading(false);
      }
    };

    fetchManifests();
  }, []);

  const formatDate = (date: Date | null) => {
    if (!date) return "Filter by Date";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  const filteredManifests = manifests.filter((m) => {
    const s = deferredSearch.toLowerCase();
    const matchSearch =
      !s ||
      m.manifest_number?.toLowerCase().includes(s) ||
      m.vendors?.name?.toLowerCase().includes(s);

    let matchDate = true;
    if (selectedDate) {
      const manifestDate = new Date(m.created_at);
      matchDate =
        manifestDate.getDate() === selectedDate.getDate() &&
        manifestDate.getMonth() === selectedDate.getMonth() &&
        manifestDate.getFullYear() === selectedDate.getFullYear();
    }

    return matchSearch && matchDate;
  });

  const totalPages = Math.ceil(filteredManifests.length / itemsPerPage);
  const currentManifests = filteredManifests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* CONTENT */}
      <div className="px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-5 md:mb-0">
            Dashboard
          </h1>
        </div>
        {/* PENDING DECISIONS TABLE */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 gap-4">
            <p className="font-semibold text-gray-800 text-lg">
              Tugas Pengecekan Menunggu
            </p>
            <div className="flex flex-col-reverse md:flex-row items-center gap-3 w-full xl:w-auto">
              {/* SEARCH */}
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 w-full md:w-64">
                <input
                  type="text"
                  placeholder="Cari No. Manifest atau Vendor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 outline-none text-sm text-gray-600 bg-transparent"
                />
                {search ? (
                  <button onClick={() => setSearch("")} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                ) : (
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>

              {/* DATE */}
              <div className="relative flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 hover:border-blue-400 whitespace-nowrap w-full md:w-auto"
                >
                  <span className="text-sm text-gray-600">
                    {formatDate(selectedDate)}
                  </span>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                {selectedDate && (
                  <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-red-500 flex-shrink-0" title="Clear Date">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {showCalendar && (
                  <div className="absolute right-0 top-12 z-50 shadow-xl rounded-xl overflow-hidden bg-white border border-gray-100">
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

              {/* RESET FILTERS */}
              {(search || selectedDate) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedDate(null);
                  }}
                  className="text-sm font-semibold text-gray-500 hover:text-red-500 whitespace-nowrap transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">
              Memuat data...
            </div>
          ) : filteredManifests.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              Tidak ada tugas pengecekan saat ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-normal text-gray-400">
                      ID Manifes
                    </th>
                    <th className="text-left py-2 font-normal text-gray-400">
                      Tanggal
                    </th>
                    <th className="text-left py-2 font-normal text-gray-400">
                      Vendor
                    </th>
                    <th className="text-left py-2 font-normal text-gray-400">
                      Total Item
                    </th>
                    <th className="text-left py-2 font-normal text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-2 font-normal text-gray-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentManifests.map((m: any) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 text-gray-900 font-medium">
                        {m.manifest_number}
                      </td>
                      <td className="py-4 text-gray-600">
                        {new Date(m.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 text-gray-600">
                        {m.vendors?.name || "-"}
                      </td>
                      <td className="py-4 text-gray-600">
                        {m.manifest_items?.length || 0} Barang
                      </td>
                      <td className="py-4">
                        <span
                          className={`text-white text-xs px-4 py-1.5 rounded-full font-bold shadow-sm ${m.status === "Approved" || m.status === "COMPLETED" ? "bg-green-500" : m.status === "Pending" ? "bg-orange-400" : m.status === "LOCKED" ? "bg-orange-500" : m.status === "CHECKING" ? "bg-blue-500" : m.status === "DRAFT" ? "bg-gray-400" : m.status === "DISCREPANCY" ? "bg-red-500" : "bg-red-500"}`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-4">
                        {m.status === "LOCKED" ? (
                          <Link
                            href={`/petugas/manifest/${m.id}`}
                            className="bg-[#1a3a7c] hover:bg-[#122859] text-white text-xs px-5 py-2 rounded-lg font-bold shadow-sm transition-colors inline-block"
                          >
                            Mulai Cek
                          </Link>
                        ) : m.status === "CHECKING" ? (
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
              {filteredManifests.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
