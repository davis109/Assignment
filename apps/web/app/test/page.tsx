"use client";

import { useEffect, useState } from "react";

export default function TestPage() {
  const [apiUrl, setApiUrl] = useState("");
  const [statsResult, setStatsResult] = useState("");
  const [vendorsResult, setVendorsResult] = useState("");
  const [trendsResult, setTrendsResult] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "NOT SET";
    setApiUrl(apiBase);
    
    // Test stats
    fetch(`${apiBase}/api/stats`)
      .then(res => res.json())
      .then(data => setStatsResult(JSON.stringify(data, null, 2)))
      .catch(err => setError(`Stats ERROR: ${err.message}`));

    // Test vendors
    fetch(`${apiBase}/api/vendors/top10`)
      .then(res => res.json())
      .then(data => setVendorsResult(JSON.stringify(data.slice(0, 2), null, 2)))
      .catch(err => setError(`Vendors ERROR: ${err.message}`));

    // Test trends
    fetch(`${apiBase}/api/invoice-trends`)
      .then(res => res.json())
      .then(data => setTrendsResult(JSON.stringify(data.slice(0, 2), null, 2)))
      .catch(err => setError(`Trends ERROR: ${err.message}`));
  }, []);

  return (
    <div className="p-8 space-y-4 bg-white text-black">
      <h1 className="text-2xl font-bold">API Debug Page</h1>
      
      <div>
        <p className="font-semibold">API URL:</p>
        <p className="text-sm bg-gray-100 p-2 rounded">{apiUrl}</p>
      </div>

      {error && (
        <div className="bg-red-100 p-4 rounded">
          <p className="font-semibold text-red-800">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div>
        <p className="font-semibold">Stats Result:</p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{statsResult || "Loading..."}</pre>
      </div>

      <div>
        <p className="font-semibold">Vendors Result (first 2):</p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{vendorsResult || "Loading..."}</pre>
      </div>

      <div>
        <p className="font-semibold">Trends Result (first 2):</p>
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">{trendsResult || "Loading..."}</pre>
      </div>
    </div>
  );
}
