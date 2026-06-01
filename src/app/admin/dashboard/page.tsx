"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"user" | "vendor" | "part">("user");

  // User Form State
  const [userFullName, setUserFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("vendor");
  const [userLoading, setUserLoading] = useState(false);

  // Vendor Form State
  const [vendorCode, setVendorCode] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorLoading, setVendorLoading] = useState(false);

  // Part Form State
  const [partNumber, setPartNumber] = useState("");
  const [partName, setPartName] = useState("");
  const [partUnit, setPartUnit] = useState("pcs");
  const [partLoading, setPartLoading] = useState(false);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: userFullName,
          email: userEmail,
          role: userRole
        })
      });
      if (res.ok) {
        alert("User successfully added!");
        setUserFullName("");
        setUserEmail("");
        setUserRole("vendor");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add user");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setUserLoading(false);
    }
  };

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
        alert("Vendor successfully added!");
        setVendorCode("");
        setVendorName("");
        setVendorAddress("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add vendor");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setVendorLoading(false);
    }
  };

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
      {/* We can include Navbar if needed, similar to Vendor Dashboard */}
      {/* <Navbar /> */}
      <div className="px-4 md:px-8 py-4 md:py-8 max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("user")}
            className={`pb-3 px-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "user"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Add New User
          </button>
          <button
            onClick={() => setActiveTab("vendor")}
            className={`pb-3 px-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "vendor"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Add New Vendor
          </button>
          <button
            onClick={() => setActiveTab("part")}
            className={`pb-3 px-2 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "part"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Add New Part
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {activeTab === "user" && (
            <form onSubmit={handleAddUser} className="max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New User</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userFullName}
                    onChange={(e) => setUserFullName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="manajemen">Manajemen</option>
                    <option value="petugas">Petugas</option>
                    <option value="vendor">Vendor</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={userLoading}
                  className="w-full mt-4 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {userLoading ? "Saving..." : "Add User"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "vendor" && (
            <form onSubmit={handleAddVendor} className="max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Vendor</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Code (Optional)</label>
                  <input
                    type="text"
                    value={vendorCode}
                    onChange={(e) => setVendorCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
                    placeholder="123 Example Street"
                  />
                </div>
                <button
                  type="submit"
                  disabled={vendorLoading}
                  className="w-full mt-4 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {vendorLoading ? "Saving..." : "Add Vendor"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "part" && (
            <form onSubmit={handleAddPart} className="max-w-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Create New Part</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                  <input
                    type="text"
                    required
                    value={partNumber}
                    onChange={(e) => setPartNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-sm"
                    placeholder="pcs, box, etc."
                  />
                </div>
                <button
                  type="submit"
                  disabled={partLoading}
                  className="w-full mt-4 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {partLoading ? "Saving..." : "Add Part"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
