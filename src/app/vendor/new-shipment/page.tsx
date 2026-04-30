"use client";

import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ManifestRow = {
  id: number;
  partNumber: string;
  partName: string;
  qty: string;
  totalPackages: string;
  weight: string;
};

export default function NewShipment() {
  const [shipmentId, setShipmentId] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [rows, setRows] = useState<ManifestRow[]>([{ id: 1, partNumber: "", partName: "", qty: "", totalPackages: "", weight: "" }]);

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        id: rows.length + 1,
        partNumber: "",
        partName: "",
        qty: "",
        totalPackages: "",
        weight: "",
      },
    ]);
  };

  const deleteRow = (id: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((r) => r.id !== id));
  };

  const updateRow = (id: number, field: keyof ManifestRow, value: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleSubmit = () => {
    // TODO: connect to API later
    console.log({ shipmentId, driverName, vehiclePlate, selectedDate, rows });
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
          <a href="/vendor/new-shipment" className="flex flex-col items-center gap-1 text-xs text-[#1a3a7c] font-semibold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            New Shipment
          </a>
          <a href="/vendor/history" className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-[#1a3a7c]">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">New Shipment</h1>

        <div className="bg-white rounded-xl p-6">
          {/* TOP FIELDS */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Shipment ID</label>
              <input
                type="text"
                placeholder="Shipment ID"
                value={shipmentId}
                onChange={(e) => setShipmentId(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Driver Name</label>
              <input
                type="text"
                placeholder="Driver Name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle plate Number</label>
              <input
                type="text"
                placeholder="Vehicle plate Number"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
              <div className="relative">
                <button onClick={() => setShowCalendar(!showCalendar)} className="w-full flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 bg-white hover:border-blue-400">
                  <span>{formatDate(selectedDate)}</span>
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

          {/* MANIFEST TABLE */}
          <p className="font-semibold text-gray-800 mb-3">Manifest Input</p>
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 w-12">No</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Part Number</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Part Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Qty per pkg</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Total Packages</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Weight (gr)</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-500">{String(index + 1).padStart(2, "0")}.</td>
                    <td className="px-2 py-3">
                      <input
                        type="text"
                        placeholder="Part Number"
                        value={row.partNumber}
                        onChange={(e) => updateRow(row.id, "partNumber", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        type="text"
                        placeholder="Part Name"
                        value={row.partName}
                        onChange={(e) => updateRow(row.id, "partName", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        type="text"
                        placeholder="Qty"
                        value={row.qty}
                        onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        type="text"
                        placeholder="Total"
                        value={row.totalPackages}
                        onChange={(e) => updateRow(row.id, "totalPackages", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <input
                        type="text"
                        placeholder="Weight"
                        value={row.weight}
                        onChange={(e) => updateRow(row.id, "weight", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => deleteRow(row.id)} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* BOTTOM BUTTONS */}
          <div className="flex items-center justify-between">
            <button onClick={addRow} className="border-2 border-[#1a3a7c] text-[#1a3a7c] font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 text-sm">
              + Add Column
            </button>
            <button onClick={handleSubmit} className="bg-[#1a3a7c] text-white font-semibold px-8 py-2.5 rounded-lg hover:bg-[#152f66] text-sm">
              Submit & Generate QR Labels
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
