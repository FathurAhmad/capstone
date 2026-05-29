"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar";

export default function ManifestDetails() {
  const { id } = useParams();
  const router = useRouter();
  
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchManifest = async () => {
      try {
        const res = await fetch(`/api/manifests/${id}`);
        if (res.ok) {
          const data = await res.json();
          setManifest(data);
        } else {
          alert("Gagal memuat detail manifest.");
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">Loading detail manifest...</div>;
  }

  if (!manifest) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] print:bg-white print:min-h-0">
      <div className="px-4 md:px-8 py-4 md:py-6 max-w-6xl mx-auto">
        {/* Header - Hidden on print if you want, or kept */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 print:hidden">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1a3a7c] hover:border-[#1a3a7c] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Manifest Details</h1>
          </div>
          <button 
            onClick={handlePrint}
            className="bg-[#1a3a7c] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#152f66] text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Labels
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
          
          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100 print:border-black print:pb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Manifest Number</p>
              <p className="text-xl font-bold text-gray-900">{manifest.manifest_number}</p>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white inline-block ${
                  manifest.status === 'DRAFT' ? 'bg-gray-400' :
                  manifest.status === 'LOCKED' ? 'bg-orange-500' :
                  manifest.status === 'CHECKING' ? 'bg-blue-500' :
                  manifest.status === 'COMPLETED' ? 'bg-green-500' :
                  'bg-red-500'
                }`}>
                  {manifest.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Driver Name</p>
                <p className="font-semibold text-gray-800">{manifest.driver_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Vehicle Plate</p>
                <p className="font-semibold text-gray-800">{manifest.vehicle_plate || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Estimated Arrival</p>
                <p className="font-semibold text-gray-800">
                  {manifest.estimated_arrival ? new Date(manifest.estimated_arrival).toLocaleDateString("en-US", {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Created At</p>
                <p className="font-semibold text-gray-800">
                  {manifest.created_at ? new Date(manifest.created_at).toLocaleDateString("en-US", {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }) : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Items & QR Codes Section */}
          <div>
            <h2 className="font-bold text-lg text-gray-900 mb-4 print:mb-6">Shipment Items & QR Codes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
              {manifest.manifest_items?.map((item: any, index: number) => (
                <div key={item.id} className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6 print:border-black print:break-inside-avoid">
                  
                  {/* QR Code Graphic */}
                  <div className="flex-shrink-0 bg-white p-2 border border-gray-100 rounded-lg shadow-sm">
                    <QRCodeSVG value={item.qr_codes?.[0]?.qr_payload || item.id} size={120} level="M" />
                  </div>
                  
                  {/* Item Detail */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-blue-600 tracking-wider uppercase mb-1">Item #{index + 1}</p>
                      <h3 className="font-bold text-gray-900 text-lg">{item.parts?.part_name || "Unknown Part"}</h3>
                      <p className="text-sm text-gray-500">{item.parts?.part_number || "-"}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-3 border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-gray-500 text-xs">Quantity</p>
                        <p className="font-semibold text-gray-800">{item.expected_qty} pcs</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Boxes</p>
                        <p className="font-semibold text-gray-800">{item.expected_boxes || 0} box</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 text-xs">Batch Code</p>
                        <p className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded inline-block mt-0.5 text-xs">
                          {item.batch_code || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!manifest.manifest_items || manifest.manifest_items.length === 0) && (
                <div className="col-span-full py-8 text-center text-gray-500 border border-dashed border-gray-300 rounded-xl">
                  No items found in this manifest.
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
