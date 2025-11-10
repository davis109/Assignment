"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DollarSign, FileText, Users, TrendingUp } from "lucide-react";
import { AnimatedStatCard } from "./animated-stat-card";

interface Stats {
  totalSpend: number;
  totalInvoices: number;
  totalVendors: number;
  documentsUploaded: number;
}

export function StatsCardsEnhanced() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 bg-gray-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <AnimatedStatCard
        title="Total Spend"
        value={formatCurrency(stats.totalSpend)}
        icon={DollarSign}
        trend={12.5}
        delay={0}
        gradient="from-blue-500 to-blue-600"
      />

      <AnimatedStatCard
        title="Total Invoices"
        value={stats.totalInvoices}
        icon={FileText}
        trend={8.2}
        delay={1}
        gradient="from-purple-500 to-purple-600"
      />

      <AnimatedStatCard
        title="Total Vendors"
        value={stats.totalVendors}
        icon={Users}
        trend={5.1}
        delay={2}
        gradient="from-green-500 to-green-600"
      />

      <AnimatedStatCard
        title="Documents Uploaded"
        value={stats.documentsUploaded}
        icon={TrendingUp}
        trend={-2.4}
        delay={3}
        gradient="from-orange-500 to-orange-600"
      />
    </div>
  );
}
