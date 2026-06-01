"use client";

import AnalyticsDashboard from "@/components/AnalyticsDashboard";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div className="px-4 md:px-8 py-4 md:py-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );
}
