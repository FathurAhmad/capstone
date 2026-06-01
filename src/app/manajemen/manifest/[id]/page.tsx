"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authContext";

export default function ManajemenManifestDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchManifest = async () => {
    try {
      const res = await fetch(`/api/manifests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setManifest(data);
      } else {
        alert("Gagal memuat detail manifest.");
        router.push("/manajemen/dashboard");
      }
    } catch (error) {
      console.error("Error fetching manifest:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchManifest();
  }, [id]);

  const handleResolve = async (discrepancyId: string, status: string) => {
    if (!user?.id) {
      alert("User session not found.");
      return;
    }

    try {
      setResolvingId(discrepancyId);
      const res = await fetch(`/api/discrepancies/${discrepancyId}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status,
          resolvedBy: user.id
        })
      });

      if (res.ok) {
        // Refresh data to reflect new status
        await fetchManifest();
      } else {
        const data = await res.json();
        alert(`Gagal resolve: ${data.error}`);
      }
    } catch (error) {
      console.error("Error resolving discrepancy:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setResolvingId(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">Loading detail manifest...</div>;
  }

  if (!manifest) return null;

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="px-4 md:px-8 py-4 md:py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-[#1a3a7c] hover:border-[#1a3a7c] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Review Manifest</h1>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-sm border border-gray-100">
          
          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Manifest Number</p>
              <p className="text-xl font-bold text-gray-900">{manifest.manifest_number}</p>
              
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-1">Overall Status</p>
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
                <p className="text-sm text-gray-500 mb-1">Vendor</p>
                <p className="font-semibold text-gray-800">{manifest.vendors?.name || "-"}</p>
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

          {/* Items & Discrepancies Section */}
          <div>
            <h2 className="font-bold text-lg text-gray-900 mb-4">Shipment Items & Quality Review</h2>
            
            <div className="grid grid-cols-1 gap-6">
              {manifest.manifest_items?.map((item: any, index: number) => {
                // Cari apakah item ini punya discrepancy
                const disc = manifest.discrepancies?.find((d: any) => d.part_id === item.part_id);
                const hasDiscrepancy = !!disc;
                
                // Cari foto bukti jika ada
                let photoUrl = null;
                if (item.scan_logs && item.scan_logs.length > 0) {
                  for (const log of item.scan_logs) {
                    if (log.digital_evidence && log.digital_evidence.length > 0) {
                      photoUrl = log.digital_evidence[0].photo_url;
                      break;
                    }
                  }
                }

                return (
                  <div key={item.id} className={`border rounded-xl p-5 flex flex-col md:flex-row gap-6 ${hasDiscrepancy ? 'border-red-300 bg-red-50/30' : 'border-gray-200 bg-white'}`}>
                    
                    {/* Item Detail */}
                    <div className="flex-1">
                      <div className="mb-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-blue-600 tracking-wider uppercase mb-1">Item #{index + 1}</p>
                          {!hasDiscrepancy && (
                            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">MATCH</span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{item.parts?.part_name || "Unknown Part"}</h3>
                        <p className="text-sm text-gray-500">{item.parts?.part_number || "-"}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4 text-sm mt-3 border-t border-gray-100 pt-3">
                        <div>
                          <p className="text-gray-500 text-xs">Expected Qty</p>
                          <p className="font-semibold text-gray-800">{item.expected_qty} pcs</p>
                        </div>
                        {hasDiscrepancy && (
                          <>
                            <div>
                              <p className="text-red-500 font-medium text-xs">Actual Qty</p>
                              <p className="font-bold text-red-600">{disc.actual_qty} pcs</p>
                            </div>
                            <div>
                              <p className="text-red-500 font-medium text-xs">Variance</p>
                              <p className="font-bold text-red-600">{disc.variance} pcs</p>
                            </div>
                          </>
                        )}
                        {!hasDiscrepancy && (
                          <div>
                            <p className="text-gray-500 text-xs">Boxes</p>
                            <p className="font-semibold text-gray-800">{item.expected_boxes || 0} box</p>
                          </div>
                        )}
                        <div className="col-span-2 sm:col-span-3">
                          <p className="text-gray-500 text-xs">Batch Code</p>
                          <p className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded inline-block mt-0.5 text-xs">
                            {item.batch_code || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Discrepancy Action & Evidence Panel */}
                    {hasDiscrepancy && (
                      <div className="flex-1 border-t md:border-t-0 md:border-l border-red-200 pt-4 md:pt-0 md:pl-6 flex flex-col">
                        <div className="mb-4">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Proof of Delivery (Photo)</p>
                          {photoUrl ? (
                            <div className="w-full h-32 bg-black rounded-lg overflow-hidden relative">
                              {/* Using simple img tag for remote storage, normally use next/image but this works for demo */}
                              <img src={photoUrl} alt="Evidence" className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity" />
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm italic">
                              No photo evidence attached
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Resolution Action</p>
                          {disc.resolution_status === "PENDING" ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => handleResolve(disc.id, "APPROVED")}
                                disabled={resolvingId === disc.id}
                                className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50"
                              >
                                ✅ Approve
                              </button>
                              <button 
                                onClick={() => handleResolve(disc.id, "RETURNED")}
                                disabled={resolvingId === disc.id}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50"
                              >
                                ❌ Return
                              </button>
                              <button 
                                onClick={() => handleResolve(disc.id, "HOLD")}
                                disabled={resolvingId === disc.id}
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50"
                              >
                                ⏸️ Hold
                              </button>
                              <button 
                                onClick={() => handleResolve(disc.id, "RECOUNT")}
                                disabled={resolvingId === disc.id}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded-md transition-colors disabled:opacity-50"
                              >
                                🔄 Recount
                              </button>
                            </div>
                          ) : (
                            <div className={`text-center py-2 px-3 rounded-md font-semibold text-sm text-white ${
                              disc.resolution_status === "APPROVED" ? "bg-green-500" :
                              disc.resolution_status === "RETURNED" ? "bg-red-500" :
                              disc.resolution_status === "HOLD" ? "bg-orange-500" :
                              "bg-blue-500"
                            }`}>
                              Status: {disc.resolution_status}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
              
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
