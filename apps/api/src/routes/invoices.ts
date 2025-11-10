import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      status,
      vendor,
      sortBy = "issueDate",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search as string, mode: "insensitive" } },
        { vendor: { name: { contains: search as string, mode: "insensitive" } } },
        { notes: { contains: search as string, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (vendor) {
      where.vendor = {
        name: { contains: vendor as string, mode: "insensitive" },
      };
    }

    // Get total count
    const total = await prisma.invoice.count({ where });

    // Get invoices with relations
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
          },
        },
        lineItems: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            amount: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            paymentMethod: true,
          },
        },
      },
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder as "asc" | "desc",
      },
    });

    // Transform data
    const formattedInvoices = invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      vendor: invoice.vendor.name,
      vendorEmail: invoice.vendor.email,
      customer: invoice.customer.name,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      balance: Number(invoice.totalAmount) - Number(invoice.paidAmount),
      status: invoice.status,
      category: invoice.category,
      currency: invoice.currency,
      lineItemsCount: invoice.lineItems.length,
      paymentsCount: invoice.payments.length,
    }));

    res.json({
      data: formattedInvoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Get single invoice
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        vendor: true,
        customer: true,
        lineItems: true,
        payments: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.json({
      ...invoice,
      totalAmount: Number(invoice.totalAmount),
      paidAmount: Number(invoice.paidAmount),
      taxAmount: invoice.taxAmount ? Number(invoice.taxAmount) : null,
      discountAmount: invoice.discountAmount ? Number(invoice.discountAmount) : null,
      lineItems: invoice.lineItems.map((item) => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        amount: Number(item.amount),
      })),
      payments: invoice.payments.map((payment) => ({
        ...payment,
        amount: Number(payment.amount),
      })),
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

export { router as invoicesRouter };
