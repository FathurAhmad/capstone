"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Shipment = {
  id: string;
  date: string;
  item: string;
  tipe: string;
  status: string;
  partNumber: string;
  partName: string;
  totalItem: string;
  totalBox: string;
  totalWeight: string;
};

const shipments: Shipment[] = [
  { id: "ID#1234", date: "Oct 26, 2026", item: "Part A1", tipe: "Mismatch", status: "Returned", partNumber: "A1", partName: "Screw", totalItem: "200 pcs", totalBox: "10 box", totalWeight: "200 gr" },
  { id: "ID#1234", date: "Oct 26, 2026", item: "Part A2", tipe: "Mismatch", status: "Returned", partNumber: "A2", partName: "Bolt", totalItem: "150 pcs", totalBox: "8 box", totalWeight: "180 gr" },
  { id: "ID#1234", date: "Oct 26, 2026", item: "Part A3", tipe: "Mismatch", status: "Returned", partNumber: "A3", partName: "Nut", totalItem: "300 pcs", totalBox: "12 box", totalWeight: "250 gr" },
  { id: "ID#1234", date: "Oct 26, 2026", item: "Part A4", tipe: "Match", status: "Approved", partNumber: "A4", partName: "Spring", totalItem: "100 pcs", totalBox: "5 box", totalWeight: "100 gr" },
];

export default function ShipmentHistory() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [detailItem, setDetailItem] = useState<Shipment | null>(null);
  const [photoItem, setPhotoItem] = useState<Shipment | null>(null);

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* NAVBAR */}
      <nav className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-200">
        <img src="/login/logo.png" alt="Match-Up Logo" className="h-12" />
        <div className="flex items-center gap-6">
          <a href="/vendor/dashboard" className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-[#1a3a7c]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>
          <a href="/vendor/new-shipment" className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-[#1a3a7c]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            New Shipment
          </a>
          <a href="/vendor/history" className="flex flex-col items-center gap-1 text-xs text-[#1a3a7c] font-semibold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            History
          </a>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Ailsa Zahra</span>
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
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
      </nav>

      {/* CONTENT */}
      <div className="px-8 py-6">
        {/* Header + Date */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Shipment History</h1>
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

        {/* TABLE */}
        <div className="bg-white rounded-xl p-6">
          <p className="font-semibold text-gray-800 mb-4">Recent Shipment Exceptions</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center py-3 font-semibold text-gray-700 px-3">Shipment ID</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-3">Date</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-3">Item</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-3">Tipe</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-3">Status</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-3">Proof of Delivery</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="text-center py-4 text-gray-600 px-3">{s.id}</td>
                  <td className="text-center py-4 text-gray-600 px-3">{s.date}</td>
                  <td className="text-center py-4 text-gray-600 px-3">{s.item}</td>
                  <td className="text-center py-4 px-3">
                    <span className="border border-gray-300 text-gray-600 text-xs px-4 py-1.5 rounded-full">{s.tipe}</span>
                  </td>
                  <td className="text-center py-4 px-3">
                    <span className={`text-white text-xs px-4 py-1.5 rounded-full ${s.status === "Approved" ? "bg-green-500" : "bg-red-500"}`}>{s.status}</span>
                  </td>
                  <td className="text-center py-4 px-3">
                    <button onClick={() => setPhotoItem(s)} className="bg-blue-400 hover:bg-blue-500 text-white text-xs px-5 py-1.5 rounded-full">
                      Photo
                    </button>
                  </td>
                  <td className="text-center py-4 px-3">
                    <button onClick={() => setDetailItem(s)} className="bg-pink-300 hover:bg-pink-400 text-white text-xs px-4 py-1.5 rounded-full">
                      Check Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL - Detail Part */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[480px] p-6 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-800">Details {detailItem.id}</p>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2 mb-5">
              <span className="bg-red-500 text-white text-xs px-4 py-1.5 rounded-full">{detailItem.status}</span>
              <span className="border border-gray-300 text-gray-600 text-xs px-4 py-1.5 rounded-full">{detailItem.tipe}</span>
            </div>

            {/* Detail Info */}
            <div className="flex flex-col gap-2 text-sm text-gray-700">
              <p>
                Part Number: <span className="font-medium">{detailItem.partNumber}</span>
              </p>
              <p>
                Part Name: <span className="font-medium">{detailItem.partName}</span>
              </p>
              <p>
                Total Item: <span className="font-medium">{detailItem.totalItem}</span>
              </p>
              <p>
                Total Box: <span className="font-medium">{detailItem.totalBox}</span>
              </p>
              <p>
                Total Weight: <span className="font-medium">{detailItem.totalWeight}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL - Photo */}
      {photoItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[500px] p-4 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-800">Photo {photoItem.id}</p>
              <div className="flex items-center gap-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                <button onClick={() => setPhotoItem(null)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Photo Area */}
            <div className="bg-black rounded-lg flex items-center justify-center h-64">
              <svg className="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
