import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function generateMoreInvoices() {
  console.log("🌱 Generating additional invoice data...");

  const vendors = await prisma.vendor.findMany();
  const customers = await prisma.customer.findMany();

  if (vendors.length === 0 || customers.length === 0) {
    console.log("❌ No vendors or customers found. Run the main seed first.");
    return;
  }

  const categories = ["Software", "Hardware", "Services", "Consulting", "Maintenance", "Licenses"];
  const statuses = ["paid", "pending", "partial"];

  const invoices = [];
  const now = new Date();

  // Generate 20 more invoices over the past 6 months
  for (let i = 0; i < 20; i++) {
    const monthsAgo = Math.floor(Math.random() * 6);
    const issueDate = new Date(now);
    issueDate.setMonth(issueDate.getMonth() - monthsAgo);
    issueDate.setDate(Math.floor(Math.random() * 28) + 1);

    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const totalAmount = Math.floor(Math.random() * 50000) + 5000;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paidAmount = status === "paid" ? totalAmount : status === "partial" ? Math.floor(totalAmount * 0.5) : 0;

    invoices.push({
      invoiceNumber: `INV-2024-${String(i + 4).padStart(4, "0")}`,
      vendorId: vendors[Math.floor(Math.random() * vendors.length)].id,
      customerId: customers[Math.floor(Math.random() * customers.length)].id,
      issueDate,
      dueDate,
      totalAmount,
      paidAmount,
      status,
      category: categories[Math.floor(Math.random() * categories.length)],
      currency: "USD",
      taxAmount: totalAmount * 0.1,
      discountAmount: 0,
    });
  }

  // Create invoices
  for (const invoiceData of invoices) {
    await prisma.invoice.create({
      data: invoiceData,
    });
  }

  console.log(`✅ Created ${invoices.length} additional invoices`);
  console.log("\n📈 Seed Summary:");
  console.log(`  Total Invoices: ${await prisma.invoice.count()}`);
  console.log(`  Total Vendors: ${await prisma.vendor.count()}`);
  console.log(`  Total Customers: ${await prisma.customer.count()}`);
}

generateMoreInvoices()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
