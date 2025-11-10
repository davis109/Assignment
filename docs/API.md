# 📚 API Documentation

## Base URL

- **Development**: `http://localhost:3001/api`
- **Production**: `https://your-app.vercel.app/api`

## Authentication

Currently, the API does not require authentication. In production, implement JWT or API key authentication.

## Endpoints

### Health Check

**GET** `/health`

Check if the API is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-08T12:00:00.000Z",
  "uptime": 12345.67
}
```

---

### Dashboard Statistics

**GET** `/stats`

Get overview statistics for the dashboard.

**Response:**
```json
{
  "totalSpend": 245678.50,
  "totalInvoices": 156,
  "documentsUploaded": 423,
  "averageInvoiceValue": 1575.50,
  "pendingInvoices": 23,
  "overdueInvoices": 5,
  "paidInvoices": 128,
  "totalPaid": 198456.75,
  "currency": "USD",
  "lastUpdated": "2024-11-08T12:00:00.000Z"
}
```

---

### Invoice Trends

**GET** `/invoice-trends`

Get monthly invoice volume and value trends.

**Response:**
```json
[
  {
    "month": "2024-01",
    "invoiceCount": 45,
    "totalValue": 67890.50
  },
  {
    "month": "2024-02",
    "invoiceCount": 52,
    "totalValue": 78456.25
  }
]
```

---

### Top Vendors

**GET** `/vendors/top10`

Get top 10 vendors by total spend.

**Response:**
```json
[
  {
    "vendorId": "clx123abc",
    "vendorName": "Acme Corporation",
    "totalSpend": 125678.50
  },
  {
    "vendorId": "clx456def",
    "vendorName": "Cloud Services Ltd",
    "totalSpend": 98765.25
  }
]
```

---

### Category Spend

**GET** `/category-spend`

Get spend breakdown by category.

**Response:**
```json
[
  {
    "category": "Software",
    "totalSpend": 145678.50,
    "invoiceCount": 45
  },
  {
    "category": "Cloud Services",
    "totalSpend": 98765.25,
    "invoiceCount": 32
  }
]
```

---

### Cash Outflow Forecast

**GET** `/cash-outflow`

Get upcoming cash outflow forecast (next 90 days).

**Response:**
```json
[
  {
    "week": "2024-11-10",
    "expectedOutflow": 25678.50
  },
  {
    "week": "2024-11-17",
    "expectedOutflow": 34567.25
  }
]
```

---

### List Invoices

**GET** `/invoices`

Get paginated list of invoices with optional filters.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10) - Items per page
- `search` (string) - Search by invoice number, vendor, or notes
- `status` (string) - Filter by status: `pending`, `paid`, `overdue`, `partial`
- `vendor` (string) - Filter by vendor name
- `sortBy` (string, default: `issueDate`) - Sort field
- `sortOrder` (string, default: `desc`) - Sort order: `asc` or `desc`

**Example Request:**
```
GET /invoices?page=1&limit=20&status=pending&search=acme
```

**Response:**
```json
{
  "data": [
    {
      "id": "clx123abc",
      "invoiceNumber": "INV-2024-0001",
      "vendor": "Acme Corporation",
      "vendorEmail": "billing@acme.com",
      "customer": "Tech Solutions Inc",
      "issueDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-02-14T00:00:00.000Z",
      "totalAmount": 15750.00,
      "paidAmount": 15750.00,
      "balance": 0,
      "status": "paid",
      "category": "Software",
      "currency": "USD",
      "lineItemsCount": 1,
      "paymentsCount": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

---

### Get Single Invoice

**GET** `/invoices/:id`

Get detailed information for a single invoice.

**Response:**
```json
{
  "id": "clx123abc",
  "invoiceNumber": "INV-2024-0001",
  "vendorId": "clx789ghi",
  "customerId": "clx456def",
  "issueDate": "2024-01-15T00:00:00.000Z",
  "dueDate": "2024-02-14T00:00:00.000Z",
  "totalAmount": 15750.00,
  "paidAmount": 15750.00,
  "status": "paid",
  "category": "Software",
  "currency": "USD",
  "taxAmount": 1575.00,
  "discountAmount": 0,
  "notes": "Annual software license renewal",
  "vendor": {
    "id": "clx789ghi",
    "name": "Acme Corporation",
    "email": "billing@acme.com",
    "phone": "+1-555-0100"
  },
  "customer": {
    "id": "clx456def",
    "name": "Tech Solutions Inc",
    "email": "ap@techsolutions.com"
  },
  "lineItems": [
    {
      "id": "clx111aaa",
      "description": "Enterprise Software License - Annual",
      "quantity": 10,
      "unitPrice": 1500.00,
      "amount": 15000.00,
      "category": "Software"
    }
  ],
  "payments": [
    {
      "id": "clx222bbb",
      "amount": 15750.00,
      "paymentDate": "2024-02-10T00:00:00.000Z",
      "paymentMethod": "bank_transfer",
      "referenceNo": "TXN-2024-0001"
    }
  ]
}
```

---

### Chat with Data

**POST** `/chat-with-data`

Send natural language query to get SQL and results.

**Request Body:**
```json
{
  "query": "What is the total spend in the last 90 days?"
}
```

**Response:**
```json
{
  "query": "What is the total spend in the last 90 days?",
  "sql": "SELECT SUM(total_amount) as total_spend FROM invoices WHERE issue_date >= NOW() - INTERVAL '90 days'",
  "results": [
    {
      "total_spend": 145678.50
    }
  ],
  "metadata": {
    "rows_returned": 1,
    "question": "What is the total spend in the last 90 days?"
  }
}
```

**Error Response (Vanna AI unavailable):**
```json
{
  "error": "Vanna AI service unavailable",
  "message": "Please ensure the Vanna AI service is running",
  "details": "Connection refused"
}
```

---

### Get Chat History

**GET** `/chat-with-data/history?limit=20`

Get recent chat query history.

**Response:**
```json
[
  {
    "id": "clx333ccc",
    "query": "What is the total spend?",
    "sql": "SELECT SUM(total_amount) FROM invoices",
    "results": [{ "sum": 245678.50 }],
    "error": null,
    "createdAt": "2024-11-08T12:00:00.000Z"
  }
]
```

---

### Export to CSV

**POST** `/export/csv`

Export data to CSV format.

**Request Body:**
```json
{
  "type": "invoices",
  "filters": {}
}
```

**Parameters:**
- `type` (string): `"invoices"` or `"vendors"`
- `filters` (object): Optional filters (not yet implemented)

**Response:**
CSV file download with appropriate headers.

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "message": "Optional detailed message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable (Vanna AI)

---

## Rate Limiting

Currently not implemented. In production, consider:
- Rate limiting per IP
- API key authentication
- Request throttling

---

## CORS

Configured to allow requests from:
- `http://localhost:3000` (frontend dev)
- Production frontend URL

---

## Development

To test API endpoints locally:

```bash
# Using curl
curl http://localhost:3001/api/stats

# Using httpie
http GET localhost:3001/api/stats

# Using browser
http://localhost:3001/api/stats
```

---

## Production Considerations

1. **Authentication**: Implement JWT or API keys
2. **Rate Limiting**: Add rate limiting middleware
3. **Caching**: Cache frequently accessed data
4. **Monitoring**: Add logging and monitoring
5. **Validation**: Strict input validation
6. **HTTPS**: Enforce HTTPS in production
7. **CORS**: Restrict CORS to known origins
