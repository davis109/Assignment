"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function SimpleAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getStats()
      .then(data => {
        console.log("Stats data:", data);
        setStats(data);
      })
      .catch(err => {
        console.error("Stats error:", err);
        setError(err.message);
      });
  }, []);

  return (
    <div className="p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-4">Simple Analytics</h1>
      
      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {stats && (
        <div className="space-y-4">
          <div className="bg-blue-100 p-4 rounded">
            <h2 className="font-bold">Total Spend</h2>
            <p className="text-2xl">${stats.totalSpend}</p>
          </div>
          
          <div className="bg-purple-100 p-4 rounded">
            <h2 className="font-bold">Total Invoices</h2>
            <p className="text-2xl">{stats.totalInvoices}</p>
          </div>
          
          <div className="bg-green-100 p-4 rounded">
            <h2 className="font-bold">Total Vendors</h2>
            <p className="text-2xl">{stats.totalVendors}</p>
          </div>
          
          <div className="bg-orange-100 p-4 rounded">
            <h2 className="font-bold">Documents Uploaded</h2>
            <p className="text-2xl">{stats.documentsUploaded}</p>
          </div>
        </div>
      )}

      {!stats && !error && <p>Loading...</p>}
    </div>
  );
}
