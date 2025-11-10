import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Get top 10 vendors by spend
router.get("/top10", async (req: Request, res: Response) => {
  try {
    const vendorSpend = await prisma.invoice.groupBy({
      by: ["vendorId"],
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        _sum: {
          totalAmount: "desc",
        },
      },
      take: 10,
    });

    // Get vendor details
    const vendorIds = vendorSpend.map((v) => v.vendorId);
    const vendors = await prisma.vendor.findMany({
      where: {
        id: {
          in: vendorIds,
        },
      },
    });

    const vendorMap = new Map(vendors.map((v) => [v.id, v]));

    const result = vendorSpend.map((spend) => {
      const vendor = vendorMap.get(spend.vendorId);
      return {
        vendorId: spend.vendorId,
        vendorName: vendor?.name || "Unknown",
        totalSpend: Number(spend._sum.totalAmount || 0),
      };
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching top vendors:", error);
    res.status(500).json({ error: "Failed to fetch top vendors" });
  }
});

// Get all vendors with stats
router.get("/", async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        _count: {
          select: {
            invoices: true,
          },
        },
        invoices: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    const result = vendors.map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      invoiceCount: vendor._count.invoices,
      totalSpend: vendor.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

export { router as vendorsRouter };
