Write-Host "Checking Docker status..." -ForegroundColor Cyan

try {
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Docker is running!" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now run:" -ForegroundColor Yellow
        Write-Host "  .\finish-setup.ps1" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Docker is NOT running!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please start Docker Desktop and try again." -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "Docker is NOT installed or NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    Write-Host "  2. Start Docker Desktop"
    Write-Host "  3. Run this script again"
    Write-Host ""
}
