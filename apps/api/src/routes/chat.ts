import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Database schema context for Groq
const DATABASE_SCHEMA = `
You are a SQL expert. Generate PostgreSQL queries for an invoice analytics database with this schema:

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
- Return the SQL query wrapped in \`\`\`sql code blocks
`;

router.post("/", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY not configured");
    }

    try {
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
        throw new Error(`Groq API error: ${JSON.stringify(errorData)}`);
      }

      const groqData: any = await groqResponse.json();
      const sqlResponse = groqData.choices[0]?.message?.content || "";

      // Extract SQL from markdown code blocks
      let sql = sqlResponse;
      const sqlMatch = sqlResponse.match(/```sql\n([\s\S]*?)\n```/);
      if (sqlMatch) {
        sql = sqlMatch[1].trim();
      } else {
        // Try to extract any SQL-like content
        sql = sqlResponse.replace(/```/g, '').trim();
      }

      // Execute the SQL query
      let results: any[] = [];
      try {
        results = await prisma.$queryRawUnsafe(sql);
      } catch (sqlError: any) {
        console.error("SQL execution error:", sqlError);
        throw new Error(`SQL execution failed: ${sqlError.message}`);
      }

      // Save to chat history
      await prisma.chatHistory.create({
        data: {
          query,
          sql,
          results: JSON.stringify(results),
        },
      });

      res.json({
        query,
        sql,
        results,
        rowCount: results.length,
      });
    } catch (aiError: any) {
      console.error("AI processing error:", aiError);
      
      // Save error to history
      await prisma.chatHistory.create({
        data: {
          query,
          error: aiError.message,
        },
      });

      res.status(503).json({
        error: "AI service error",
        message: aiError.message,
      });
      return;
    }
  } catch (error: any) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Failed to process query", details: error.message });
  }
});

// Get chat history
router.get("/history", async (req: Request, res: Response) => {
  try {
    const { limit = "20" } = req.query;

    const history = await prisma.chatHistory.findMany({
      take: parseInt(limit as string),
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = history.map((item) => ({
      id: item.id,
      query: item.query,
      sql: item.sql,
      results: item.results ? JSON.parse(item.results) : null,
      error: item.error,
      createdAt: item.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

export { router as chatRouter };
