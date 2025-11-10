# 📊 Database Schema & ER Diagram

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│    VENDORS      │         │   CUSTOMERS     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │         │ id (PK)         │
│ name            │         │ name            │
│ email           │         │ email           │
│ phone           │         │ phone           │
│ address         │         │ address         │
│ tax_id          │         │ created_at      │
│ created_at      │         │ updated_at      │
│ updated_at      │         └─────────────────┘
└────────┬────────┘                  │
         │                           │
         │ 1                      1  │
         │                           │
         │ N                      N  │
         │                           │
    ┌────▼──────────────────────────▼────┐
    │          INVOICES                  │
    ├────────────────────────────────────┤
    │ id (PK)                            │
    │ invoice_number (UNIQUE)            │
    │ vendor_id (FK → vendors.id)        │
    │ customer_id (FK → customers.id)    │
    │ issue_date                         │
    │ due_date                           │
    │ total_amount                       │
    │ paid_amount                        │
    │ status                             │
    │ category                           │
    │ currency                           │
    │ tax_amount                         │
    │ discount_amount                    │
    │ notes                              │
    │ created_at                         │
    │ updated_at                         │
    └────┬──────────────────────┬────────┘
         │                      │
         │ 1                    │ 1
         │                      │
         │ N                    │ N
         │                      │
    ┌────▼─────────┐    ┌──────▼────────┐
    │ LINE_ITEMS   │    │   PAYMENTS    │
    ├──────────────┤    ├───────────────┤
    │ id (PK)      │    │ id (PK)       │
    │ invoice_id   │    │ invoice_id    │
    │ description  │    │ amount        │
    │ quantity     │    │ payment_date  │
    │ unit_price   │    │ payment_method│
    │ amount       │    │ reference_no  │
    │ category     │    │ notes         │
    │ created_at   │    │ created_at    │
    └──────────────┘    └───────────────┘

         ┌──────────────────┐
         │  CHAT_HISTORY    │
         ├──────────────────┤
         │ id (PK)          │
         │ query            │
         │ sql              │
         │ results (JSON)   │
         │ error            │
         │ created_at       │
         └──────────────────┘
```

## Tables

### 1. vendors

Stores vendor/supplier information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR | PRIMARY KEY | Unique identifier (CUID) |
| name | VARCHAR | NOT NULL | Vendor name |
| email | VARCHAR | - | Contact email |
| phone | VARCHAR | - | Contact phone |
| address | VARCHAR | - | Physical address |
| tax_id | VARCHAR | - | Tax identification number |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- One-to-Many with `invoices` (vendor_id)

**Indexes:**
- Primary key on `id`

---

### 2. customers

Stores customer/client information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR | PRIMARY KEY | Unique identifier (CUID) |
| name | VARCHAR | NOT NULL | Customer name |
| email | VARCHAR | - | Contact email |
| phone | VARCHAR | - | Contact phone |
| address | VARCHAR | - | Billing address |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- One-to-Many with `invoices` (customer_id)

**Indexes:**
- Primary key on `id`

---

### 3. invoices

Core table storing invoice headers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR | PRIMARY KEY | Unique identifier (CUID) |
| invoice_number | VARCHAR | UNIQUE, NOT NULL | Invoice number (e.g., INV-2024-0001) |
| vendor_id | VARCHAR | FK → vendors.id | Reference to vendor |
| customer_id | VARCHAR | FK → customers.id | Reference to customer |
| issue_date | TIMESTAMP | NOT NULL | Invoice issue date |
| due_date | TIMESTAMP | - | Payment due date |
| total_amount | DECIMAL(12,2) | NOT NULL | Total invoice amount |
| paid_amount | DECIMAL(12,2) | DEFAULT 0 | Amount already paid |
| status | VARCHAR | NOT NULL | pending, paid, overdue, partial |
| category | VARCHAR | - | Invoice category |
| currency | VARCHAR | DEFAULT 'USD' | Currency code |
| tax_amount | DECIMAL(12,2) | - | Tax amount |
| discount_amount | DECIMAL(12,2) | - | Discount applied |
| notes | TEXT | - | Additional notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

**Relationships:**
- Many-to-One with `vendors` (vendor_id)
- Many-to-One with `customers` (customer_id)
- One-to-Many with `line_items` (invoice_id)
- One-to-Many with `payments` (invoice_id)

**Indexes:**
- Primary key on `id`
- Unique index on `invoice_number`
- Index on `vendor_id`
- Index on `customer_id`
- Index on `status`
- Index on `issue_date`
- Index on `category`

**Status Values:**
- `pending` - Not yet paid
- `paid` - Fully paid
- `overdue` - Past due date, not paid
- `partial` - Partially paid

---

### 4. line_items

Individual items/services on an invoice.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR | PRIMARY KEY | Unique identifier (CUID) |
| invoice_id | VARCHAR | FK → invoices.id | Reference to invoice |
| description | VARCHAR | NOT NULL | Item description |
| quantity | DECIMAL(10,2) | NOT NULL | Quantity ordered |
| unit_price | DECIMAL(12,2) | NOT NULL | Price per unit |
| amount | DECIMAL(12,2) | NOT NULL | Total line amount |
| category | VARCHAR | - | Item category |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Relationships:**
- Many-to-One with `invoices` (invoice_id)

**Indexes:**
- Primary key on `id`
- Index on `invoice_id`

**Cascade:**
- ON DELETE CASCADE (deleted when invoice is deleted)

---

### 5. payments

Payment records for invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR | PRIMARY KEY | Unique identifier (CUID) |
| invoice_id | VARCHAR | FK → invoices.id | Reference to invoice |
| amount | DECIMAL(12,2) | NOT NULL | Payment amount |
| payment_date | TIMESTAMP | NOT NULL | Date payment received |
| payment_method | VARCHAR | NOT NULL | Payment method |
| reference_no | VARCHAR | - | Payment reference number |
| notes | TEXT | - | Payment notes |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

**Relationships:**
- Many-to-One with `invoices` (invoice_id)

**Indexes:**
- Primary key on `id`
- Index on `invoice_id`
- Index on `payment_date`

**Payment Methods:**
- `credit_card` - Credit card payment
- `bank_transfer` - Bank/wire transfer
- `check` - Check payment
- `cash` - Cash payment

**Cascade:**
- ON DELETE CASCADE (deleted when invoice is deleted)

---

### 6. chat_history

Stores chat query history for analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR | PRIMARY KEY | Unique identifier (CUID) |
| query | VARCHAR | NOT NULL | User's natural language query |
| sql | VARCHAR | - | Generated SQL query |
| results | TEXT | - | JSON-encoded query results |
| error | VARCHAR | - | Error message (if query failed) |
| created_at | TIMESTAMP | DEFAULT NOW() | Query timestamp |

**Indexes:**
- Primary key on `id`
- Index on `created_at`

---

## Data Flow

### Invoice Creation Flow

```
1. Create/Select Vendor → vendors
2. Create/Select Customer → customers
3. Create Invoice → invoices
4. Add Line Items → line_items
5. Record Payments → payments
```

### Query Flow (Chat with Data)

```
User Query → Vanna AI → Generated SQL → PostgreSQL
                ↓
          chat_history (saved for history)
                ↓
           Results → User
