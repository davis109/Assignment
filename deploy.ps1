# Invoice Analytics Platform - Quick Deploy Script
# Run this after setting up your database and environment variables

Write-Host "🚀 Invoice Analytics Platform - Deployment Script" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
} else {
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Pre-Deployment Checklist:" -ForegroundColor Cyan
Write-Host "  1. ✓ Have you created a PostgreSQL database? (Neon/Supabase/Railway)" -ForegroundColor White
Write-Host "  2. ✓ Have you updated environment variables?" -ForegroundColor White
Write-Host "  3. ✓ Have you pushed code to GitHub?" -ForegroundColor White
Write-Host ""

$response = Read-Host "Continue with deployment? (y/n)"
if ($response -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Step 1: Deploying Backend API..." -ForegroundColor Yellow
Set-Location apps/api
Write-Host "Running: vercel --prod" -ForegroundColor Gray
# Uncomment to deploy: vercel --prod
Write-Host "⚠️  Manual step: Run 'vercel --prod' in apps/api directory" -ForegroundColor Yellow

Write-Host ""
Write-Host "Step 2: Deploying Frontend..." -ForegroundColor Yellow
Set-Location ../web
Write-Host "Running: vercel --prod" -ForegroundColor Gray
# Uncomment to deploy: vercel --prod
Write-Host "⚠️  Manual step: Run 'vercel --prod' in apps/web directory" -ForegroundColor Yellow

Set-Location ../..

Write-Host ""
Write-Host "📝 Post-Deployment Steps:" -ForegroundColor Cyan
Write-Host "  1. Update NEXT_PUBLIC_API_BASE_URL in Vercel frontend settings" -ForegroundColor White
Write-Host "  2. Run database migrations:" -ForegroundColor White
Write-Host "     cd apps/api && npx prisma migrate deploy" -ForegroundColor Gray
Write-Host "  3. Seed database with data:" -ForegroundColor White
Write-Host "     npx tsx prisma/seed-from-json.ts" -ForegroundColor Gray
Write-Host "  4. Test all endpoints and chat functionality" -ForegroundColor White
Write-Host ""

Write-Host "✅ Deployment script complete!" -ForegroundColor Green
Write-Host "📚 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
