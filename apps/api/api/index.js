const express = require("express");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const { PrismaClient } = require("@prisma/client");

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set!");
}

const prisma = new PrismaClient({
  log: ["error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const app = express();

// Middleware
app.use(compression());
app.use(morgan("combined"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// Stats endpoint
app.get("/api/stats", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    const [totalSpendResult, totalInvoices, totalVendors, documentsUploaded] = await Promise.all([
      prisma.invoice.aggregate({
        where: { issueDate: { gte: yearStart } },
        _sum: { totalAmount: true },
      }),
      prisma.invoice.count(),
      prisma.vendor.count(),
      prisma.lineItem.count(),
    ]);

    res.json({
      totalSpend: Number(totalSpendResult._sum.totalAmount || 0),
      totalInvoices,
      totalVendors,
      documentsUploaded,
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Invoices endpoint
app.get("/api/invoices", async (req, res) => {
  try {
    const { page = "1", limit = "10", status, search } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: "insensitive" } },
        { vendor: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { vendor: true, customer: true },
        orderBy: { issueDate: "desc" },
        skip,
        take: limitNum,
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({
      data: invoices.map((inv) => ({
        ...inv,
        totalAmount: Number(inv.totalAmount),
        paidAmount: Number(inv.paidAmount),
        taxAmount: inv.taxAmount ? Number(inv.taxAmount) : null,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Invoices error:", error);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Top vendors
app.get("/api/vendors/top10", async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        invoices: {
          select: { totalAmount: true },
        },
      },
    });

    const vendorsWithTotal = vendors
      .map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        totalSpend: vendor.invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0),
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    res.json(vendorsWithTotal);
  } catch (error) {
    console.error("Vendors error:", error);
    res.status(500).json({ error: "Failed to fetch vendors" });
  }
});

// Category spend
app.get("/api/category-spend", async (req, res) => {
  try {
    const invoices = await prisma.invoice.groupBy({
      by: ["category"],
      _sum: { totalAmount: true },
      _count: { id: true },
    });

    res.json(
      invoices.map((item) => ({
        category: item.category,
        totalSpend: Number(item._sum.totalAmount || 0),
        count: item._count.id,
      }))
    );
  } catch (error) {
    console.error("Category error:", error);
    res.status(500).json({ error: "Failed to fetch category data" });
  }
});

// Invoice trends
app.get("/api/invoice-trends", async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      select: { issueDate: true, totalAmount: true },
      orderBy: { issueDate: "asc" },
    });

    const monthlyData = {};
    invoices.forEach((inv) => {
      const month = inv.issueDate.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { month, totalAmount: 0, count: 0 };
      }
      monthlyData[month].totalAmount += Number(inv.totalAmount);
      monthlyData[month].count += 1;
    });

    res.json(Object.values(monthlyData));
  } catch (error) {
    console.error("Trends error:", error);
    res.status(500).json({ error: "Failed to fetch trends" });
  }
});

// Cash outflow forecast
app.get("/api/cash-outflow", async (req, res) => {
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
    const weeklyData = new Map();

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
    console.error("Cash outflow error:", error);
    res.status(500).json({ error: "Failed to fetch cash outflow forecast" });
  }
});

// Chat with data endpoint
app.post("/api/chat-with-data", async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY not configured" });
    }

    const DATABASE_SCHEMA = `You are a SQL expert. Generate PostgreSQL queries for an invoice analytics database with this schema:

Tables:
1. vendors (id, name, email, phone, address, tax_id)
2. customers (id, name, email, phone, address)
3. invoices (id, invoice_number, vendor_id, customer_id, issue_date, due_date, total_amount, paid_amount, status, category, currency, tax_amount, notes)
4. line_items (id, invoice_id, description, quantity, unit_price, amount)
5. payments (id, invoice_id, amount, payment_date, payment_method)

Rules:
- Only generate SQL queries, no explanations
- Use proper PostgreSQL syntax
- Join tables when needed for complete information
- Return the SQL query wrapped in \`\`\`sql code blocks`;

    // Call Groq API to generate SQL
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: DATABASE_SCHEMA },
          { role: "user", content: `Generate a SQL query for: ${query}` }
        ],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.json();
      console.error("Groq API error:", errorData);
      return res.status(500).json({ error: "AI service error" });
    }

    const groqData = await groqResponse.json();
    const sqlResponse = groqData.choices[0]?.message?.content || "";

    // Extract SQL from markdown code blocks
    let sql = sqlResponse;
    const sqlMatch = sqlResponse.match(/```sql\n([\s\S]*?)\n```/);
    if (sqlMatch) {
      sql = sqlMatch[1].trim();
    } else {
      sql = sqlResponse.replace(/```/g, '').trim();
    }

    // Execute the SQL query
    let results = [];
    try {
      results = await prisma.$queryRawUnsafe(sql);
    } catch (sqlError) {
      console.error("SQL execution error:", sqlError);
      return res.status(500).json({ 
        error: "SQL execution failed",
        sql: sql,
        details: sqlError.message 
      });
    }

    // Save to chat history
    try {
      await prisma.chatHistory.create({
        data: {
          query,
          sql,
          results: JSON.stringify(results),
        },
      });
    } catch (historyError) {
      console.error("Failed to save chat history:", historyError);
      // Don't fail the request if history save fails
    }

    res.json({
      answer: `Found ${results.length} result(s)`,
      query,
      sql,
      results,
      rowCount: results.length,
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Failed to process chat query" });
  }
});

// Chat history endpoint
app.get("/api/chat-with-data/history", async (req, res) => {
  try {
    const history = await prisma.chatHistory.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json(history);
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Invoice Analytics API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      stats: "/api/stats",
      invoices: "/api/invoices",
      vendors: "/api/vendors/top10",
      categorySpend: "/api/category-spend",
      invoiceTrends: "/api/invoice-trends",
      cashOutflow: "/api/cash-outflow",
      chatWithData: "/api/chat-with-data",
    },
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
