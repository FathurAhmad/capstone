"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScanner({ onScanSuccess }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Memastikan elemen ada sebelum inisialisasi scanner
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      disableFlip: false,
    };

    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner("reader", config, false);
      
      scannerRef.current.render(
        (decodedText) => {
          setIsScanning(false);
          // Hentikan scanner sementara agar tidak scan berulang
          scannerRef.current?.pause(true);
          onScanSuccess(decodedText);
        },
        (error) => {
          // Abaikan error saat tidak ada QR code yang terdeteksi
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess]);

  // Expose fungsi untuk melanjutkan scan (resume) dari parent component
  const resumeScanner = () => {
    setIsScanning(true);
    if (scannerRef.current && scannerRef.current.getState() === 3 /* PAUSED */) {
      scannerRef.current.resume();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg border-4 border-[#1a3a7c]">
      {/* Container untuk html5-qrcode */}
      <div id="reader" className="w-full bg-black"></div>
      
      {!isScanning && (
        <div className="bg-white p-4 text-center">
          <p className="text-green-600 font-bold mb-2">QR Code Terdeteksi!</p>
          <button 
            onClick={resumeScanner}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium w-full"
          >
            Scan Ulang
          </button>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        #reader { border: none !important; }
        #reader__dashboard_section_csr span { color: white !important; }
        #reader__dashboard_section_swaplink { color: #60a5fa !important; }
        #reader button { 
          background-color: #1a3a7c; 
          color: white; 
          padding: 8px 16px; 
          border-radius: 8px; 
          border: none;
          margin-top: 10px;
          cursor: pointer;
        }
      `}} />
    </div>
  );
}
