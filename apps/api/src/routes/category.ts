import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const categorySpend = await prisma.invoice.groupBy({
      by: ["category"],
      _sum: {
        totalAmount: true,
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _sum: {
          totalAmount: "desc",
        },
      },
    });

    const result = categorySpend
      .filter((cat) => cat.category !== null)
      .map((cat) => ({
        category: cat.category || "Uncategorized",
        totalSpend: Number(cat._sum.totalAmount || 0),
        invoiceCount: cat._count._all,
      }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching category spend:", error);
    res.status(500).json({ error: "Failed to fetch category spend" });
  }
});

export { router as categoryRouter };
