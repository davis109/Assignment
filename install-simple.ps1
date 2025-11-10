Write-Host "Starting installation..." -ForegroundColor Cyan

Write-Host "`nStep 1: Installing root dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`nStep 2: Installing API dependencies..." -ForegroundColor Yellow
cd apps\api
npm install
cd ..\..

Write-Host "`nStep 3: Installing Web dependencies..." -ForegroundColor Yellow
cd apps\web
npm install
cd ..\..

Write-Host "`nStep 4: Setting up environment..." -ForegroundColor Yellow
if (!(Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "Created .env file" -ForegroundColor Green
}

Write-Host "`nStep 5: Starting PostgreSQL..." -ForegroundColor Yellow
docker-compose up -d postgres
Start-Sleep -Seconds 10

Write-Host "`nStep 6: Setting up database..." -ForegroundColor Yellow
cd apps\api
npx prisma generate
npx prisma db push
npm run db:seed
cd ..\..

Write-Host "`nInstallation Complete!" -ForegroundColor Green
Write-Host "`nNext: Run 'npm run dev' to start the app" -ForegroundColor Cyan
