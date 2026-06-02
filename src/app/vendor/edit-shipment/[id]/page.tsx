"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/app/context/authContext";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

type Part = {
  id: string;
  part_number: string;
  part_name: string;
  unit: string;
};

type ManifestRowUpdated = {
  id: number;
  part_id: string;
  qty: string;
  totalPackages: string;
  batch_code: string;
};

export default function EditShipment() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [driverName, setDriverName] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const [partsList, setPartsList] = useState<Part[]>([]);
  const [rows, setRows] = useState<ManifestRowUpdated[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await fetch('/api/parts');
        if (res.ok) {
          const data = await res.json();
          setPartsList(data);
        }
      } catch (error) {
        console.error("Error fetching parts:", error);
      }
    };
    fetchParts();
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchManifest = async () => {
      try {
        const res = await fetch(`/api/manifests/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDriverName(data.driver_name || "");
          setVehiclePlate(data.vehicle_plate || "");
          if (data.estimated_arrival) {
            setSelectedDate(new Date(data.estimated_arrival));
          }
          
          if (data.manifest_items && data.manifest_items.length > 0) {
            const mappedRows = data.manifest_items.map((item: any, index: number) => ({
              id: index + 1,
              part_id: item.part_id,
              qty: item.expected_qty.toString(),
              totalPackages: item.expected_boxes.toString(),
              batch_code: item.batch_code || ""
            }));
            setRows(mappedRows);
          } else {
            setRows([{ id: 1, part_id: "", qty: "", totalPackages: "", batch_code: "" }]);
          }
        } else {
          toast.error("Gagal mengambil data manifest");
          router.push("/vendor/dashboard");
        }
      } catch (error) {
        console.error("Error fetching manifest:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchManifest();
  }, [id, router]);

  const formatDate = (date: Date) => {
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear().toString().slice(-2);
    return `${d}/${m}/${y}`;
  };

  const addRow = () => {
    setRows([...rows, { id: rows.length + 1, part_id: "", qty: "", totalPackages: "", batch_code: "" }]);
  };

  const deleteRow = (rowId: number) => {
    if (rows.length === 1) return;
    setRows(rows.filter((r) => r.id !== rowId));
  };

  const updateRow = (rowId: number, field: keyof ManifestRowUpdated, value: string) => {
    setRows(rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)));
  };

  const handleSave = async () => {
    try {
      const payload = {
        vendor_id: user?.vendor_id,
        driver_name: driverName,
        vehicle_plate: vehiclePlate,
        estimated_arrival: selectedDate.toISOString(),
        items: rows.map(row => ({
          part_id: row.part_id,
          expected_qty: parseInt(row.qty) || 0,
          expected_boxes: parseInt(row.totalPackages) || 0,
          batch_code: row.batch_code,
        }))
      };

      const res = await fetch(`/api/manifests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Perubahan berhasil disimpan!");
        router.push("/vendor/dashboard");
      } else {
        toast.error(data.error || "Terjadi kesalahan saat menyimpan perubahan");
      }
    } catch (error) {
      console.error("Error saving manifest:", error);
      toast.error("Terjadi kesalahan pada server");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="px-4 md:px-8 py-4 md:py-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Edit Shipment</h1>

        <div className="bg-white rounded-xl p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

          <p className="font-semibold text-gray-800 mb-3">Manifest Input</p>
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 md:px-4 py-3 font-semibold text-gray-700 w-10">No</th>
                  <th className="text-left px-3 md:px-4 py-3 font-semibold text-gray-700 w-48">Part Name</th>
                  <th className="text-left px-3 md:px-4 py-3 font-semibold text-gray-700 w-48">Part Number</th>
                  <th className="text-left px-3 md:px-4 py-3 font-semibold text-gray-700">Qty per pkg</th>
                  <th className="text-left px-3 md:px-4 py-3 font-semibold text-gray-700">Total Packages</th>
                  <th className="text-left px-3 md:px-4 py-3 font-semibold text-gray-700">Batch Code</th>
                  <th className="text-left px-3 md:px-4 py-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const selectedPart = partsList.find(p => p.id === row.part_id);

                  return (
                    <tr key={row.id} className="border-t border-gray-100">
                      <td className="px-3 md:px-4 py-3 text-gray-500 text-xs">{String(index + 1).padStart(2, "0")}.</td>
                      <td className="px-2 py-3">
                        <select
                          value={row.part_id}
                          onChange={(e) => updateRow(row.id, "part_id", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400 bg-white"
                        >
                          <option value="">- Select Part -</option>
                          {partsList.map(part => (
                            <option key={part.id} value={part.id}>
                              {part.part_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-3">
                        <div className="w-full border border-gray-100 bg-gray-50 rounded-lg px-2 py-1.5 text-sm text-gray-500 min-h-[34px] flex items-center">
                          {selectedPart ? selectedPart.part_number : "Select a part..."}
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={row.qty}
                          onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="number"
                          placeholder="Total"
                          value={row.totalPackages}
                          onChange={(e) => updateRow(row.id, "totalPackages", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <input
                          type="text"
                          placeholder="Batch Code"
                          value={row.batch_code}
                          onChange={(e) => updateRow(row.id, "batch_code", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                        />
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => deleteRow(row.id)} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button onClick={addRow} className="border-2 border-[#1a3a7c] text-[#1a3a7c] font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 text-sm w-full sm:w-auto">
              + Add Column
            </button>
            <div className="flex gap-2">
              <button onClick={() => router.push("/vendor/dashboard")} className="border-2 border-gray-300 text-gray-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 text-sm w-full sm:w-auto">
                Cancel
              </button>
              <button onClick={handleSave} className="bg-[#1a3a7c] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#152f66] text-sm w-full sm:w-auto">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
