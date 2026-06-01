"use client";

import { useState, useEffect } from "react";

interface Part {
  id: string;
  part_number: string;
  part_name: string;
  unit: string;
}

export default function ManagePartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [partNumber, setPartNumber] = useState("");
  const [partName, setPartName] = useState("");
  const [partUnit, setPartUnit] = useState("pcs");
  const [partLoading, setPartLoading] = useState(false);

  const fetchParts = async () => {
    try {
      const res = await fetch("/api/parts");
      const data = await res.json();
      if (res.ok) {
        setParts(data);
      }
    } catch (error) {
      console.error("Failed to fetch parts", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartLoading(true);
    try {
      const res = await fetch("/api/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part_number: partNumber,
          part_name: partName,
          unit: partUnit
        })
      });
      if (res.ok) {
        alert("Part successfully added!");
        setPartNumber("");
        setPartName("");
        setPartUnit("pcs");
        setIsModalOpen(false);
        fetchParts(); // Refresh data
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add part");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setPartLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="px-4 md:px-8 py-4 md:py-8 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Parts</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1a3a7c] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#122859] transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Part
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading parts...</div>
          ) : parts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No parts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 w-40">Part Number</th>
                    <th className="px-6 py-4">Part Name</th>
                    <th className="px-6 py-4 w-24">Unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {parts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-mono text-xs font-medium">
                          {p.part_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{p.part_name}</td>
                      <td className="px-6 py-4">{p.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">Create New Part</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleAddPart} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                    <input
                      type="text"
                      required
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      placeholder="P-12345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                    <input
                      type="text"
                      required
                      value={partName}
                      onChange={(e) => setPartName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      placeholder="Resistor 10k"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      required
                      value={partUnit}
                      onChange={(e) => setPartUnit(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      placeholder="pcs, box, dll."
                    />
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={partLoading}
                      className="flex-1 bg-[#1a3a7c] text-white font-medium py-2.5 rounded-lg hover:bg-[#122859] transition-colors disabled:opacity-50"
                    >
                      {partLoading ? "Saving..." : "Add Part"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
