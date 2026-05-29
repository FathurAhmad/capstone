"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";

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

export default function VendorDashboard() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // State for dynamic manifests
  const [manifests, setManifests] = useState<any[]>([]);
  const [loadingManifests, setLoadingManifests] = useState(true);

  // Fetch manifests
  const fetchManifests = async () => {
    if (!user?.vendor_id) return;
    try {
      setLoadingManifests(true);
      const res = await fetch(`/api/manifests?vendor_id=${user.vendor_id}`);
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

  // Fetch on mount or when user changes
  useEffect(() => {
    fetchManifests();
  }, [user]);

  const handleLock = async (id: string) => {
    if (!confirm("Are you sure you want to lock this manifest? Once locked, you cannot edit it.")) return;
    try {
      const res = await fetch(`/api/manifests/${id}/lock`, { method: 'PATCH' });
      if (res.ok) {
        alert("Manifest locked successfully.");
        fetchManifests();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to lock manifest");
      }
    } catch (error) {
      alert("Server error occurred.");
    }
  };

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
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
                {loadingManifests ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">Loading manifests...</td>
                  </tr>
                ) : manifests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-gray-500">No manifests found.</td>
                  </tr>
                ) : (
                  manifests.map((manifest) => (
                    <tr key={manifest.id} className="border-b border-gray-50">
                      <td className="py-3 text-gray-600 font-medium">{manifest.manifest_number}</td>
                      <td className="py-3 text-gray-600">
                        {new Date(manifest.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 text-gray-600">{manifest.manifest_items?.length || 0} items</td>
                      <td className="py-3">
                        <span className={`text-xs px-3 py-1 rounded-full text-white ${manifest.status === 'DRAFT' ? 'bg-gray-400' :
                          manifest.status === 'LOCKED' ? 'bg-orange-500' :
                            manifest.status === 'CHECKING' ? 'bg-blue-500' :
                              manifest.status === 'COMPLETED' ? 'bg-green-500' :
                                manifest.status === 'DISCREPANCY' ? 'bg-red-500' :
                                  'bg-red-500'
                          }`}>
                          {manifest.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {/* View Button (Always visible) */}
                          <button title="View" onClick={() => router.push(`/vendor/manifest/${manifest.id}`)} className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Edit Button (Only for DRAFT) */}
                          {manifest.status === "DRAFT" && (
                            <button
                              title="Edit"
                              onClick={() => router.push(`/vendor/edit-shipment/${manifest.id}`)}
                              className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {/* Lock Button (Only for DRAFT) */}
                          {manifest.status === "DRAFT" && (
                            <button
                              title="Lock"
                              onClick={() => handleLock(manifest.id)}
                              className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-colors"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </button>
                          )}

                          {/* Delete Button (Optional, can keep for DRAFT) */}
                          {manifest.status === "DRAFT" && (
                            <button title="Delete" className="w-7 h-7 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        </div>
      </div>
    </div>
  );
}

// // ============================================================================
// // UPDATED VERSION WITH SIMPLE TEXT BUTTONS (Added at the bottom as requested)
// // ============================================================================
// /*
// export function VendorDashboardUpdated() {
//   const [search, setSearch] = useState("");
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [showCalendar, setShowCalendar] = useState(false);
//   const { user } = useAuth();
//   const router = useRouter();

//   // State for dynamic manifests
//   const [manifests, setManifests] = useState<any[]>([]);
//   const [loadingManifests, setLoadingManifests] = useState(true);

//   // Fetch manifests
//   const fetchManifests = async () => {
//     if (!user?.vendor_id) return;
//     try {
//       setLoadingManifests(true);
//       const res = await fetch(`/api/manifests?vendor_id=${user.vendor_id}`);
//       if (res.ok) {
//         const data = await res.json();
//         setManifests(data);
//       }
//     } catch (error) {
//       console.error("Failed to fetch manifests", error);
//     } finally {
//       setLoadingManifests(false);
//     }
//   };

//   // Fetch on mount or when user changes
//   useEffect(() => {
//     fetchManifests();
//   }, [user]);

//   const handleLock = async (id: string) => {
//     if (!confirm("Are you sure you want to lock this manifest? Once locked, you cannot edit it.")) return;
//     try {
//       const res = await fetch(`/api/manifests/${id}/lock`, { method: 'PATCH' });
//       if (res.ok) {
//         alert("Manifest locked successfully.");
//         fetchManifests();
//       } else {
//         const data = await res.json();
//         alert(data.error || "Failed to lock manifest");
//       }
//     } catch (error) {
//       alert("Server error occurred.");
//     }
//   };

//   const formatDate = (date: Date) => {
//     const d = date.getDate().toString().padStart(2, "0");
//     const m = (date.getMonth() + 1).toString().padStart(2, "0");
//     const y = date.getFullYear().toString().slice(-2);
//     return `${d}/${m}/${y}`;
//   };

//   return (
//     <div className="min-h-screen bg-[#f0f4f8]">
//       <div className="px-4 md:px-8 py-4 md:py-6">
//         {/* Header + Search + Date */}
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
//           <div className="flex items-center gap-2 md:gap-3">
//             <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 flex-1 sm:w-64 sm:flex-none">
//               <input type="text" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none text-sm text-gray-600 w-full" />
//               <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//             <div className="relative">
//               <button onClick={() => setShowCalendar(!showCalendar)} className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-2 hover:border-blue-400 whitespace-nowrap">
//                 <span className="text-sm text-gray-600">{formatDate(selectedDate)}</span>
//                 <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </button>
//               {showCalendar && (
//                 <div className="absolute right-0 top-10 z-50 shadow-lg rounded-xl overflow-hidden">
//                   <Calendar
//                     onChange={(val) => {
//                       setSelectedDate(val as Date);
//                       setShowCalendar(false);
//                     }}
//                     value={selectedDate}
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* STAT CARDS */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
//           <div className="rounded-xl p-4 md:p-5 text-white flex flex-col items-center justify-center text-center" style={{ background: "linear-gradient(135deg, #1EC0CF, #B1E9EE)" }}>
//             <p className="text-xs md:text-sm mb-1 md:mb-2 opacity-90">Total Shipments</p>
//             <p className="text-3xl md:text-5xl font-bold">45</p>
//           </div>
//           <div className="rounded-xl p-4 md:p-5 text-white flex flex-col items-center justify-center text-center" style={{ background: "linear-gradient(135deg, #6366f1, #C6DCF7)" }}>
//             <p className="text-xs md:text-sm mb-1 md:mb-2 opacity-90">Accuracy Rate</p>
//             <p className="text-3xl md:text-5xl font-bold">99.1%</p>
//           </div>
//           <div className="rounded-xl p-4 md:p-5 flex flex-col items-center justify-center text-center" style={{ background: "linear-gradient(135deg, #EE91B7, #F9D7E5)" }}>
//             <p className="text-xs md:text-sm mb-1 md:mb-2 text-red-600">Open Discrepancies</p>
//             <p className="text-3xl md:text-5xl font-bold text-red-500">2</p>
//           </div>
//           <div className="rounded-xl p-4 md:p-5 text-white flex flex-col items-center justify-center text-center" style={{ background: "linear-gradient(135deg, #a78bfa, #F1EDFB)" }}>
//             <p className="text-xs md:text-sm mb-1 md:mb-2 opacity-90">Boxes Delivered</p>
//             <p className="text-3xl md:text-5xl font-bold">1.250</p>
//           </div>
//         </div>

//         {/* CHARTS */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
//           <div className="bg-white rounded-xl p-4 md:p-5">
//             <p className="font-semibold text-gray-800 mb-4 text-sm">Shipment Accuracy Trend</p>
//             <ResponsiveContainer width="100%" height={200}>
//               <LineChart data={lineData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis dataKey="day" tick={{ fontSize: 10 }} />
//                 <YAxis tick={{ fontSize: 11 }} />
//                 <Tooltip />
//                 <Line type="monotone" dataKey="value" stroke="#1a3a7c" strokeWidth={2} dot={{ r: 4 }} />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//           <div className="bg-white rounded-xl p-4 md:p-5">
//             <p className="font-semibold text-gray-800 mb-4 text-sm">Receiving Status by Major Customer (Epson Plant)</p>
//             <ResponsiveContainer width="100%" height={200}>
//               <BarChart data={barData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis dataKey="name" tick={{ fontSize: 9 }} />
//                 <YAxis tick={{ fontSize: 11 }} />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="delivered" name="Delivered" fill="#1a3a7c" />
//                 <Bar dataKey="expected" name="Expected" fill="#22c55e" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="bg-white rounded-xl p-4 md:p-5">
//           <p className="font-semibold text-gray-800 mb-4">Recent Shipment Exceptions</p>
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm min-w-[500px]">
//               <thead>
//                 <tr className="text-gray-400 border-b border-gray-100">
//                   <th className="text-left py-2 font-normal">Shipment ID</th>
//                   <th className="text-left py-2 font-normal">Date</th>
//                   <th className="text-left py-2 font-normal">Items</th>
//                   <th className="text-left py-2 font-normal">Status</th>
//                   <th className="text-left py-2 font-normal">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loadingManifests ? (
//                   <tr>
//                     <td colSpan={5} className="py-4 text-center text-gray-500">Loading manifests...</td>
//                   </tr>
//                 ) : manifests.length === 0 ? (
//                   <tr>
//                     <td colSpan={5} className="py-4 text-center text-gray-500">No manifests found.</td>
//                   </tr>
//                 ) : (
//                   manifests.map((manifest) => (
//                     <tr key={manifest.id} className="border-b border-gray-50">
//                       <td className="py-3 text-gray-600 font-medium">{manifest.manifest_number}</td>
//                       <td className="py-3 text-gray-600">
//                         {new Date(manifest.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
//                       </td>
//                       <td className="py-3 text-gray-600">{manifest.manifest_items?.length || 0} items</td>
//                       <td className="py-3">
//                         <span className={`text-xs px-3 py-1 rounded-full text-white ${manifest.status === 'DRAFT' ? 'bg-gray-400' :
//                             manifest.status === 'LOCKED' ? 'bg-orange-500' :
//                               manifest.status === 'CHECKING' ? 'bg-blue-500' :
//                                 manifest.status === 'COMPLETED' ? 'bg-green-500' :
//                                   'bg-red-500'
//                           }`}>
//                           {manifest.status}
//                         </span>
//                       </td>
//                       <td className="py-3">
//                         <div className="flex items-center gap-4">
//                           {/* View Button */}
//                           <button
//                             title="View"
//                             className="text-sm font-semibold text-gray-500 hover:text-blue-600 hover:underline transition-colors"
//                           >
//                             View
//                           </button>

//                           {/* Edit Button (Only for DRAFT) */}
//                           {manifest.status === "DRAFT" && (
//                             <button
//                               title="Edit"
//                               onClick={() => router.push(`/vendor/edit-shipment/${manifest.id}`)}
//                               className="text-sm font-semibold text-gray-500 hover:text-blue-600 hover:underline transition-colors"
//                             >
//                               Edit
//                             </button>
//                           )}

//                           {/* Lock Button (Only for DRAFT) */}
//                           {manifest.status === "DRAFT" && (
//                             <button
//                               title="Lock"
//                               onClick={() => handleLock(manifest.id)}
//                               className="text-sm font-semibold text-gray-500 hover:text-orange-500 hover:underline transition-colors"
//                             >
//                               Lock
//                             </button>
//                           )}

//                           {/* Delete Button */}
//                           {manifest.status === "DRAFT" && (
//                             <button
//                               title="Delete"
//                               className="text-sm font-semibold text-gray-500 hover:text-red-500 hover:underline transition-colors"
//                             >
//                               Delete
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// */
