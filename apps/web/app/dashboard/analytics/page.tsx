"use client";

import { StatsCardsEnhanced } from "@/components/dashboard/stats-cards-enhanced";
import { InvoiceTrendsChart } from "@/components/dashboard/invoice-trends-chart";
import { VendorSpendChart } from "@/components/dashboard/vendor-spend-chart";
import { CategorySpendChart } from "@/components/dashboard/category-spend-chart";
import { CashOutflowChart } from "@/components/dashboard/cash-outflow-chart";
import { InvoicesTable } from "@/components/dashboard/invoices-table";

export default function AnalyticsPage() {
  return (
    <>
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      </div>
      <div className="relative space-y-8 px-4 py-8">
        {/* Header with gradient text */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            Analytics Dashboard
          </h1>
          <p className="mt-4 text-lg text-gray-300">Real-time invoice analytics and insights</p>
        </div>

        {/* Stats Cards */}
        <StatsCardsEnhanced />

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="transform transition-all duration-500 hover:scale-[1.02]">
            <InvoiceTrendsChart />
          </div>
          <div className="transform transition-all duration-500 hover:scale-[1.02]">
            <VendorSpendChart />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="transform transition-all duration-500 hover:scale-[1.02]">
            <CategorySpendChart />
          </div>
          <div className="transform transition-all duration-500 hover:scale-[1.02]">
            <CashOutflowChart />
          </div>
        </div>

        {/* Invoices Table */}
        <div className="transform transition-all duration-500 hover:scale-[1.01]">
          <InvoicesTable />
        </div>
      </div>
    </>
  );
}

