from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import vanna
from vanna.remote import VannaDefault

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Vanna AI Service",
    description="Natural language to SQL query service",
    version="1.0.0"
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Vanna AI with Groq
class VannaAI:
    def __init__(self):
        self.vn = None
        self.initialized = False
        
    def initialize(self):
        if self.initialized:
            return
            
        try:
            # Set up Groq API key
            groq_api_key = os.getenv("GROQ_API_KEY")
            if not groq_api_key:
                print("⚠️  GROQ_API_KEY not set. Using default model.")
            
            # Initialize Vanna with Groq
            from vanna.groq import Groq
            
            self.vn = Groq(
                api_key=groq_api_key,
                model="llama-3.1-70b-versatile"
            )
            
            # Connect to PostgreSQL
            database_url = os.getenv("DATABASE_URL")
            if database_url:
                # Convert psycopg format to standard PostgreSQL URL
                if database_url.startswith("postgresql+psycopg://"):
                    database_url = database_url.replace("postgresql+psycopg://", "postgresql://")
                
                self.vn.connect_to_postgres(url=database_url)
                print("✅ Connected to PostgreSQL database")
            
            # Train on schema (you can add more training data here)
            self._train_on_schema()
            
            self.initialized = True
            print("✅ Vanna AI initialized successfully")
            
        except Exception as e:
            print(f"❌ Error initializing Vanna AI: {e}")
            raise
    
    def _train_on_schema(self):
        """Train Vanna on the database schema"""
        try:
            # Document the database structure
            ddl_statements = [
                """
                CREATE TABLE vendors (
                    id VARCHAR PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    email VARCHAR,
                    phone VARCHAR,
                    address VARCHAR,
                    tax_id VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """,
                """
                CREATE TABLE customers (
                    id VARCHAR PRIMARY KEY,
                    name VARCHAR NOT NULL,
                    email VARCHAR,
                    phone VARCHAR,
                    address VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """,
                """
                CREATE TABLE invoices (
                    id VARCHAR PRIMARY KEY,
                    invoice_number VARCHAR UNIQUE NOT NULL,
                    vendor_id VARCHAR REFERENCES vendors(id),
                    customer_id VARCHAR REFERENCES customers(id),
                    issue_date TIMESTAMP NOT NULL,
                    due_date TIMESTAMP,
                    total_amount DECIMAL(12,2) NOT NULL,
                    paid_amount DECIMAL(12,2) DEFAULT 0,
                    status VARCHAR NOT NULL,
                    category VARCHAR,
                    currency VARCHAR DEFAULT 'USD',
                    tax_amount DECIMAL(12,2),
                    discount_amount DECIMAL(12,2),
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """,
                """
                CREATE TABLE line_items (
                    id VARCHAR PRIMARY KEY,
                    invoice_id VARCHAR REFERENCES invoices(id),
                    description VARCHAR NOT NULL,
                    quantity DECIMAL(10,2) NOT NULL,
                    unit_price DECIMAL(12,2) NOT NULL,
                    amount DECIMAL(12,2) NOT NULL,
                    category VARCHAR,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """,
                """
                CREATE TABLE payments (
                    id VARCHAR PRIMARY KEY,
                    invoice_id VARCHAR REFERENCES invoices(id),
                    amount DECIMAL(12,2) NOT NULL,
                    payment_date TIMESTAMP NOT NULL,
                    payment_method VARCHAR NOT NULL,
                    reference_no VARCHAR,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """
            ]
            
            for ddl in ddl_statements:
                self.vn.train(ddl=ddl)
            
            # Add some example questions and SQL pairs
            training_data = [
                {
                    "question": "What is the total spend this year?",
                    "sql": """
                    SELECT SUM(total_amount) as total_spend 
                    FROM invoices 
                    WHERE EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE);
                    """
                },
                {
                    "question": "Show me the top 10 vendors by spend",
                    "sql": """
                    SELECT v.name, SUM(i.total_amount) as total_spend
                    FROM vendors v
                    JOIN invoices i ON v.id = i.vendor_id
                    GROUP BY v.id, v.name
                    ORDER BY total_spend DESC
                    LIMIT 10;
                    """
                },
                {
                    "question": "List all pending invoices",
                    "sql": """
                    SELECT invoice_number, total_amount, issue_date, due_date
                    FROM invoices
                    WHERE status = 'pending'
                    ORDER BY due_date;
                    """
                },
                {
                    "question": "What are the overdue invoices?",
                    "sql": """
                    SELECT i.invoice_number, v.name as vendor, i.total_amount, i.due_date
                    FROM invoices i
                    JOIN vendors v ON i.vendor_id = v.id
                    WHERE i.status = 'overdue'
                    ORDER BY i.due_date;
                    """
                },
            ]
            
            for item in training_data:
                self.vn.train(question=item["question"], sql=item["sql"])
            
            print("✅ Schema and training data loaded")
            
        except Exception as e:
            print(f"⚠️  Error training schema: {e}")
    
    def generate_sql(self, question: str):
        """Generate SQL from natural language question"""
        if not self.initialized:
            self.initialize()
        
        try:
            sql = self.vn.generate_sql(question)
            return sql
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating SQL: {str(e)}")
    
    def run_query(self, sql: str):
        """Execute SQL query and return results"""
        if not self.initialized:
            self.initialize()
        
        try:
            df = self.vn.run_sql(sql)
            # Convert DataFrame to list of dicts
            results = df.to_dict(orient='records') if df is not None else []
            return results
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error executing query: {str(e)}")

# Global Vanna AI instance
vanna_ai = VannaAI()

# Request/Response models
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    sql: str
    results: list
    metadata: dict

# API Routes
@app.on_event("startup")
async def startup_event():
    """Initialize Vanna AI on startup"""
    try:
        vanna_ai.initialize()
    except Exception as e:
        print(f"⚠️  Could not initialize Vanna AI: {e}")

@app.get("/")
def read_root():
    return {
        "service": "Vanna AI",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "query": "/query",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "vanna_initialized": vanna_ai.initialized
    }

@app.post("/query", response_model=QueryResponse)
def query_data(request: QueryRequest):
    """
    Process natural language query and return SQL + results
    """
    try:
        # Generate SQL
        sql = vanna_ai.generate_sql(request.question)
        
        if not sql:
            raise HTTPException(status_code=400, detail="Could not generate SQL from question")
        
        # Execute query
        results = vanna_ai.run_query(sql)
        
        return QueryResponse(
            sql=sql,
            results=results,
            metadata={
                "rows_returned": len(results),
                "question": request.question
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    
    print(f"""
    🤖 Starting Vanna AI Service
    📍 Port: {port}
    🔗 Docs: http://localhost:{port}/docs
    """)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
