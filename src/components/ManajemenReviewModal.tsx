"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/authContext";

interface Props {
  manifestId: string;
  onClose: () => void;
}

export default function ManajemenReviewModal({ manifestId, onClose }: Props) {
  const { user } = useAuth();

  const [manifest, setManifest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchManifest = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/manifests/${manifestId}`);
      if (res.ok) {
        const data = await res.json();
        setManifest(data);
      } else {
        alert("Gagal memuat detail manifest.");
        onClose();
      }
    } catch (error) {
      console.error("Error fetching manifest:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (manifestId) fetchManifest();
  }, [manifestId]);

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
          resolvedBy: user.id,
        }),
      });

      if (res.ok) {
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
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
        <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-4">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-medium text-gray-700">
            Loading detail manifest...
          </p>
        </div>
      </div>
    );
  }

  if (!manifest) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 md:p-8">
      <div className="bg-white w-full max-w-5xl max-h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Review Manifest: {manifest.manifest_number}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Vendor: {manifest.vendors?.name || "-"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Modal (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1">Overall Status</p>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full text-white inline-block shadow-sm ${
                  manifest.status === "DRAFT"
                    ? "bg-gray-400"
                    : manifest.status === "LOCKED"
                      ? "bg-orange-500"
                      : manifest.status === "CHECKING"
                        ? "bg-blue-500"
                        : manifest.status === "COMPLETED"
                          ? "bg-green-500"
                          : "bg-red-500"
                }`}
              >
                {manifest.status}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Driver & Vehicle</p>
              <p className="font-semibold text-gray-800">
                {manifest.driver_name || "-"} • {manifest.vehicle_plate || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Estimated Arrival</p>
              <p className="font-semibold text-gray-800">
                {manifest.estimated_arrival
                  ? new Date(manifest.estimated_arrival).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )
                  : "-"}
              </p>
            </div>
          </div>

          {/* Items & Discrepancies Section */}
          <div>
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Shipment Items & Quality Review
            </h3>

            <div className="grid grid-cols-1 gap-5">
              {manifest.manifest_items?.map((item: any, index: number) => {
                const disc = manifest.discrepancies?.find(
                  (d: any) => d.part_id === item.part_id,
                );
                const hasDiscrepancy = !!disc;

                let photoUrl = null;
                if (manifest.inbound_sessions && manifest.inbound_sessions.length > 0) {
                  for (const session of manifest.inbound_sessions) {
                    if (session.scan_logs) {
                      // Cocokkan part_id dari item yang sedang di-render dengan part_id di scan_log
                      const log = session.scan_logs.find((sl: any) => sl.part_id === item.part_id && sl.digital_evidence && sl.digital_evidence.length > 0);
                      if (log) {
                        photoUrl = log.digital_evidence[0].photo_url;
                        break;
                      }
                    }
                  }
                }

                return (
                  <div
                    key={item.id}
                    className={`border rounded-xl p-5 flex flex-col lg:flex-row gap-6 shadow-sm transition-colors ${hasDiscrepancy ? "border-red-300 bg-red-50/20 hover:bg-red-50/40" : "border-gray-200 bg-white hover:border-blue-200"}`}
                  >
                    {/* Item Detail */}
                    <div className="flex-1">
                      <div className="mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1">
                            Item #{index + 1}
                          </p>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {item.parts?.part_name || "Unknown Part"}
                          </h4>
                          <p className="text-sm text-gray-500 font-mono mt-0.5">
                            {item.parts?.part_number || "-"}
                          </p>
                        </div>
                        {!hasDiscrepancy && (
                          <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            MATCH
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex-1 min-w-[100px]">
                          <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">
                            Expected Qty
                          </p>
                          <p className="font-bold text-gray-800 text-base">
                            {item.expected_qty}{" "}
                            <span className="text-xs font-normal text-gray-500">
                              pcs
                            </span>
                          </p>
                        </div>
                        {hasDiscrepancy && (
                          <>
                            <div className="flex-1 min-w-[100px]">
                              <p className="text-red-500 text-xs uppercase tracking-wide font-bold mb-1">
                                Actual Qty
                              </p>
                              <p className="font-bold text-red-600 text-base">
                                {disc.actual_qty}{" "}
                                <span className="text-xs font-normal text-red-400">
                                  pcs
                                </span>
                              </p>
                            </div>
                            <div className="flex-1 min-w-[100px]">
                              <p className="text-red-500 text-xs uppercase tracking-wide font-bold mb-1">
                                Variance
                              </p>
                              <p className="font-bold text-red-600 text-base">
                                {disc.variance}{" "}
                                <span className="text-xs font-normal text-red-400">
                                  pcs
                                </span>
                              </p>
                            </div>
                          </>
                        )}
                        {!hasDiscrepancy && (
                          <div className="flex-1 min-w-[100px]">
                            <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">
                              Boxes
                            </p>
                            <p className="font-bold text-gray-800 text-base">
                              {item.expected_boxes || 0}{" "}
                              <span className="text-xs font-normal text-gray-500">
                                box
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Discrepancy Action & Evidence Panel */}
                    {hasDiscrepancy && (
                      <div className="flex-1 border-t lg:border-t-0 lg:border-l border-red-200 pt-4 lg:pt-0 lg:pl-6 flex flex-col">
                        <div className="mb-4">
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            Proof of Delivery
                          </p>
                          {photoUrl ? (
                            <div className="w-full h-40 bg-black/5 rounded-xl border border-gray-200 overflow-hidden relative group">
                              <img
                                src={photoUrl}
                                alt="Evidence"
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-40 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 italic">
                              <svg
                                className="w-8 h-8 mb-2 opacity-50"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm">No photo attached</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                            Resolution Action
                          </p>
                          {disc.resolution_status === "PENDING" ? (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() =>
                                  handleResolve(disc.id, "APPROVED")
                                }
                                disabled={resolvingId === disc.id}
                                className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleResolve(disc.id, "RETURNED")
                                }
                                disabled={resolvingId === disc.id}
                                className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                ❌ Return
                              </button>
                              <button
                                onClick={() => handleResolve(disc.id, "HOLD")}
                                disabled={resolvingId === disc.id}
                                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                ⏸️ Hold
                              </button>
                              <button
                                onClick={() =>
                                  handleResolve(disc.id, "RECOUNT")
                                }
                                disabled={resolvingId === disc.id}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2.5 px-3 rounded-lg shadow-sm transition-all hover:shadow disabled:opacity-50 flex items-center justify-center gap-1.5"
                              >
                                🔄 Recount
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm text-white shadow-sm ${
                                disc.resolution_status === "APPROVED"
                                  ? "bg-green-500"
                                  : disc.resolution_status === "RETURNED"
                                    ? "bg-red-500"
                                    : disc.resolution_status === "HOLD"
                                      ? "bg-orange-500"
                                      : "bg-blue-500"
                              }`}
                            >
                              {disc.resolution_status === "APPROVED" && "✅ "}
                              {disc.resolution_status === "RETURNED" && "❌ "}
                              {disc.resolution_status === "HOLD" && "⏸️ "}
                              {disc.resolution_status === "RECOUNT" && "🔄 "}
                              Status: {disc.resolution_status}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {(!manifest.manifest_items ||
                manifest.manifest_items.length === 0) && (
                <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-gray-300 rounded-2xl bg-gray-50">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
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
