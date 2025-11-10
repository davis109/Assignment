import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Export data to CSV
router.post("/csv", async (req: Request, res: Response) => {
  try {
    const { type = "invoices", filters = {} } = req.body;

    let data: any[] = [];
    let headers: string[] = [];

    if (type === "invoices") {
      const invoices = await prisma.invoice.findMany({
        include: {
          vendor: true,
          customer: true,
        },
        orderBy: {
          issueDate: "desc",
        },
      });

      headers = [
        "Invoice Number",
        "Vendor",
        "Customer",
        "Issue Date",
        "Due Date",
        "Total Amount",
        "Paid Amount",
        "Balance",
        "Status",
        "Category",
      ];

      data = invoices.map((inv) => [
        inv.invoiceNumber,
        inv.vendor.name,
        inv.customer.name,
        inv.issueDate.toISOString().split("T")[0],
        inv.dueDate ? inv.dueDate.toISOString().split("T")[0] : "",
        Number(inv.totalAmount),
        Number(inv.paidAmount),
        Number(inv.totalAmount) - Number(inv.paidAmount),
        inv.status,
        inv.category || "",
      ]);
    } else if (type === "vendors") {
      const vendors = await prisma.vendor.findMany({
        include: {
          invoices: true,
        },
      });

      headers = ["Vendor Name", "Email", "Phone", "Total Invoices", "Total Spend"];

      data = vendors.map((vendor) => [
        vendor.name,
        vendor.email || "",
        vendor.phone || "",
        vendor.invoices.length,
        vendor.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
      ]);
    }

    // Generate CSV
    const csvRows = [headers.join(",")];
    data.forEach((row) => {
      csvRows.push(
        row
          .map((cell: any) => {
            const value = String(cell);
            // Escape quotes and wrap in quotes if contains comma
            if (value.includes(",") || value.includes('"') || value.includes("\n")) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      );
    });

    const csv = csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${type}-export.csv"`);
    res.send(csv);
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
});

export { router as exportRouter };
