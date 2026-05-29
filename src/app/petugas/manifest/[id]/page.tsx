"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { getDB } from "@/lib/idb";
import { useAuth } from "@/app/context/authContext";

export default function ManifestPreparationPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { user } = useAuth();
  
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const fetchManifest = async () => {
      try {
        const res = await fetch(`/api/manifests/${id}`);
        if (!res.ok) throw new Error("Gagal mengambil data manifes");
        const data = await res.json();
        setManifest(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchManifest();
  }, [id]);

  const handleStartSession = async () => {
    if (!manifest) return;
    setIsStarting(true);
    
    try {
      const db = await getDB();
      if (!db) throw new Error("IndexedDB tidak didukung");
      
      let sessionId = uuidv4();
      
      // Panggil API untuk ubah status ke CHECKING dan buat sesi di server
      try {
        const res = await fetch('/api/inbounds/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manifest_number: manifest.manifest_number,
            user_id: user?.id || null
          })
        });
        
        if (res.ok) {
          const apiResponse = await res.json();
          if (apiResponse.data?.id) {
            sessionId = apiResponse.data.id;
          }
        } else {
          console.warn("Gagal mengubah status di server. Lanjut mode offline.");
        }
      } catch (apiError) {
        console.warn("Sedang offline. Lanjut menggunakan UUID lokal.", apiError);
      }
      
      // Simpan Manifest ke IDB
      await db.put('manifests', {
        id: manifest.id,
        manifest_number: manifest.manifest_number,
        vendor_id: manifest.vendor_id,
        vendor_name: manifest.vendors?.name || "Unknown Vendor",
        driver_name: manifest.driver_name || "",
        vehicle_plate: manifest.vehicle_plate || "",
        items: manifest.manifest_items.map((item: any) => ({
          id: item.id,
          part_id: item.part_id,
          part_number: item.parts?.part_number || "",
          part_name: item.parts?.part_name || "",
          expected_qty: item.expected_qty,
          qr_payload: item.qr_codes?.[0]?.qr_payload || item.parts?.part_number || ""
        })),
        createdAt: Date.now()
      });
      
      // Simpan Sesi Inbound lokal ke IDB
      await db.put('sessions', {
        id: sessionId,
        manifest_id: manifest.id,
        started_at: Date.now()
      });
      
      // Arahkan ke halaman Scan dengan parameter session_id
      router.push(`/petugas/scan/${manifest.id}?session_id=${sessionId}`);
    } catch (err) {
      console.error(err);
      alert("Gagal memulai sesi. Pastikan browser mendukung IndexedDB.");
      setIsStarting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">Memuat data manifes...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#f0f4f8] p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Persiapan Pengecekan</h1>
            <p className="text-gray-500 mt-1">Manifes: <span className="font-semibold text-gray-800">{manifest?.manifest_number}</span></p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold tracking-wide">
            {manifest?.status}
          </span>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Vendor</p>
              <p className="font-medium text-gray-900">{manifest?.vendors?.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Pengemudi</p>
              <p className="font-medium text-gray-900">{manifest?.driver_name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Plat Kendaraan</p>
              <p className="font-medium text-gray-900">{manifest?.vehicle_plate || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-semibold">Total Item</p>
              <p className="font-medium text-gray-900">{manifest?.manifest_items?.length || 0} Barang</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">Daftar Barang (Expected)</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {manifest?.manifest_items?.map((item: any, index: number) => (
                <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{item.parts?.part_number}</p>
                      <p className="text-sm text-gray-500 font-medium">{item.parts?.part_name}</p>
                    </div>
                  </div>
                  <div className="text-right bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Expected QTY</p>
                    <p className="font-bold text-gray-900 text-xl">{item.expected_qty} <span className="text-sm font-normal text-gray-500">{item.parts?.unit}</span></p>
                  </div>
                </div>
              ))}
              
              {(!manifest?.manifest_items || manifest.manifest_items.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data barang pada manifes ini.
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => router.back()} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Kembali
            </button>
            <button 
              onClick={handleStartSession} 
              disabled={isStarting || !manifest?.manifest_items?.length}
              className="px-8 py-3 bg-[#1a3a7c] text-white rounded-xl font-bold hover:bg-[#122859] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isStarting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menyiapkan...
                </>
              ) : (
                "Mulai Sesi Pengecekan"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