```

---

## Sample Queries

### Get Total Spend by Vendor

```sql
SELECT 
  v.name as vendor_name,
  SUM(i.total_amount) as total_spend,
  COUNT(i.id) as invoice_count
FROM vendors v
JOIN invoices i ON v.id = i.vendor_id
GROUP BY v.id, v.name
ORDER BY total_spend DESC
LIMIT 10;
```

### Get Overdue Invoices

```sql
SELECT 
  i.invoice_number,
  v.name as vendor,
  i.total_amount,
  i.due_date,
  i.total_amount - i.paid_amount as balance
FROM invoices i
JOIN vendors v ON i.vendor_id = v.id
WHERE i.status = 'overdue'
ORDER BY i.due_date;
```

### Monthly Revenue Trend

```sql
SELECT 
  DATE_TRUNC('month', issue_date) as month,
  COUNT(*) as invoice_count,
  SUM(total_amount) as total_revenue
FROM invoices
GROUP BY month
ORDER BY month DESC;
```

### Payment History for Invoice

```sql
SELECT 
  p.payment_date,
  p.amount,
  p.payment_method,
  p.reference_no
FROM payments p
WHERE p.invoice_id = 'invoice_id_here'
ORDER BY p.payment_date;
```

---

## Normalization

The database follows **Third Normal Form (3NF)**:

1. **1NF**: All columns contain atomic values
2. **2NF**: No partial dependencies (all non-key attributes depend on entire primary key)
3. **3NF**: No transitive dependencies (non-key attributes don't depend on other non-key attributes)

**Benefits:**
- Eliminates data redundancy
- Ensures data integrity
- Easier maintenance
- Efficient queries

---

## Constraints & Referential Integrity

### Foreign Keys

All foreign key relationships are enforced with:
- `ON DELETE CASCADE` for dependent records (line_items, payments)
- `ON DELETE RESTRICT` could be used for invoices → vendors (prevent deletion of vendor with invoices)

### Unique Constraints

- `invoices.invoice_number` - Ensures invoice numbers are unique

### Check Constraints (Future Enhancement)

```sql
ALTER TABLE invoices 
ADD CONSTRAINT check_amounts 
CHECK (total_amount >= 0 AND paid_amount >= 0 AND paid_amount <= total_amount);

ALTER TABLE line_items
ADD CONSTRAINT check_line_amounts
CHECK (quantity > 0 AND unit_price >= 0 AND amount >= 0);
```

---

## Performance Optimization

### Indexes

Current indexes:
- Primary keys (automatic)
- Foreign keys
- Frequently queried columns (status, dates, category)

### Potential Additions

```sql
-- Composite index for common query patterns
CREATE INDEX idx_invoices_vendor_status ON invoices(vendor_id, status);

-- Full-text search index
CREATE INDEX idx_invoices_search ON invoices USING GIN (to_tsvector('english', notes));
```

### Connection Pooling

Recommended for production:
- Use PgBouncer or similar
- Configure in DATABASE_URL: `?pgbouncer=true`

---

## Backup & Recovery

### Automated Backups

Most managed PostgreSQL services (Neon, Supabase, Railway) provide:
- Daily automated backups
- Point-in-time recovery
- Backup retention (7-30 days)

### Manual Backup

```bash
# Export full database
pg_dump -h host -U user -d dbname > backup.sql

# Export specific table
pg_dump -h host -U user -d dbname -t invoices > invoices_backup.sql

# Restore
psql -h host -U user -d dbname < backup.sql
```

---

## Future Enhancements

1. **Audit Trail Table**
   - Track all changes to invoices
   - User who made changes
   - Timestamp of changes

2. **Attachments Table**
   - Store invoice PDFs/documents
   - Link to cloud storage (S3, etc.)

3. **Recurring Invoices**
   - Template table for recurring invoices
   - Auto-generation schedule

4. **Multi-Currency Support**
   - Currency exchange rates table
   - Automatic conversion

5. **User Management**
   - Users table
   - Roles and permissions
   - Activity logs

---

This schema provides a solid foundation for the invoice analytics platform with room for future growth and enhancements.
