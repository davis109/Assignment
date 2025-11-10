import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

interface InvoiceData {
  invoice_number: string;
  vendor: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    tax_id?: string;
  };
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  issue_date: string;
  due_date?: string;
  total_amount: number;
  paid_amount?: number;
  status: string;
  category?: string;
  currency?: string;
  tax_amount?: number;
  discount_amount?: number;
  notes?: string;
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
    category?: string;
  }>;
  payments?: Array<{
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_no?: string;
    notes?: string;
  }>;
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.chatHistory.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.customer.deleteMany();

  // Load JSON data
  const dataPath = path.join(__dirname, "../../../data/Analytics_Test_Data.json");
  
  let invoicesData: InvoiceData[] = [];
  
  if (fs.existsSync(dataPath)) {
    console.log("📂 Loading data from Analytics_Test_Data.json...");
    const rawData = fs.readFileSync(dataPath, "utf-8");
    invoicesData = JSON.parse(rawData);
  } else {
    console.log("⚠️  Analytics_Test_Data.json not found. Creating sample data...");
    invoicesData = generateSampleData();
  }

  console.log(`📊 Processing ${invoicesData.length} invoices...`);

  const vendorMap = new Map<string, string>();
  const customerMap = new Map<string, string>();

  for (const data of invoicesData) {
    // Create or get vendor
    let vendorId = vendorMap.get(data.vendor.name);
    if (!vendorId) {
      const vendor = await prisma.vendor.create({
        data: {
          name: data.vendor.name,
          email: data.vendor.email,
          phone: data.vendor.phone,
          address: data.vendor.address,
          taxId: data.vendor.tax_id,
        },
      });
      vendorId = vendor.id;
      vendorMap.set(data.vendor.name, vendorId);
    }

    // Create or get customer
    let customerId = customerMap.get(data.customer.name);
    if (!customerId) {
      const customer = await prisma.customer.create({
        data: {
          name: data.customer.name,
          email: data.customer.email,
          phone: data.customer.phone,
          address: data.customer.address,
        },
      });
      customerId = customer.id;
      customerMap.set(data.customer.name, customerId);
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: data.invoice_number,
        vendorId,
        customerId,
        issueDate: new Date(data.issue_date),
        dueDate: data.due_date ? new Date(data.due_date) : null,
        totalAmount: data.total_amount,
        paidAmount: data.paid_amount || 0,
        status: data.status,
        category: data.category,
        currency: data.currency || "USD",
        taxAmount: data.tax_amount,
        discountAmount: data.discount_amount,
        notes: data.notes,
        lineItems: {
          create: data.line_items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            amount: item.amount,
            category: item.category,
          })),
        },
        payments: data.payments
          ? {
              create: data.payments.map((payment) => ({
                amount: payment.amount,
                paymentDate: new Date(payment.payment_date),
                paymentMethod: payment.payment_method,
                referenceNo: payment.reference_no,
                notes: payment.notes,
              })),
            }
          : undefined,
      },
    });

    console.log(`✅ Created invoice: ${invoice.invoiceNumber}`);
  }

  const stats = {
    vendors: await prisma.vendor.count(),
    customers: await prisma.customer.count(),
    invoices: await prisma.invoice.count(),
    lineItems: await prisma.lineItem.count(),
    payments: await prisma.payment.count(),
  };

  console.log("\n📈 Seed Summary:");
  console.log(`  Vendors: ${stats.vendors}`);
  console.log(`  Customers: ${stats.customers}`);
  console.log(`  Invoices: ${stats.invoices}`);
  console.log(`  Line Items: ${stats.lineItems}`);
  console.log(`  Payments: ${stats.payments}`);
  console.log("\n✨ Database seeded successfully!");
}

function generateSampleData(): InvoiceData[] {
  const vendors = [
    { name: "Acme Corp", email: "billing@acme.com", phone: "555-0100", address: "123 Main St", tax_id: "12-3456789" },
    { name: "TechSupply Inc", email: "invoices@techsupply.com", phone: "555-0200" },
    { name: "Office Solutions", email: "accounts@officesolutions.com", phone: "555-0300" },
    { name: "Cloud Services Ltd", email: "billing@cloudservices.com", phone: "555-0400" },
    { name: "Marketing Pro", email: "finance@marketingpro.com", phone: "555-0500" },
  ];

  const customers = [
    { name: "ABC Company", email: "ap@abc.com", phone: "555-1000", address: "456 Business Ave" },
    { name: "XYZ Enterprises", email: "payments@xyz.com", phone: "555-2000" },
  ];

  const categories = ["Software", "Hardware", "Services", "Consulting", "Marketing", "Office Supplies"];
  const statuses = ["paid", "pending", "overdue", "partial"];

  const invoices: InvoiceData[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const vendor = vendors[Math.floor(Math.random() * vendors.length)];
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const lineItemCount = Math.floor(Math.random() * 3) + 1;
    const lineItems = Array.from({ length: lineItemCount }, (_, j) => {
      const quantity = Math.floor(Math.random() * 10) + 1;
      const unitPrice = Math.floor(Math.random() * 500) + 50;
      return {
        description: `${category} Item ${j + 1}`,
        quantity,
        unit_price: unitPrice,
        amount: quantity * unitPrice,
        category,
      };
    });

    const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = totalAmount * 0.1;
    const grandTotal = totalAmount + taxAmount;
    
    const issueDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 30);

    let paidAmount = 0;
    const payments: InvoiceData["payments"] = [];
    
    if (status === "paid") {
      paidAmount = grandTotal;
      payments.push({
        amount: grandTotal,
        payment_date: new Date(dueDate.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: ["credit_card", "bank_transfer", "check"][Math.floor(Math.random() * 3)],
        reference_no: `PAY-${i}-${Date.now()}`,
      });
    } else if (status === "partial") {
      paidAmount = grandTotal * 0.5;
      payments.push({
        amount: paidAmount,
        payment_date: new Date(dueDate.getTime() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
        payment_method: "bank_transfer",
      });
    }

    invoices.push({
      invoice_number: `INV-2024-${String(i).padStart(4, "0")}`,
      vendor,
      customer,
      issue_date: issueDate.toISOString(),
      due_date: dueDate.toISOString(),
      total_amount: grandTotal,
      paid_amount: paidAmount,
      status,
      category,
      currency: "USD",
      tax_amount: taxAmount,
      line_items: lineItems,
      payments: payments.length > 0 ? payments : undefined,
    });
  }

  return invoices;
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
