"use client";

import { useAuth } from "@/app/context/authContext";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const barData = [
  { vendor: "Vendor A", scanned: 100, expected: 100 },
  { vendor: "Vendor B", scanned: 15, expected: 25 },
  { vendor: "Vendor C", scanned: 10, expected: 10 },
];

const vendorRanking = [
  { name: "Vendor A (IEI Approved)", value: 99, color: "#22c55e", label: "IEI Green" },
  { name: "Vendor B (IEI Gold)", value: 98, color: "#22c55e", label: "IEI Green" },
  { name: "Vendor C", value: 91, color: "#eab308", label: "IEI Yellow" },
  { name: "Vendor D", value: 88, color: "#eab308", label: "IEI Yellow" },
  { name: "Vendor E", value: 86, color: "#eab308", label: "IEI Yellow" },
  { name: "Vendor F (IEI Priority)", value: 79, color: "#ef4444", label: "IEI Red" },
  { name: "Vendor G (IEI Alert)", value: 75, color: "#ef4444", label: "IEI Red Alert" },
];

const liveFeed = ["ID#1234 (Part A1, 10 units) Scanned from Vendor B", "ID#1234 (Part A1, 10 units) Scanned from Vendor B", "ID#1234 (Part A1, 10 units) Scanned from Vendor B"];

const teamActivity = [
  { name: "Andi", action: "Scanned 15 boxes", time: "10 mins ago" },
  { name: "Siti", action: "Scanned 10 boxes", time: "35 mins ago" },
  { name: "Budi", action: "Logged Discrepancy", time: "50 mins ago" },
  { name: "Andi", action: "Scanned 15 boxes", time: "10 mins ago" },
  { name: "Siti", action: "Scanned 10 boxes", time: "35 mins ago" },
];

const avatarColors = ["#60a5fa", "#f472b6", "#34d399", "#a78bfa", "#fb923c"];

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: avatarColors[index % avatarColors.length] }}>
      {name[0]}
    </div>
  );
}

