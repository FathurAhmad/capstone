"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const orders = [
  { id: "ID#1234", date: "Oct 26, 2026", vendor: "Vendor A", status: "Reviewed", finalStatus: "Returned" },
  { id: "ID#1235", date: "Oct 26, 2026", vendor: "Vendor A", status: "Reviewed", finalStatus: "Returned" },
  { id: "ID#1236", date: "Oct 26, 2026", vendor: "Vendor A", status: "Reviewed", finalStatus: "Returned" },
  { id: "ID#1237", date: "Oct 26, 2026", vendor: "Vendor A", status: "Reviewed", finalStatus: "Returned" },
  { id: "ID#1238", date: "Oct 26, 2026", vendor: "Vendor A", status: "Unreviewed", finalStatus: "Unknown" },
];

export default function PetugasReview() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Review</h1>
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

        <div className="bg-white rounded-xl p-6">
          <p className="font-semibold text-gray-800 mb-4">Review Recent Order</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-center py-3 font-semibold text-gray-700 px-4">Shipment ID</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-4">Date</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-4">Vendor</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-4">Status</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-4">Action</th>
                <th className="text-center py-3 font-semibold text-gray-700 px-4">Final Order Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="text-center py-4 text-gray-600 px-4">{item.id}</td>
                  <td className="text-center py-4 text-gray-600 px-4">{item.date}</td>
                  <td className="text-center py-4 text-gray-600 px-4">{item.vendor}</td>
                  <td className="text-center py-4 px-4">
                    <span className={`text-white text-xs px-5 py-2 rounded-full ${item.status === "Reviewed" ? "bg-green-500" : "bg-gray-400"}`}>{item.status}</span>
                  </td>
                  <td className="text-center py-4 px-4">
                    <button className={`text-white text-xs px-5 py-2 rounded-full ${item.status === "Unreviewed" ? "bg-[#1a3a7c] hover:bg-[#152f66]" : "bg-gray-400 cursor-default"}`}>Review</button>
                  </td>
                  <td className="text-center py-4 px-4">
                    <span className={`text-white text-xs px-5 py-2 rounded-full ${item.finalStatus === "Returned" ? "bg-red-500" : item.finalStatus === "Approved" ? "bg-green-500" : "bg-gray-400"}`}>{item.finalStatus}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
