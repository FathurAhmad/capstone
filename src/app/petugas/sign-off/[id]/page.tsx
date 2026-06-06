"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getDB, clearAllLocalData, OfflineManifest, OfflineScanLog, OfflineEvidence } from "@/lib/idb";
import SignaturePad, { SignaturePadRef } from "@/components/SignaturePad";
import toast from "react-hot-toast";

export default function SignOffPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string; // manifest_id
  const sessionId = searchParams.get("session_id");

  const [manifest, setManifest] = useState<OfflineManifest | null>(null);
  const [scanLogs, setScanLogs] = useState<OfflineScanLog[]>([]);
  const [evidences, setEvidences] = useState<OfflineEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const driverSigRef = useRef<SignaturePadRef>(null);
  const staffSigRef = useRef<SignaturePadRef>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await getDB();
        if (!db) throw new Error("IndexedDB tidak tersedia");
        
        const manifestData = await db.get('manifests', id);
        if (!manifestData) throw new Error("Data manifes tidak ditemukan di penyimpanan lokal.");
        setManifest(manifestData);

        // Ambil semua scan logs untuk manifest ini
        const logsIdx = db.transaction('scan_logs').store.index('by-manifest');
        const logs = await logsIdx.getAll(id);
        setScanLogs(logs);

        // Ambil semua evidences (foto Base64) berdasarkan scan_log id
        const evidenceStore = db.transaction('evidences').store;
        const evidenceIdx = evidenceStore.index('by-scan');
        const allEvidences: OfflineEvidence[] = [];
        for (const log of logs) {
          const evs = await evidenceIdx.getAll(log.id);
          allEvidences.push(...evs);
        }
        setEvidences(allEvidences);

      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) loadData();
  }, [id]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setErrorMsg("");

    const driverSig = driverSigRef.current?.getSignatureBase64();
    const staffSig = staffSigRef.current?.getSignatureBase64();

    if (!driverSig || !staffSig) {
      setErrorMsg("Tanda tangan Supir dan Petugas wajib diisi.");
      return;
    }

    if (!sessionId) {
      setErrorMsg("Session ID tidak valid.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Siapkan payload JSON besar untuk dikirim ke Backend API
      const payload = {
        session_id: sessionId,
        manifest_id: id,
        scan_logs: scanLogs,
        evidences: evidences,
        signatures: {
          driver: driverSig,
          staff: staffSig,
        }
      };

      // 2. Fetch ke endpoint /api/sync/scan-logs (Endpoint ini akan dibuat di langkah selanjutnya)
      const res = await fetch("/api/sync/scan-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal sinkronisasi data ke server.");
      }

      // 3. Jika berhasil sinkronisasi, Hapus data lokal (Pemeliharaan memori)
      await clearAllLocalData(id);

      // 4. Sukses dan Redirect
      toast.success("Sinkronisasi berhasil! Data manifes telah selesai diproses.");
      router.push("/petugas/dashboard");

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Terjadi kesalahan saat memproses data.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-700 font-bold">Menyiapkan Halaman Validasi...</div>;

  // Hitung ringkasan
  const totalItems = manifest?.items.length || 0;
  const totalScanned = scanLogs.length;
  const totalMatch = scanLogs.filter(log => log.scan_status === "MATCH").length;
  const totalMismatchOrDamaged = scanLogs.filter(log => log.scan_status === "MISMATCH" || log.scan_status === "DAMAGED" || log.scan_status === "OVER").length;

  return (
    <div className="fixed inset-0 z-50 bg-[#f0f4f8] flex flex-col overflow-y-auto">
      {/* HEADER */}
      <div className="bg-[#1a3a7c] text-white p-5 shadow-md">
        <h1 className="font-bold text-2xl">Validasi Akhir</h1>
        <p className="text-sm opacity-90 mt-1">Selesaikan & Sinkronisasi Data Manifes</p>
      </div>

      <div className="flex-1 p-5 pb-32 max-w-lg mx-auto w-full">
        {errorMsg && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-5 rounded shadow-sm">
            <p className="font-bold">Gagal Submit</p>
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        {/* INFO MANIFES */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">ID Manifes</p>
          <p className="font-black text-xl text-gray-900">{manifest?.manifest_number}</p>
          
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Supir</p>
              <p className="font-bold text-gray-900">{manifest?.driver_name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Kendaraan</p>
              <p className="font-bold text-gray-900">{manifest?.vehicle_plate || "-"}</p>
            </div>
          </div>
        </div>

        {/* REKAPITULASI SCAN */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Rekapitulasi Pengecekan</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Expected Item</span>
              <span className="font-bold text-gray-900">{totalItems}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Di-scan</span>
              <span className="font-bold text-blue-600">{totalScanned}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-600 font-medium flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Status Match
              </span>
              <span className="font-bold text-green-600">{totalMatch}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-red-500 font-medium flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Mismatch / Damaged
              </span>
              <span className="font-bold text-red-500">{totalMismatchOrDamaged}</span>
            </div>
            {evidences.length > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="text-gray-600 font-medium">Foto Bukti Terlampir</span>
                <span className="font-bold text-orange-500">{evidences.length} Foto</span>
              </div>
            )}
          </div>
        </div>

        {/* TANDA TANGAN */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Otorisasi & Tanda Tangan</h2>
          
          <SignaturePad ref={driverSigRef} label={`Tanda Tangan Supir (${manifest?.driver_name || "Tidak ada nama"})`} />
          <SignaturePad ref={staffSigRef} label="Tanda Tangan Petugas Gudang" />
        </div>
      </div>

      {/* ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-20">
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-16 bg-[#1a3a7c] text-white text-xl font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-[#122859] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyinkronkan Data...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              Confirm & Submit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
