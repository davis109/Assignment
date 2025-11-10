import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-np3rig1bq-davis109s-projects.vercel.app";

const axiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// API client with all methods
export const api = {
  // Stats
  getStats: async () => {
    const response = await axiosInstance.get("/stats");
    return response.data;
  },

  // Invoices
  getInvoices: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    vendor?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    const response = await axiosInstance.get("/invoices", { params });
    return response.data;
  },

  getInvoice: async (id: string) => {
    const response = await axiosInstance.get(`/invoices/${id}`);
    return response.data;
  },

  // Trends
  getInvoiceTrends: async () => {
    const response = await axiosInstance.get("/invoice-trends");
    return response.data;
  },

  getCashOutflow: async () => {
    const response = await axiosInstance.get("/cash-outflow");
    return response.data;
  },

  // Vendors
  getTopVendors: async () => {
    const response = await axiosInstance.get("/vendors/top10");
    return response.data;
  },

  // Categories
  getCategorySpend: async () => {
    const response = await axiosInstance.get("/category-spend");
    return response.data;
  },

  // Chat
  chatWithData: async (query: string) => {
    const response = await axiosInstance.post("/chat-with-data", { query });
    return response.data;
  },

  getChatHistory: async () => {
    const response = await axiosInstance.get("/chat-with-data/history");
    return response.data;
  },

  // Export
  exportToCSV: async (type: "invoices" | "vendors", filters?: any) => {
    const response = await axiosInstance.post(
      "/export/csv",
      { type, filters },
      {
        responseType: "blob",
      }
    );
    return response.data;
  },
};
