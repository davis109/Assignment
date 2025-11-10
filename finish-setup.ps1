Write-Host "`nFinishing setup..." -ForegroundColor Cyan

Write-Host "`nStarting PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d postgres
Start-Sleep -Seconds 15

Write-Host "`nPushing database schema..." -ForegroundColor Yellow
cd apps\api
npx prisma db push --skip-generate

Write-Host "`nSeeding database..." -ForegroundColor Yellow
npm run db:seed
cd ..\..

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "`nYour app is ready! Start with:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor Cyan
Write-Host "`nThen open: http://localhost:3000" -ForegroundColor Cyan
