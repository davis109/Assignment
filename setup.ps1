# Invoice Analytics Platform - Component Generator
# This script generates all necessary frontend components and utilities

Write-Host "🚀 Generating Invoice Analytics Platform Components..." -ForegroundColor Cyan

# Create directory structure
$dirs = @(
    "apps\web\components\ui",
    "apps\web\components\layout",
    "apps\web\components\dashboard",
    "apps\web\components\chat",
    "apps\web\lib",
    "apps\web\hooks",
    "services\vanna",
    "data",
    "docs"
)

foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✓ Created $dir" -ForegroundColor Green
    }
}

Write-Host "`n📝 Component structure created!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run: npm install" -ForegroundColor White
Write-Host "2. Download Analytics_Test_Data.json to data/ folder" -ForegroundColor White
Write-Host "3. Create .env file (copy from .env.example)" -ForegroundColor White
Write-Host "4. Run: docker-compose up -d postgres" -ForegroundColor White
Write-Host "5. Run: cd apps\api && npm install && npx prisma generate && npx prisma db push && npm run db:seed" -ForegroundColor White
Write-Host "6. Run: npm run dev" -ForegroundColor White
Write-Host "`nFor detailed instructions, see SETUP.md" -ForegroundColor Cyan