export default function ManajemenDashboard() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { user, loading } = useAuth();

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };


  // NEW: State to hold fetched manifests
  const [manifests, setManifests] = useState<any[]>([]);
  const [isLoadingManifests, setIsLoadingManifests] = useState(true);

  // NEW: Helper to format date for the table (e.g. "Oct 26, 2026")
  const formatTableDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // NEW: Fetch manifests when component mounts
  useEffect(() => {
    const fetchManifests = async () => {
      try {
        const response = await fetch('/api/manifests');
        if (!response.ok) {
          throw new Error('Failed to fetch manifests');
        }
        const data = await response.json();
        setManifests(data);
      } catch (error) {
        console.error('Error fetching manifests:', error);
      } finally {
        setIsLoadingManifests(false);
      }
    };

    fetchManifests();
  }, []);

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

        {/* MAIN GRID - stat cards + charts + panel kanan */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* KIRI - stat cards + charts */}
          <div className="col-span-3 flex flex-col gap-4">
            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl p-5 text-white flex flex-col items-center justify-center text-center h-40" style={{ background: "linear-gradient(135deg, #1EC0CF, #B1E9EE)" }}>
                <p className="text-sm mb-2 opacity-90">Daily Receiving</p>
                <p className="text-5xl font-bold">125</p>
              </div>
              <div className="rounded-xl p-5 text-white flex flex-col items-center justify-center text-center h-40" style={{ background: "linear-gradient(135deg, #6366f1, #C6DCF7)" }}>
                <p className="text-sm mb-2 opacity-90">Accuracy Rate</p>
                <p className="text-5xl font-bold">98.5%</p>
              </div>
              <div className="rounded-xl p-5 flex flex-col items-center justify-center text-center h-40" style={{ background: "linear-gradient(135deg, #EE91B7, #F9D7E5)" }}>
                <p className="text-sm mb-2 text-white opacity-90">Open Discrepancies</p>
                <p className="text-5xl font-bold text-red-500">2</p>
              </div>
            </div>

            {/* 3 Charts */}
            <div className="grid grid-cols-3 gap-4">
              {/* Bar Chart */}
              <div className="bg-white rounded-xl p-5">
                <p className="font-semibold text-gray-800 mb-1 text-sm">Shipment Accuracy Trend</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="vendor" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <Tooltip />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="scanned" name="Scanned" fill="#1a3a7c" />
                    <Bar dataKey="expected" name="Expected" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Live Feed */}
              <div className="bg-white rounded-xl p-5">
                <p className="font-semibold text-gray-800 mb-3 text-sm">Live feed</p>
                <div className="flex flex-col gap-3">
                  {liveFeed.map((feed, i) => (
                    <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
                      <p className="text-xs text-gray-600">{feed}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendor Performance Ranking */}
              <div className="bg-white rounded-xl p-5">
                <p className="font-semibold text-gray-800 mb-1 text-sm">Vendor Performance Ranking</p>
                <p className="text-xs text-gray-400 mb-3">Ranking Vendors by Delivery Accuracy (100% Target)</p>
                <div className="flex flex-col gap-2">
                  {vendorRanking.map((v, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <p className="text-xs text-gray-600 w-36 truncate">{v.name}</p>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${v.value}%`, backgroundColor: v.color }} />
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full text-white flex-shrink-0" style={{ backgroundColor: v.color }}>
                        {v.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KANAN - Scanner Team Activity + KPI (tinggi penuh) */}
          <div className="col-span-1 flex flex-col gap-4">
            {/* Scanner Team Activity - flex-1 biar memanjang */}
            <div className="bg-white rounded-xl p-4 flex-1">
              <p className="font-semibold text-gray-800 text-sm mb-3">Scanner Team Activity</p>
              <div className="flex flex-col gap-3">
                {teamActivity.map((a, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Avatar name={a.name} index={i} />
                    <div>
                      <p className="text-xs font-medium text-gray-700">
                        {a.name}: {a.action}
                      </p>
                      <p className="text-xs text-gray-400">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KPI */}
            <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="font-semibold text-gray-800 text-sm">KPIs</span>
              </div>
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">2</span>
            </div>
          </div>
        </div>

        {/* PENDING DECISIONS TABLE */}
        <div className="bg-white rounded-xl p-6 mt-6">
          <p className="font-semibold text-gray-800 mb-4">Pending Decisions</p>

          {isLoadingManifests ? (
            <div className="text-center py-4 text-gray-500">Loading data...</div>
          ) : manifests.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No manifests found.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-normal text-gray-400">Shipment ID</th>
                  <th className="text-left py-2 font-normal text-gray-400">Date</th>
                  <th className="text-left py-2 font-normal text-gray-400">Vendor</th>
                  <th className="text-left py-2 font-normal text-gray-400">Items</th>
                  <th className="text-left py-2 font-normal text-gray-400">Status</th>
                  <th className="text-left py-2 font-normal text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {manifests.map((manifest) => (
                  <tr key={manifest.id} className="border-b border-gray-50">
                    {/* Maps to manifest_number */}
                    <td className="py-3 text-gray-800 font-medium">{manifest.manifest_number}</td>

                    {/* Maps to created_at */}
                    <td className="py-3 text-gray-500">{formatTableDate(manifest.created_at)}</td>

                    {/* Maps to the related vendor's name. Fallback to ID if name is unavailable */}
                    <td className="py-3 text-gray-500">{manifest.vendors?.name || manifest.vendor_id}</td>
                    <td className="py-3 text-gray-500">{manifest.manifest_items.length}</td>


                    {/* Render status */}
                    <td className="py-3">
                      <span className={`text-xs px-3 py-1 rounded-full text-white ${manifest.status === 'DRAFT' ? 'bg-gray-400' :
                        manifest.status === 'CHECKING' ? 'bg-blue-500' :
                          manifest.status === 'COMPLETED' ? 'bg-green-500' :
                            'bg-red-500' // e.g. for DISCREPANCY
                        }`}>
                        {manifest.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}