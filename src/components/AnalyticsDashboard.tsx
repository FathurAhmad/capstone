"use client";

import { useState, useEffect, useDeferredValue } from "react";
import dynamic from "next/dynamic";
const Calendar = dynamic(() => import("react-calendar"), { ssr: false });
import "react-calendar/dist/Calendar.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import ManajemenReviewModal from "./ManajemenReviewModal";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";

export default function AnalyticsDashboard() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // State for analytics aggregates
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // State for dynamic manifests (for table)
  const [manifests, setManifests] = useState<any[]>([]);
  const [loadingManifests, setLoadingManifests] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reviewManifestId, setReviewManifestId] = useState<string | null>(null);
  const [confirmLockId, setConfirmLockId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, selectedDate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        setLoadingAnalytics(true);
        const res = await fetch("/api/dashboard/analytics", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    const fetchRecentManifests = async () => {
      let url = "/api/manifests";
      if (user?.role?.toUpperCase() === "VENDOR" && user?.vendor_id) {
        url += `?vendor_id=${user.vendor_id}`;
      }
      
      try {
        setLoadingManifests(true);
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setManifests(data);
        }
      } catch (error) {
        console.error("Failed to fetch manifests", error);
      } finally {
        setLoadingManifests(false);
      }
    };

    if (user) {
      fetchDashboardData();
      fetchRecentManifests();
    }
  }, [user]);

  const performLock = async (id: string) => {
    try {
      const res = await fetch(`/api/manifests/${id}/lock`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Manifest locked successfully.");
        // Refresh table
        let url = "/api/manifests";
        if (user?.role?.toUpperCase() === "VENDOR" && user?.vendor_id) {
          url += `?vendor_id=${user.vendor_id}`;
        }
        const refreshRes = await fetch(url);
        if (refreshRes.ok) setManifests(await refreshRes.json());
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to lock manifest");
      }
    } catch (error) {
      toast.error("Server error occurred.");
    } finally {
      setConfirmLockId(null);
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/admin/reset-db', {
        method: 'POST',
      });
      if (res.ok) {
        toast.success("Database reset successfully.");
        // Refresh table
        let url = "/api/manifests";
        if (user?.role?.toUpperCase() === "VENDOR" && user?.vendor_id) {
          url += `?vendor_id=${user.vendor_id}`;
        }
        const refreshRes = await fetch(url);
        if (refreshRes.ok) setManifests(await refreshRes.json());
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to reset database");
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal melakukan reset database.');
    } finally {
      setIsResetting(false);
      setConfirmResetOpen(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "Filter by Date";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  const deferredSearch = useDeferredValue(search);

  const filteredManifests = manifests.filter((m) => {
    const matchStatus = statusFilter === "ALL" || m.status === statusFilter;
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

    return matchStatus && matchSearch && matchDate;
  });

  const totalPages = Math.ceil(filteredManifests.length / itemsPerPage);
  const currentManifests = filteredManifests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Defaults if analytics still loading
  const totalShipments = analytics?.totalShipments || 0;
  const accuracyRate = analytics?.accuracyRate || "100.0";
  const openDiscrepancies = analytics?.openDiscrepancies || 0;
  const boxesDelivered = analytics?.boxesDelivered || 0;
  const dynamicLineData = analytics?.trendData || [];
  const dynamicBarData = analytics?.partStats || [];

  return (
    <div className="w-full">
      {/* Header + Search + Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Analytics Overview
          </h2>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-bold hover:bg-red-200 transition-colors"
            >
              Reset All Data
            </button>
          )}
        </div>
      </div>

      {loadingAnalytics ? (
        <div className="flex justify-center items-center h-48 bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <p className="text-gray-500 animate-pulse font-medium">Loading analytics data...</p>
        </div>
      ) : (
        <>
          {/* STAT CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div
              className="rounded-xl p-4 md:p-5 text-white flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "linear-gradient(135deg, #1EC0CF, #B1E9EE)" }}
            >
              <p className="text-xs md:text-sm mb-1 md:mb-2 opacity-90 font-medium">
                Total Shipments
              </p>
              <p className="text-3xl md:text-5xl font-bold">{totalShipments}</p>
            </div>
            <div
              className="rounded-xl p-4 md:p-5 text-white flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "linear-gradient(135deg, #6366f1, #C6DCF7)" }}
            >
              <p className="text-xs md:text-sm mb-1 md:mb-2 opacity-90 font-medium">
                Accuracy Rate
              </p>
              <p className="text-3xl md:text-5xl font-bold">{accuracyRate}%</p>
            </div>
            <div
              className="rounded-xl p-4 md:p-5 flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "linear-gradient(135deg, #EE91B7, #F9D7E5)" }}
            >
              <p className="text-xs md:text-sm mb-1 md:mb-2 text-red-600 font-bold">
                Open Discrepancies
              </p>
              <p className="text-3xl md:text-5xl font-bold text-red-500">
                {openDiscrepancies}
              </p>
            </div>
            <div
              className="rounded-xl p-4 md:p-5 text-white flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-shadow"
              style={{ background: "linear-gradient(135deg, #a78bfa, #F1EDFB)" }}
            >
              <p className="text-xs md:text-sm mb-1 md:mb-2 opacity-90 font-medium">
                Boxes Delivered
              </p>
              <p className="text-3xl md:text-5xl font-bold">{boxesDelivered}</p>
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 hover:shadow-md transition-shadow">
              <p className="font-bold text-gray-800 mb-4 text-sm">
                Shipment Accuracy Trend (Last 7 Days)
              </p>
              <ResponsiveContainer width="100%" height={250}>
                {dynamicLineData.length > 0 ? (
                  <LineChart data={dynamicLineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} domain={[0, 100]} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Accuracy %"
                      stroke="#1a3a7c"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#1a3a7c' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">No trend data available</div>
                )}
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 hover:shadow-md transition-shadow">
              <p className="font-bold text-gray-800 mb-4 text-sm">
                Top 5 Parts Activity
              </p>
              <ResponsiveContainer width="100%" height={250}>
                {dynamicBarData.length > 0 ? (
                  <BarChart data={dynamicBarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="delivered" name="Delivered" fill="#1a3a7c" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expected" name="Expected" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm">No part data available</div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-4 gap-4">
          <p className="font-bold text-gray-800 text-lg">
            Recent Shipment Exceptions
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* SEARCH */}
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 w-full sm:w-64 shadow-sm">
              <input
                type="text"
                placeholder="Cari No. Manifest atau Vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 outline-none text-sm text-gray-600 w-full bg-transparent"
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
            <div className="relative flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 hover:border-blue-400 whitespace-nowrap shadow-sm w-full sm:w-auto"
              >
                <span className="text-sm text-gray-600">
                  {formatDate(selectedDate)}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

            {/* STATUS FILTER */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg text-sm px-3 py-2 outline-none text-gray-700 bg-white focus:border-blue-500 transition-colors w-full sm:w-auto shadow-sm"
              >
                <option value="ALL">Filter by Status</option>
                <option value="DRAFT">DRAFT</option>
                <option value="LOCKED">LOCKED</option>
                <option value="CHECKING">CHECKING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DISCREPANCY">DISCREPANCY</option>
              </select>
            </div>

            {/* RESET FILTERS */}
            {(search || selectedDate || statusFilter !== "ALL") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedDate(null);
                  setStatusFilter("ALL");
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="text-gray-500 border-b-2 border-gray-100 bg-gray-50">
                <th className="text-left py-3 px-2 font-semibold rounded-tl-lg">Shipment ID</th>
                <th className="text-left py-3 px-2 font-semibold">Date</th>
                {user?.role?.toUpperCase() !== "VENDOR" && <th className="text-left py-3 px-2 font-semibold">Vendor</th>}
                <th className="text-left py-3 px-2 font-semibold">Items</th>
                <th className="text-left py-3 px-2 font-semibold">Status</th>
                <th className="text-left py-3 px-2 font-semibold rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {loadingManifests ? (
                <tr>
                  <td colSpan={user?.role?.toUpperCase() !== "VENDOR" ? 6 : 5} className="py-8 text-center text-gray-500 animate-pulse">
                    Loading recent shipments...
                  </td>
                </tr>
              ) : filteredManifests.length === 0 ? (
                <tr>
                  <td colSpan={user?.role?.toUpperCase() !== "VENDOR" ? 6 : 5} className="py-8 text-center text-gray-500">
                    No matching shipments found.
                  </td>
                </tr>
              ) : (
                currentManifests.map((manifest) => (
                  <tr key={manifest.id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-2 text-gray-800 font-bold">
                      {manifest.manifest_number}
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {new Date(manifest.created_at).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </td>
                    {user?.role?.toUpperCase() !== "VENDOR" && (
                      <td className="py-3 px-2 text-gray-600 font-medium">
                        {manifest.vendors?.name || manifest.vendor_id}
                      </td>
                    )}
                    <td className="py-3 px-2 text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-semibold">
                        {manifest.manifest_items?.length || 0}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`text-xs px-3 py-1 font-bold rounded-full ${
                          manifest.status === "DRAFT"
                            ? "bg-gray-100 text-gray-600"
                            : manifest.status === "LOCKED"
                              ? "bg-orange-100 text-orange-600"
                              : manifest.status === "CHECKING"
                                ? "bg-blue-100 text-blue-600"
                                : manifest.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600" // DISCREPANCY
                        }`}
                      >
                        {manifest.status}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {/* View Button */}
                        <button
                          title="View"
                          onClick={() => {
                            const currentRole = user?.role?.toUpperCase();
                            if (currentRole === "VENDOR") {
                              router.push(`/vendor/manifest/${manifest.id}`);
                            } else if (currentRole === "ADMIN" || currentRole === "MANAGER" || currentRole === "MANAJEMEN") {
                              setReviewManifestId(manifest.id);
                            } else {
                              toast.error("Role tidak dikenali: " + user?.role);
                            }
                          }}
                          className="w-8 h-8 border border-gray-200 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-500 hover:shadow-sm transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Edit Button (Only for VENDOR & DRAFT) */}
                        {manifest.status === "DRAFT" && user?.role?.toUpperCase() === "VENDOR" && (
                          <button
                            title="Edit"
                            onClick={() => router.push(`/vendor/edit-shipment/${manifest.id}`)}
                            className="w-8 h-8 border border-gray-200 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-500 hover:shadow-sm transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}

                        {/* Lock Button (Only for VENDOR & DRAFT) */}
                        {manifest.status === "DRAFT" && user?.role?.toUpperCase() === "VENDOR" && (
                          <button
                            title="Lock"
                            onClick={() => setConfirmLockId(manifest.id)}
                            className="w-8 h-8 border border-gray-200 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-orange-500 hover:border-orange-500 hover:shadow-sm transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredManifests.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {reviewManifestId && (
        <ManajemenReviewModal
          manifestId={reviewManifestId}
          onClose={() => {
            setReviewManifestId(null);
            // Optionally refresh the dashboard manifests to get new statuses
            const fetchRecentManifests = async () => {
              const token = localStorage.getItem("access_token");
              if (!token) return;
              let url = "/api/manifests";
              if (user?.role === "VENDOR" && user?.vendor_id) {
                url += `?vendor_id=${user.vendor_id}`;
              }
              const res = await fetch(url);
              if (res.ok) {
                setManifests(await res.json());
              }
            };
            fetchRecentManifests();
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmLockId}
        title="Kunci Manifest"
        message="Apakah anda yakin untuk mengunci manifest ini? Setelah dikunci, data tidak dapat diubah lagi."
        confirmText="Ya, Kunci Manifest"
        onConfirm={() => {
          if (confirmLockId) performLock(confirmLockId);
        }}
        onCancel={() => setConfirmLockId(null)}
      />

      <ConfirmModal
        isOpen={confirmResetOpen}
        title="Reset Semua Data"
        message="Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Reset"
        isDanger={true}
        onConfirm={handleResetDatabase}
        onCancel={() => setConfirmResetOpen(false)}
        isLoading={isResetting}
      />
    </div>
  );
}
