"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import Navbar from "@/components/Navbar";

const vendorMenu = [
  {
    label: "Dashboard",
    href: "/vendor/dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "New Shipment",
    href: "/vendor/new-shipment",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    label: "History",
    href: "/vendor/history",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

const lineData = [
  { day: "0 days", value: 6 },
  { day: "6 days", value: 15 },
  { day: "12 days", value: 22 },
  { day: "18 days", value: 28 },
  { day: "23 days", value: 35 },
  { day: "27 days", value: 40 },
  { day: "30 days", value: 46 },
];

const barData = [
  { name: "Epson Plant", delivered: 220, expected: 230 },
  { name: "Epson PM", delivered: 175, expected: 180 },
  { name: "Epson", delivered: 100, expected: 95 },
  { name: "Epson P2k", delivered: 160, expected: 175 },
  { name: "Epson D2", delivered: 110, expected: 80 },
  { name: "Epson D3", delivered: 155, expected: 125 },
];

const exceptions = [
  { id: "ID#1234", date: "Oct 26, 2026", items: "Part A1", status: "Review" },
  { id: "ID#1234", date: "Oct 26, 2026", items: "Part A1", status: "Review" },
  { id: "ID#1234", date: "Oct 26, 2026", items: "Part A1", status: "Review" },
];

export default function VendorDashboard() {
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
      <Navbar items={vendorMenu} />

      <div className="px-4 md:px-8 py-4 md:py-6">
        {/* Header + Search + Date */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 flex-1 sm:w-64 sm:flex-none">
              <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none text-sm text-gray-600 w-full" />
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="relative">
              <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 hover:border-blue-400 whitespace-nowrap">
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

        {/* STAT CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="rounded-xl p-4 md:p-5 text-white flex flex-col items-center justify-center text-center" style={{ background: "linear-gradient(135deg, #1EC0CF, #B1E9EE)" }}>
            <p className="text-xs md:text-sm mb-1 md:mb-2 opacity-90">Total Shipments</p>
            <p className="text-3xl md:text-5xl font-bold">45</p>
          </div>
          <div className="rounded-xl p-4 md:p-5 text-white flex flex-col items-center justify-center text-center" style={{ background: "linear-gradient(135deg, #6366f1, #C6DCF7)" }}>
            <p className="text-xs md:text-sm mb-1 md:mb-2 opacity-90">Accuracy Rate</p>
            <p className="text-3xl md:text-5xl font-bold">99.1%</p>
          </div>
          <div className="rounded-xl p-4 md:p-5 flex flex-col items-center justify-center text-center" style={{ background: "linear-gradient(135deg, #EE91B7, #F9D7E5)" }}>
            <p className="text-xs md:text-sm mb-1 md:mb-2 text-red-600">Open Discrepancies</p>
            <p className="text-3xl md:text-5xl font-bold text-red-500">2</p>
          </div>
          <div className="rounded-xl p-4 md:p-5 text-white flex flex-col items-center justify-center text-center" style={{ background: "linear-gradient(135deg, #a78bfa, #F1EDFB)" }}>
            <p className="text-xs md:text-sm mb-1 md:mb-2 opacity-90">Boxes Delivered</p>
            <p className="text-3xl md:text-5xl font-bold">1.250</p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 md:p-5">
            <p className="font-semibold text-gray-800 mb-4 text-sm">Shipment Accuracy Trend</p>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1a3a7c" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl p-4 md:p-5">
            <p className="font-semibold text-gray-800 mb-4 text-sm">Receiving Status by Major Customer (Epson Plant)</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="delivered" name="Delivered" fill="#1a3a7c" />
                <Bar dataKey="expected" name="Expected" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-xl p-4 md:p-5">
          <p className="font-semibold text-gray-800 mb-4">Recent Shipment Exceptions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="text-left py-2 font-normal">Shipment ID</th>
                  <th className="text-left py-2 font-normal">Date</th>
                  <th className="text-left py-2 font-normal">Items</th>
                  <th className="text-left py-2 font-normal">Status</th>
                  <th className="text-left py-2 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map((item, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 text-gray-600">{item.id}</td>
                    <td className="py-3 text-gray-600">{item.date}</td>
                    <td className="py-3 text-gray-600">{item.items}</td>
                    <td className="py-3">
                      <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full">{item.status}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                        <button className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
