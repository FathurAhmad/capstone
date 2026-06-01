"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/app/context/authContext";
import ManajemenReviewModal from "@/components/ManajemenReviewModal";

type Shipment = {
  id: string;
  manifestId: string;
  date: string;
  item: string;
  status: string;
  totalItems: number;
  totalExceptions: number;
};

export default function VendorHistory() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [reviewManifestId, setReviewManifestId] = useState<string | null>(null);

  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.vendor_id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/manifests?vendor_id=${user.vendor_id}`);
        if (res.ok) {
          const manifestsData = await res.json();
          const flattenedShipments: Shipment[] = [];

          manifestsData.forEach((m: any) => {
            const totalItems = m.manifest_items?.reduce((sum: number, item: any) => sum + item.expected_qty, 0) || 0;
            const totalExceptions = m.discrepancies?.length || 0;

            flattenedShipments.push({
              id: m.manifest_number,
              manifestId: m.id,
              date: new Date(m.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }),
              item: m.vendors?.name || m.vendor_id || "Vendor", // Re-purposing 'item' col to show Vendor for now, or just 'Manifest'
              status: m.status,
              totalItems,
              totalExceptions,
            });
          });

          setShipments(flattenedShipments);
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="px-4 md:px-8 py-4 md:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shipment History</h1>
          <div className="relative">
            <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center bg-white border border-gray-200 rounded-lg px-4 py-2 gap-2 hover:border-blue-400">
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

        <div className="bg-white rounded-xl p-4 md:p-6">
          <p className="font-semibold text-gray-800 mb-4">Recent Shipment Exceptions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Shipment ID</th>
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Date</th>
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Total Items</th>
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Exceptions</th>
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Status</th>
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">Loading history...</td>
                  </tr>
                ) : shipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">No shipment history found.</td>
                  </tr>
                ) : (
                  shipments.map((s, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="text-center py-3 text-gray-600 px-2">{s.id}</td>
                      <td className="text-center py-3 text-gray-600 px-2">{s.date}</td>
                      <td className="text-center py-3 text-gray-600 px-2">{s.totalItems} pcs</td>
                      <td className="text-center py-3 px-2">
                        <span className={`text-xs px-3 py-1 font-bold rounded-full border ${s.totalExceptions > 0 ? "border-red-500 text-red-500 bg-red-50" : "border-green-500 text-green-500 bg-green-50"}`}>
                          {s.totalExceptions} Found
                        </span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={`text-white text-xs px-3 py-1 font-bold rounded-full ${s.status === 'DRAFT' ? 'bg-gray-400' :
                          s.status === 'LOCKED' ? 'bg-orange-500' :
                            s.status === 'CHECKING' ? 'bg-blue-500' :
                              s.status === 'COMPLETED' ? 'bg-green-500' :
                                s.status === 'DISCREPANCY' ? 'bg-red-500' :
                                  'bg-red-500'}`}>{s.status}</span>
                      </td>
                      <td className="text-center py-3 px-2">
                        <button onClick={() => setReviewManifestId(s.manifestId)} className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs px-4 py-2 font-bold rounded-lg transition-colors border border-blue-200 shadow-sm flex items-center justify-center gap-1.5 mx-auto">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {reviewManifestId && (
        <ManajemenReviewModal
          manifestId={reviewManifestId}
          onClose={() => setReviewManifestId(null)}
        />
      )}
    </div>
  );
}
