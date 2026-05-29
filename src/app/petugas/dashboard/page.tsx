"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const pendingDecisions = [
  { id: "Shipment ID", date: "Oct 26, 2026", vendor: "Vendor A", items: "Part A1", status: "Mismatch" },
  { id: "Shipment ID", date: "Oct 26, 2026", vendor: "Vendor A", items: "Part A1", status: "Mismatch" },
  { id: "Shipment ID", date: "Oct 26, 2026", vendor: "Vendor A", items: "Part A1", status: "Mismatch" },
];

const avatarColors = ["#60a5fa", "#f472b6", "#34d399", "#a78bfa", "#fb923c"];

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: avatarColors[index % avatarColors.length] }}>
      {name[0]}
    </div>
  );
}

export default function PetugasDashboard() {
  const [search, setSearch] = useState("");
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
        <div className="bg-white rounded-xl p-6">
          <p className="font-semibold text-gray-800 mb-4">Pending Decisions</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 font-normal text-gray-400">Shipment ID</th>
                <th className="text-left py-2 font-normal text-gray-400">Date</th>
                <th className="text-left py-2 font-normal text-gray-400">Vendor</th>
                <th className="text-left py-2 font-normal text-gray-400">Items</th>
                <th className="text-left py-2 font-normal text-gray-400">Status</th>
                <th className="text-left py-2 font-normal text-gray-400">Action Buttons</th>
              </tr>
            </thead>
            <tbody>
              {pendingDecisions.map((item, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 text-gray-600">{item.id}</td>
                  <td className="py-3 text-gray-600">{item.date}</td>
                  <td className="py-3 text-gray-600">{item.vendor}</td>
                  <td className="py-3 text-gray-600">{item.items}</td>
                  <td className="py-3">
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">{item.status}</span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-1.5 rounded-lg font-medium">Approve</button>
                      <a href="/petugas/review" className="border border-gray-300 text-gray-600 text-xs px-4 py-1.5 rounded-lg hover:bg-gray-50 font-medium">
                        Review
                      </a>{" "}
                    </div>
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
