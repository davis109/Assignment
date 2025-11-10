"use client";

import { InvoicesTable } from "@/components/dashboard/invoices-table";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
        <p className="mt-2 text-gray-600">View and manage all your invoices</p>
      </div>

      <InvoicesTable />
    </div>
  );
}
