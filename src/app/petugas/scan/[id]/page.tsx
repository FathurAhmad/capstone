"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { getDB, OfflineManifest, OfflineManifestItem } from "@/lib/idb";
import QRScanner from "@/components/QRScanner";

export default function WorkspaceScannerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const id = params.id as string; // manifest_id
  const sessionId = searchParams.get("session_id");

  const [manifest, setManifest] = useState<OfflineManifest | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State Scanning & Pencocokan
  const [scannedItem, setScannedItem] = useState<OfflineManifestItem | null>(null);
  const [actualQty, setActualQty] = useState<number | "">("");
  const [isDamaged, setIsDamaged] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  
  // Feedback state
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const db = await getDB();
        if (!db) throw new Error("IndexedDB tidak tersedia");
        
        const data = await db.get('manifests', id);
        if (!data) throw new Error("Data manifes tidak ditemukan di lokal. Harap mulai sesi dari awal.");
        
        setManifest(data);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) loadData();
  }, [id]);

  const handleScanSuccess = (decodedText: string) => {
    setErrorMsg("");
    setSuccessMsg("");
    setScannedItem(null);
    setActualQty("");
    setIsDamaged(false);
    setPhotoBase64(null);
    setRemark("");

    if (!manifest) return;

    // Asumsi: QR Code berisi part_number
    const foundItem = manifest.items.find(item => item.part_number === decodedText || item.part_id === decodedText);
    
    if (foundItem) {
      setScannedItem(foundItem);
      setActualQty(foundItem.expected_qty); // Default isi penuh
    } else {
      setErrorMsg(`Barang dengan kode QR "${decodedText}" tidak ditemukan di manifes ini!`);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveScan = async () => {
    if (!scannedItem || !sessionId) return;
    
    const qty = typeof actualQty === "number" ? actualQty : 0;
    
    // Validasi Foto jika mismatch
    const isMismatch = qty < scannedItem.expected_qty;
    if ((isMismatch || isDamaged) && !photoBase64) {
      setErrorMsg("Karena terdapat selisih atau kerusakan, Anda WAJIB melampirkan foto bukti.");
      return;
    }

    try {
      const db = await getDB();
      if (!db) return;

      const scanLogId = uuidv4();
      let scanStatus = "MATCH";
      if (isDamaged) scanStatus = "DAMAGED";
      else if (isMismatch) scanStatus = "MISMATCH";
      else if (qty > scannedItem.expected_qty) scanStatus = "OVER";

      // 1. Simpan Scan Log
      await db.put('scan_logs', {
        id: scanLogId,
        manifest_id: id,
        session_id: sessionId,
        part_id: scannedItem.part_id,
        actual_qty: qty,
        expected_qty: scannedItem.expected_qty,
        scan_status: scanStatus,
        scanned_at: Date.now()
      });

      // 2. Simpan Evidence jika ada foto
      if (photoBase64) {
        await db.put('evidences', {
          id: uuidv4(),
          scan_id: scanLogId,
          photo_base64: photoBase64,
          remark: remark || (isDamaged ? "Barang dilaporkan rusak oleh petugas." : `Terjadi selisih jumlah. Expected: ${scannedItem.expected_qty}, Actual: ${qty}`),
          created_at: Date.now()
        });
      }

      setSuccessMsg(`Barang ${scannedItem.part_name} berhasil disimpan!`);
      
      // Reset form
      setTimeout(() => {
        setScannedItem(null);
        setActualQty("");
        setIsDamaged(false);
        setPhotoBase64(null);
        setRemark("");
        setSuccessMsg("");
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal menyimpan data ke IndexedDB.");
    }
  };

  const handleFinishScan = () => {
    router.push(`/petugas/sign-off/${id}?session_id=${sessionId}`);
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Memuat Workspace...</div>;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col overflow-y-auto">
      {/* HEADER KECIL */}
      <div className="bg-[#1a3a7c] text-white p-4 sticky top-0 z-10 shadow-md">
        <h1 className="font-bold text-xl">Scanner Pengecekan</h1>
        <p className="text-sm opacity-80">Manifes: {manifest?.manifest_number}</p>
      </div>

      <div className="flex-1 p-4 pb-32 max-w-md mx-auto w-full">
        {/* Pesan Global */}
        {errorMsg && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-sm">
            <p className="font-bold">Peringatan</p>
            <p>{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded shadow-sm font-bold text-center">
            {successMsg}
          </div>
        )}

        {/* AREA SCANNER */}
        {!scannedItem ? (
          <div className="mb-6">
            <p className="text-gray-600 text-center mb-2 font-medium">Arahkan kamera ke QR Code barang</p>
            <QRScanner onScanSuccess={handleScanSuccess} />
          </div>
        ) : (
          /* FORM HASIL SCAN */
          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 overflow-hidden mb-6 animate-fade-in">
            <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Berhasil Di-scan</p>
                <h2 className="text-xl font-bold text-gray-900">{scannedItem.part_number}</h2>
              </div>
              <button 
                onClick={() => setScannedItem(null)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              <div>
                <p className="text-sm text-gray-500 mb-1">Nama Barang</p>
                <p className="font-medium text-gray-900">{scannedItem.part_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Expected</p>
                  <p className="text-2xl font-bold text-gray-900">{scannedItem.expected_qty}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase font-semibold block mb-1">Actual QTY</label>
                  <input 
                    type="number" 
                    value={actualQty}
                    onChange={(e) => setActualQty(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full text-2xl font-bold text-blue-700 p-2 border-2 border-blue-200 rounded-xl focus:border-blue-500 outline-none text-center h-[60px]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Toggle Barang Rusak */}
              <div className="pt-2">
                <button 
                  onClick={() => setIsDamaged(!isDamaged)}
                  className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold border-2 transition-colors ${isDamaged ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  {isDamaged ? "Laporkan Barang Rusak (Aktif)" : "Tandai Jika Barang Rusak"}
                </button>
              </div>

              {/* Area Upload Foto Wajib */}
              {((typeof actualQty === "number" && actualQty < scannedItem.expected_qty) || isDamaged) && (
                <div className="bg-orange-50 p-4 rounded-xl border-2 border-orange-200">
                  <p className="text-sm font-bold text-orange-700 mb-2">📸 Wajib Ambil Foto Bukti</p>
                  
                  {photoBase64 ? (
                    <div className="relative mb-3">
                      <img src={photoBase64} alt="Bukti" className="w-full h-40 object-cover rounded-lg border border-orange-200" />
                      <button onClick={() => setPhotoBase64(null)} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-orange-300 border-dashed rounded-lg cursor-pointer bg-white hover:bg-orange-100 mb-3">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <p className="text-xs text-orange-600 font-bold">Buka Kamera</p>
                      </div>
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
                    </label>
                  )}
                  
                  <input 
                    type="text" 
                    placeholder="Catatan tambahan (Opsional)" 
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    className="w-full p-3 border border-orange-200 rounded-lg text-sm"
                  />
                </div>
              )}

              {/* Tombol Simpan */}
              <button 
                onClick={handleSaveScan}
                className="w-full h-14 bg-[#1a3a7c] text-white text-lg font-bold rounded-xl shadow-lg hover:bg-[#122859] active:scale-95 transition-all"
              >
                Simpan Hasil Scan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t-2 border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        <button 
          onClick={handleFinishScan}
          className="w-full h-16 bg-green-500 text-white text-xl font-black rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-green-600 active:scale-95 transition-transform"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          Selesai Scan & Validasi
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}} />
    </div>
  );
}
