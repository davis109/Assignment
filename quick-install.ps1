# Invoice Analytics Platform - Quick Setup Script
Write-Host "`n🚀 Starting Installation..." -ForegroundColor Cyan

# Step 1: Install root dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 2: Install API dependencies
Write-Host "`n📦 Installing API dependencies..." -ForegroundColor Yellow
Set-Location apps\api
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install API dependencies" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}
Set-Location ..\..

# Step 3: Install Web dependencies
Write-Host "`n📦 Installing Web dependencies..." -ForegroundColor Yellow
Set-Location apps\web
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install Web dependencies" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}
Set-Location ..\..

# Step 4: Setup environment
Write-Host "`n⚙️  Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "  ✓ Created .env file" -ForegroundColor Green
}

# Step 5: Start database
Write-Host "`n🗄️  Starting PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d postgres
Start-Sleep -Seconds 10

# Step 6: Setup database
Write-Host "`n🗄️  Setting up database..." -ForegroundColor Yellow
Set-Location apps\api
npx prisma generate
npx prisma db push
npm run db:seed
Set-Location ..\..

Write-Host "`n✅ Installation Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run dev" -ForegroundColor Cyan
Write-Host "  2. Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
