"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Navbar from "@/components/Navbar";

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

export default function VendorHistory() {
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
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Item</th>
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Tipe</th>
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Status</th>
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Proof</th>
                  <th className="text-center py-3 font-semibold text-gray-700 px-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="text-center py-3 text-gray-600 px-2">{s.id}</td>
                    <td className="text-center py-3 text-gray-600 px-2">{s.date}</td>
                    <td className="text-center py-3 text-gray-600 px-2">{s.item}</td>
                    <td className="text-center py-3 px-2">
                      <span className="border border-gray-300 text-gray-600 text-xs px-3 py-1 rounded-full">{s.tipe}</span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <span className={`text-white text-xs px-3 py-1 rounded-full ${s.status === "Approved" ? "bg-green-500" : "bg-red-500"}`}>{s.status}</span>
                    </td>
                    <td className="text-center py-3 px-2">
                      <button onClick={() => setPhotoItem(s)} className="bg-blue-400 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                        Photo
                      </button>
                    </td>
                    <td className="text-center py-3 px-2">
                      <button onClick={() => setDetailItem(s)} className="bg-pink-300 hover:bg-pink-400 text-white text-xs px-3 py-1 rounded-full">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL - Detail */}
      {detailItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-800">Details {detailItem.id}</p>
              <button onClick={() => setDetailItem(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2 mb-5">
              <span className={`text-white text-xs px-4 py-1.5 rounded-full ${detailItem.status === "Approved" ? "bg-green-500" : "bg-red-500"}`}>{detailItem.status}</span>
              <span className="border border-gray-300 text-gray-600 text-xs px-4 py-1.5 rounded-full">{detailItem.tipe}</span>
            </div>
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
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-800">Photo {photoItem.id}</p>
              <button onClick={() => setPhotoItem(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-black rounded-lg flex items-center justify-center h-48 md:h-64">
              <svg className="w-16 h-16 md:w-20 md:h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
