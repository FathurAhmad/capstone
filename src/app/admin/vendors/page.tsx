"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

interface Vendor {
  id: string;
  vendor_code: string;
  name: string;
  address: string;
}

export default function ManageVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");

  // Form State
  const [vendorCode, setVendorCode] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorLoading, setVendorLoading] = useState(false);

  const fetchVendors = async () => {
    try {
      const res = await fetch("/api/vendors");
      const data = await res.json();
      if (res.ok) {
        setVendors(data);
      }
    } catch (error) {
      console.error("Failed to fetch vendors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setVendorLoading(true);
    try {
      const res = await fetch("/api/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_code: vendorCode,
          name: vendorName,
          address: vendorAddress
        })
      });
      if (res.ok) {
        toast.success("Vendor successfully added!");
        setVendorCode("");
        setVendorName("");
        setVendorAddress("");
        setIsModalOpen(false);
        fetchVendors();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add vendor");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setVendorLoading(false);
    }
  };

  const handleDeleteVendor = (id: string, name: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteName(name);
  };

  const performDeleteVendor = async () => {
    if (!confirmDeleteId) return;
    try {
      const res = await fetch(`/api/vendors/${confirmDeleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Vendor berhasil dihapus!");
        fetchVendors();
      } else {
        const data = await res.json();
        toast.error(data.error || "Gagal menghapus vendor");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="px-4 md:px-8 py-4 md:py-8 max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Vendors</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1a3a7c] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#122859] transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Vendor
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No vendors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 w-32">Vendor Code</th>
                    <th className="px-6 py-4">Vendor Name</th>
                    <th className="px-6 py-4">Address</th>
                    <th className="px-6 py-4 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vendors.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-mono text-xs font-medium">
                          {v.vendor_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{v.name}</td>
                      <td className="px-6 py-4">{v.address}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteVendor(v.id, v.name)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                          title="Delete vendor"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
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
                <h2 className="text-xl font-semibold text-gray-800">Create New Vendor</h2>
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
                <form onSubmit={handleAddVendor} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Code (Optional)</label>
                    <input
                      type="text"
                      value={vendorCode}
                      onChange={(e) => setVendorCode(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      placeholder="Leave blank to auto-generate"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                    <input
                      type="text"
                      required
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      placeholder="PT Example Vendor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      required
                      value={vendorAddress}
                      onChange={(e) => setVendorAddress(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a3a7c] text-gray-700 text-sm"
                      placeholder="123 Example Street"
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
                      disabled={vendorLoading}
                      className="flex-1 bg-[#1a3a7c] text-white font-medium py-2.5 rounded-lg hover:bg-[#122859] transition-colors disabled:opacity-50"
                    >
                      {vendorLoading ? "Saving..." : "Add Vendor"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={!!confirmDeleteId}
          title="Hapus Vendor"
          message={`Apakah Anda yakin ingin menghapus vendor "${confirmDeleteName}"?`}
          confirmText="Hapus"
          isDanger={true}
          onConfirm={performDeleteVendor}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </div>
    </div>
  );
}
