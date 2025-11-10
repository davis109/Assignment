# ⚡ COMPLETE SETUP SCRIPT
# Run this to set up the entire Invoice Analytics Platform

Write-Host "`n🚀 Invoice Analytics Platform - Complete Setup" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

# Check prerequisites
Write-Host "`n📋 Checking Prerequisites..." -ForegroundColor Yellow

# Check Node.js
$nodeVersion = $null
try {
    $nodeVersion = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "  ✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "  ✓ npm: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ npm not found" -ForegroundColor Red
    exit 1
}

# Check Python (optional for Vanna AI)
try {
    $pythonVersion = python --version
    Write-Host "  ✓ Python: $pythonVersion" -ForegroundColor Green
    $hasPython = $true
} catch {
    Write-Host "  ! Python not found (optional - needed for Chat feature)" -ForegroundColor Yellow
    $hasPython = $false
}

# Check Docker
try {
    docker --version | Out-Null
    Write-Host "  ✓ Docker installed" -ForegroundColor Green
    $hasDocker = $true
} catch {
    Write-Host "  ! Docker not found (optional - can use local PostgreSQL)" -ForegroundColor Yellow
    $hasDocker = $false
}

# Step 1: Install Dependencies
Write-Host "`n📦 Step 1: Installing Dependencies..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray

npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install root dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Root dependencies installed" -ForegroundColor Green

# Install API dependencies
Write-Host "  Installing API dependencies..." -ForegroundColor Gray
Set-Location apps\api
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install API dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ API dependencies installed" -ForegroundColor Green
Set-Location ..\..

# Install Web dependencies
Write-Host "  Installing Web dependencies..." -ForegroundColor Gray
Set-Location apps\web
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to install Web dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Web dependencies installed" -ForegroundColor Green
Set-Location ..\..

# Step 2: Environment Setup
Write-Host "`n⚙️  Step 2: Setting up Environment..." -ForegroundColor Yellow

if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "  ✓ Created .env file from .env.example" -ForegroundColor Green
    Write-Host "  ! Please edit .env with your configuration" -ForegroundColor Yellow
} else {
    Write-Host "  ✓ .env file already exists" -ForegroundColor Green
}

# Step 3: Database Setup
Write-Host "`n🗄️  Step 3: Setting up Database..." -ForegroundColor Yellow

if ($hasDocker) {
    Write-Host "  Starting PostgreSQL container..." -ForegroundColor Gray
    docker-compose up -d postgres
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ PostgreSQL container started" -ForegroundColor Green
        Write-Host "  Waiting for PostgreSQL to be ready..." -ForegroundColor Gray
        Start-Sleep -Seconds 10
        Write-Host "  ✓ PostgreSQL ready" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Failed to start PostgreSQL container" -ForegroundColor Red
        Write-Host "  Please check Docker is running and try again" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "  ! Docker not available" -ForegroundColor Yellow
    Write-Host "  Please ensure PostgreSQL is running manually" -ForegroundColor Yellow
    Write-Host "  Database should be: invoice_analytics" -ForegroundColor Yellow
    Write-Host "  Connection: postgresql://postgres:password@localhost:5432/invoice_analytics" -ForegroundColor Gray
}

# Generate Prisma Client
Write-Host "  Generating Prisma Client..." -ForegroundColor Gray
Set-Location apps\api
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Prisma client generated" -ForegroundColor Green

# Push schema to database
Write-Host "  Pushing schema to database..." -ForegroundColor Gray
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to push schema" -ForegroundColor Red
    Write-Host "  Please check your DATABASE_URL in .env" -ForegroundColor Yellow
    exit 1
}
Write-Host "  ✓ Database schema created" -ForegroundColor Green

# Seed database
Write-Host "  Seeding database with sample data..." -ForegroundColor Gray
npm run db:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ✗ Failed to seed database" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Database seeded successfully" -ForegroundColor Green

Set-Location ..\..

# Step 4: Vanna AI Setup (Optional)
Write-Host "`n🤖 Step 4: Vanna AI Setup (Optional)..." -ForegroundColor Yellow

if ($hasPython) {
    $setupVanna = Read-Host "  Would you like to set up Vanna AI for Chat feature? (y/n)"
    
    if ($setupVanna -eq "y" -or $setupVanna -eq "Y") {
        Write-Host "  Setting up Vanna AI..." -ForegroundColor Gray
        Set-Location services\vanna
        
        # Create virtual environment
        python -m venv venv
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Virtual environment created" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to create virtual environment" -ForegroundColor Red
            Set-Location ..\..
        }
        
        # Activate and install
        .\venv\Scripts\activate
        pip install -r requirements.txt
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ Vanna AI dependencies installed" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed to install Vanna dependencies" -ForegroundColor Red
        }
        
        # Create .env
        if (!(Test-Path .env)) {
            Copy-Item .env.example .env
            Write-Host "  ✓ Created Vanna .env file" -ForegroundColor Green
            Write-Host "  ! Please add your GROQ_API_KEY to services/vanna/.env" -ForegroundColor Yellow
            Write-Host "  Get your key from: https://console.groq.com" -ForegroundColor Cyan
        }
        
        Set-Location ..\..
    } else {
        Write-Host "  Skipping Vanna AI setup" -ForegroundColor Gray
        Write-Host "  You can set it up later by following: services/vanna/README.md" -ForegroundColor Yellow
    }
} else {
    Write-Host "  Python not available - skipping Vanna AI setup" -ForegroundColor Yellow
    Write-Host "  Install Python 3.11+ to enable Chat feature" -ForegroundColor Yellow
}

# Completion
Write-Host "`n✨ Setup Complete!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "`n📊 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review and edit .env if needed" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor Cyan
Write-Host "  3. Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Optional:" -ForegroundColor Yellow
Write-Host "  - View database: cd apps\api; npm run db:studio" -ForegroundColor White
Write-Host "  - Start Vanna AI: cd services\vanna; .\venv\Scripts\activate; python main.py" -ForegroundColor White

Write-Host "`n📚 Documentation:" -ForegroundColor Yellow
Write-Host "  - Quick Start: QUICKSTART.md" -ForegroundColor White
Write-Host "  - Full Guide: SETUP.md" -ForegroundColor White
Write-Host "  - API Docs: docs/API.md" -ForegroundColor White
Write-Host "  - Deployment: docs/DEPLOYMENT.md" -ForegroundColor White

Write-Host "`n🚀 Ready to build something amazing!" -ForegroundColor Green
Write-Host ""
