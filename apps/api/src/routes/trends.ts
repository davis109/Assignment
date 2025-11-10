import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Invoice trends (volume and value over time)
router.get("/", async (req: Request, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({
      select: {
        issueDate: true,
        totalAmount: true,
      },
      orderBy: {
        issueDate: "asc",
      },
    });

    // Group by month
    const monthlyData = new Map<string, { count: number; value: number }>();

    invoices.forEach((invoice) => {
      const date = new Date(invoice.issueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyData.get(monthKey) || { count: 0, value: 0 };
      monthlyData.set(monthKey, {
        count: existing.count + 1,
        value: existing.value + Number(invoice.totalAmount),
      });
    });

    const result = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        invoiceCount: data.count,
        totalAmount: data.value,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(result);
  } catch (error) {
    console.error("Error fetching invoice trends:", error);
    res.status(500).json({ error: "Failed to fetch invoice trends" });
  }
});

// Cash outflow forecast
router.get("/cash-outflow", async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const next90Days = new Date(today);
    next90Days.setDate(next90Days.getDate() + 90);

    const upcomingInvoices = await prisma.invoice.findMany({
      where: {
        dueDate: {
          gte: today,
          lte: next90Days,
        },
        status: {
          in: ["pending", "partial"],
        },
      },
      select: {
        dueDate: true,
        totalAmount: true,
        paidAmount: true,
      },
    });

    // Group by week
    const weeklyData = new Map<string, number>();

    upcomingInvoices.forEach((invoice) => {
      if (!invoice.dueDate) return;

      const date = new Date(invoice.dueDate);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      const balance = Number(invoice.totalAmount) - Number(invoice.paidAmount);
      const existing = weeklyData.get(weekKey) || 0;
      weeklyData.set(weekKey, existing + balance);
    });

    const result = Array.from(weeklyData.entries())
      .map(([week, amount]) => ({
        month: week,
        amount: amount,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(result);
  } catch (error) {
    console.error("Error fetching cash outflow:", error);
    res.status(500).json({ error: "Failed to fetch cash outflow forecast" });
  }
});

export { router as trendsRouter };
