import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    // Total Spend (YTD)
    const totalSpendResult = await prisma.invoice.aggregate({
      where: {
        issueDate: {
          gte: yearStart,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Total Invoices Processed
    const totalInvoices = await prisma.invoice.count();

    // Total Vendors
    const totalVendors = await prisma.vendor.count();

    // Documents Uploaded (using line items as proxy)
    const documentsUploaded = await prisma.lineItem.count();

    // Average Invoice Value
    const avgInvoiceResult = await prisma.invoice.aggregate({
      _avg: {
        totalAmount: true,
      },
    });

    // Additional metrics
    const pendingInvoices = await prisma.invoice.count({
      where: { status: "pending" },
    });

    const overdueInvoices = await prisma.invoice.count({
      where: { status: "overdue" },
    });

    const paidInvoices = await prisma.invoice.count({
      where: { status: "paid" },
    });

    // Total paid amount
    const totalPaidResult = await prisma.invoice.aggregate({
      _sum: {
        paidAmount: true,
      },
    });

    res.json({
      totalSpend: Number(totalSpendResult._sum.totalAmount || 0),
      invoiceCount: totalInvoices,
      vendorCount: totalVendors,
      averageInvoiceAmount: Number(avgInvoiceResult._avg.totalAmount || 0),
      documentsUploaded,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      totalPaid: Number(totalPaidResult._sum.paidAmount || 0),
      currency: "USD",
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

export { router as statsRouter };
