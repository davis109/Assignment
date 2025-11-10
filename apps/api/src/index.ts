import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import { statsRouter } from "./routes/stats";
import { invoicesRouter } from "./routes/invoices";
import { vendorsRouter } from "./routes/vendors";
import { categoryRouter } from "./routes/category";
import { trendsRouter } from "./routes/trends";
import { chatRouter } from "./routes/chat";
import { exportRouter } from "./routes/export";
import { healthRouter } from "./routes/health";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Disable helmet for Vercel
if (process.env.NODE_ENV !== "production") {
  app.use(helmet());
}
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/health", healthRouter);
app.use("/api/stats", statsRouter);
app.use("/api/invoices", invoicesRouter);
app.use("/api/vendors", vendorsRouter);
app.use("/api/category-spend", categoryRouter);
app.use("/api/invoice-trends", trendsRouter);
app.use("/api/cash-outflow", trendsRouter);
app.use("/api/chat-with-data", chatRouter);
app.use("/api/export", exportRouter);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
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
      export: "/api/export/csv",
    },
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
