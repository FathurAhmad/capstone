"use client";

import { useState } from "react";

const parts = [
  { partNumber: "Part A1", status: "Match" },
  { partNumber: "Part A1", status: "Match" },
  { partNumber: "Part A1", status: "Match" },
];

export default function LogisticTracking() {
  const [step, setStep] = useState(1);
  const [namaS, setNamaS] = useState("");
  const [namaP, setNamaP] = useState("");

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* NAVBAR */}
      <nav className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-200">
        <img src="/login/logo.png" alt="Match-Up Logo" className="h-12" />
        <div className="flex items-center gap-6">
          <a href="/petugas/dashboard" className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-[#1a3a7c]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>
          <a href="/petugas/logistic-tracking" className="flex flex-col items-center gap-1 text-xs text-[#1a3a7c] font-semibold">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Logistic Tracking
          </a>
          <a href="/petugas/history" className="flex flex-col items-center gap-1 text-xs text-gray-600 hover:text-[#1a3a7c]">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Logistic Tracking</h1>

        {/* STEPPER */}
        <div className="grid grid-cols-3 gap-4 mb-2">
          {[
            { num: 1, label: "Scan & Verification" },
            { num: 2, label: "Shipment Validation" },
            { num: 3, label: "Digital Sign-off" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2">
              <p className={`text-sm font-medium ${step === s.num ? "text-gray-900" : "text-gray-400"}`}>
                {s.num}. {s.label}
              </p>
              <div className={`w-full h-1.5 rounded-full ${step >= s.num ? "bg-green-500" : "bg-gray-200"}`} />
            </div>
          ))}
        </div>

        {/* 3 PANELS */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {/* PANEL 1 - Scan & Verification */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="bg-[#1a3a7c] text-white text-center py-3 font-semibold text-sm">Scan Verification (inbound)</div>
            <div className="p-5 flex flex-col items-center">
              {/* QR Scanner illustration */}
              <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gray-700 rounded-tl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gray-700 rounded-tr" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gray-700 rounded-bl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gray-700 rounded-br" />
                {/* Box illustration */}
                <div className="relative">
                  <div className="w-28 h-28 bg-amber-200 rounded flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded flex items-center justify-center">
                      {/* QR code pattern */}
                      <svg viewBox="0 0 40 40" className="w-14 h-14">
                        <rect x="2" y="2" width="16" height="16" fill="none" stroke="#000" strokeWidth="2" />
                        <rect x="5" y="5" width="10" height="10" fill="#000" />
                        <rect x="22" y="2" width="16" height="16" fill="none" stroke="#000" strokeWidth="2" />
                        <rect x="25" y="5" width="10" height="10" fill="#000" />
                        <rect x="2" y="22" width="16" height="16" fill="none" stroke="#000" strokeWidth="2" />
                        <rect x="5" y="25" width="10" height="10" fill="#000" />
                        <rect x="22" y="22" width="4" height="4" fill="#000" />
                        <rect x="28" y="22" width="4" height="4" fill="#000" />
                        <rect x="34" y="22" width="4" height="4" fill="#000" />
                        <rect x="22" y="28" width="4" height="4" fill="#000" />
                        <rect x="28" y="34" width="4" height="4" fill="#000" />
                      </svg>
                    </div>
                  </div>
                  {/* Red scan line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 opacity-80" />
                </div>
              </div>

              {/* Match result */}
              <div className="w-full bg-green-500 text-white text-center py-2 rounded-lg mb-3">
                <p className="font-bold text-sm">MATCH FOUND!</p>
              </div>
              <div className="w-full bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-600">Item: Epson Part</p>
                <p className="text-xs text-gray-600">A1-23/ Box 5/10</p>
              </div>
              <p className="text-xs text-gray-500 mb-4">Proceed to next box</p>
              <button onClick={() => setStep(2)} className="w-full bg-blue-400 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium">
                End Scan & Validate
              </button>
            </div>
          </div>

          {/* PANEL 2 - Shipment Validation */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="bg-[#1a3a7c] text-white text-center py-3 font-semibold text-sm">Validate Shipment</div>
            <div className="p-5">
              {/* Vendor info */}
              <div className="bg-blue-100 rounded-lg p-3 text-center mb-4">
                <p className="text-sm font-semibold text-gray-700">Vendor: ABC Corp</p>
                <p className="text-sm font-semibold text-gray-700">Shipment ID: 9876</p>
              </div>

              {/* Parts table */}
              <table className="w-full text-xs mb-4">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-semibold text-gray-600">Part Number</th>
                    <th className="text-center py-2 font-semibold text-gray-600">Status</th>
                    <th className="text-right py-2 font-semibold text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((p, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 text-gray-500">{p.partNumber}</td>
                      <td className="py-2 text-center">
                        <span className="bg-green-500 text-white text-xs px-3 py-0.5 rounded-full">{p.status}</span>
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <button className="text-blue-500 hover:underline text-xs">Take</button>
                          <button className="text-blue-500 hover:underline text-xs">Photo Recount</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Damaged Item */}
              <p className="text-sm font-semibold text-gray-700 mb-2">Damaged Item</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button className="border border-gray-200 rounded-lg p-4 flex flex-col items-center gap-1 hover:bg-gray-50">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-gray-500">Capture Proof Photo</span>
                </button>
                <div className="border border-gray-200 rounded-lg p-2 flex items-center justify-center bg-amber-50">
                  <svg className="w-16 h-16 text-amber-400" viewBox="0 0 64 64" fill="currentColor">
                    <path d="M32 8 L56 20 L56 44 L32 56 L8 44 L8 20 Z" opacity="0.6" />
                    <path d="M32 8 L56 20 L32 32 L8 20 Z" opacity="0.8" />
                    <path d="M8 20 L32 32 L32 56 L8 44 Z" opacity="0.5" />
                    <path d="M56 20 L32 32 L32 56 L56 44 Z" opacity="0.4" />
                  </svg>
                </div>
              </div>

              <button onClick={() => setStep(3)} className="w-full bg-blue-400 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium">
                Confirm Receiving & Sign
              </button>
            </div>
          </div>

          {/* PANEL 3 - Digital Sign-off */}
          <div className="bg-white rounded-xl overflow-hidden">
            <div className="bg-[#1a3a7c] text-white text-center py-3 font-semibold text-sm">Digital Sign-off</div>
            <div className="p-5">
              {/* Validated info */}
              <div className="bg-blue-100 rounded-lg p-3 text-center mb-4">
                <p className="text-sm font-semibold text-gray-700">Validated by: Budi</p>
                <p className="text-sm font-semibold text-gray-700">Total Boxes Accepted: 9</p>
              </div>

              {/* Nama Sopir */}
              <div className="mb-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama sopir</label>
                <input type="text" placeholder="Nama Sopir" value={namaS} onChange={(e) => setNamaS(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>

              {/* Nama Petugas */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Petugas</label>
                <input type="text" placeholder="Nama Petugas" value={namaP} onChange={(e) => setNamaP(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400" />
              </div>

              {/* Signature boxes */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 text-center mb-2">Tanda Tangan Sopir Vendor</p>
                  <div className="border border-gray-200 rounded-lg h-24 bg-gray-50 flex items-center justify-center">
                    <p className="text-xs text-gray-300">Sign here</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 text-center mb-2">Tanda Tangan Petugas Epson</p>
                  <div className="border border-gray-200 rounded-lg h-24 bg-gray-50 flex items-center justify-center">
                    <p className="text-xs text-gray-300">Sign here</p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-blue-400 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium">Selesaikan & Kirim Bukti</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
