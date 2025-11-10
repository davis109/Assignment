$line = "=" * 60
Write-Host "`n⚠️  Setup Status Report" -ForegroundColor Yellow
Write-Host $line -ForegroundColor Cyan

Write-Host "`n✅ COMPLETED:" -ForegroundColor Green
Write-Host "  • Root dependencies installed (598 packages)"
Write-Host "  • API dependencies installed"
Write-Host "  • Web dependencies installed"
Write-Host "  • .env file created with database configuration"
Write-Host "  • Prisma Client generated"

Write-Host "`n❌ ISSUE FOUND:" -ForegroundColor Red
Write-Host "  • Docker Desktop is not running"
Write-Host "    PostgreSQL container failed to start"

Write-Host "`n🔧 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Start Docker Desktop application"
Write-Host "  2. Wait for Docker to be fully running (green whale icon)"
Write-Host "  3. Run this command to finish setup:" -ForegroundColor White
Write-Host "     .\finish-setup.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host $line -ForegroundColor Cyan
