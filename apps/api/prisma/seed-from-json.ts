import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database from Analytics_Test_Data.json...");

  // Read the JSON file
  const jsonPath = path.join(__dirname, "../../../Analytics_Test_Data.json");
  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const documents = JSON.parse(rawData);

  console.log(`📄 Found ${documents.length} documents to process`);

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.chatHistory.deleteMany();

  // Maps to track unique vendors and customers
  const vendorMap = new Map<string, string>();
  const customerMap = new Map<string, string>();

  let processedCount = 0;
  let skippedCount = 0;

  for (const doc of documents) {
    try {
      // Skip if no extracted data or not processed
      if (!doc.extractedData?.llmData || doc.status !== "processed") {
        skippedCount++;
        continue;
      }

      const data = doc.extractedData.llmData;

      // Extract vendor info
      const vendorName = data.vendor?.value?.vendorName?.value || "Unknown Vendor";
      const vendorEmail = `${vendorName.toLowerCase().replace(/\s+/g, ".")}@example.com`;
      const vendorAddress = data.vendor?.value?.vendorAddress?.value || "";
      const vendorTaxId = data.vendor?.value?.vendorTaxId?.value || "";

      // Get or create vendor
      let vendorId = vendorMap.get(vendorName);
      if (!vendorId) {
        const vendor = await prisma.vendor.create({
          data: {
            name: vendorName,
            email: vendorEmail,
            phone: "",
            address: vendorAddress,
            taxId: vendorTaxId,
          },
        });
        vendorId = vendor.id;
        vendorMap.set(vendorName, vendorId);
        console.log(`✅ Created vendor: ${vendorName}`);
      }

      // Extract customer info
      const customerName = data.customer?.value?.customerName?.value || "Unknown Customer";
      const customerEmail = `${customerName.toLowerCase().replace(/\s+/g, ".")}@example.com`;
      const customerAddress = data.customer?.value?.customerAddress?.value || "";

      // Get or create customer
      let customerId = customerMap.get(customerName);
      if (!customerId) {
        const customer = await prisma.customer.create({
          data: {
            name: customerName,
            email: customerEmail,
            phone: "",
            address: customerAddress,
          },
        });
        customerId = customer.id;
        customerMap.set(customerName, customerId);
        console.log(`✅ Created customer: ${customerName}`);
      }

      // Extract invoice data
      const invoiceNumber = data.invoice?.value?.invoiceId?.value || `INV-${doc._id.substring(0, 8)}`;
      const invoiceDateStr = data.invoice?.value?.invoiceDate?.value;
      const invoiceDate = invoiceDateStr ? new Date(invoiceDateStr) : new Date(doc.createdAt.$date);
      
      // Calculate due date (30 days from invoice date)
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);

      const totalAmount = Math.abs(data.summary?.value?.invoiceTotal?.value || 0);
      const subTotal = Math.abs(data.summary?.value?.subTotal?.value || 0);
      const totalTax = Math.abs(data.summary?.value?.totalTax?.value || 0);

      // Determine status based on current date and due date
      const now = new Date();
      let status = "pending";
      if (Math.random() > 0.5) {
        status = "paid";
      } else if (now > dueDate) {
        status = "overdue";
      }

      // Determine category from line items
      const lineItems = data.lineItems?.value?.items?.value || [];
      const categories = ["Software", "Hardware", "Services", "Consulting", "Maintenance", "Licenses"];
      const category = categories[Math.floor(Math.random() * categories.length)];

      // Create invoice
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          vendorId,
          customerId,
          issueDate: invoiceDate,
          dueDate,
          totalAmount,
          paidAmount: status === "paid" ? totalAmount : (status === "partial" ? totalAmount * 0.5 : 0),
          status,
          category,
          currency: "EUR",
          taxAmount: totalTax,
          notes: doc.metadata?.description || "",
        },
      });

      console.log(`✅ Created invoice: ${invoiceNumber} - €${totalAmount.toFixed(2)}`);

      // Create line items
      if (Array.isArray(lineItems) && lineItems.length > 0) {
        for (const item of lineItems) {
          const description = item.description?.value || "Item";
          const quantity = Math.abs(item.quantity?.value || 1);
          const unitPrice = Math.abs(item.unitPrice?.value || 0);
          const amount = Math.abs(item.totalPrice?.value || unitPrice * quantity);

          await prisma.lineItem.create({
            data: {
              invoiceId: invoice.id,
              description,
              quantity,
              unitPrice,
              amount,
            },
          });
        }
      } else {
        // Create a single line item if none exist
        await prisma.lineItem.create({
          data: {
            invoiceId: invoice.id,
            description: category,
            quantity: 1,
            unitPrice: subTotal,
            amount: subTotal,
          },
        });
      }

      // Create payment record if paid
      if (status === "paid") {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: totalAmount,
            paymentDate: new Date(invoiceDate.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000), // Random date within 20 days
            paymentMethod: ["bank_transfer", "credit_card", "check"][Math.floor(Math.random() * 3)],
          },
        });
      }

      processedCount++;
    } catch (error) {
      console.error(`❌ Error processing document ${doc._id}:`, error);
      skippedCount++;
    }
  }

  console.log("\n📈 Seed Summary:");
  console.log(`   ✅ Processed: ${processedCount} invoices`);
  console.log(`   ⏭️  Skipped: ${skippedCount} documents`);
  console.log(`   👥 Vendors: ${vendorMap.size}`);
  console.log(`   🏢 Customers: ${customerMap.size}`);

  // Show totals
  const stats = await prisma.invoice.aggregate({
    _sum: { totalAmount: true },
    _count: true,
  });

  console.log(`   💰 Total Amount: €${stats._sum.totalAmount?.toFixed(2) || 0}`);
  console.log(`   📊 Total Invoices: ${stats._count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
