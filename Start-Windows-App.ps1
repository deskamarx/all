# AMAYA Executive Intelligence Hub - Windows PowerShell Launcher
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "     AMAYA INDUSTRIES - EXECUTIVE INTELLIGENCE HUB (WINDOWS)        " -ForegroundColor Yellow
Write-Host "====================================================================" -ForegroundColor Cyan

# Check for node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed or not in PATH. Please install from https://nodejs.org"
    Exit 1
}

# Install dependencies if missing
if (-not (Test-Path "node_modules")) {
    Write-Host "[*] Installing dependencies..." -ForegroundColor Green
    npm install
}

# Build and sync
Write-Host "[*] Ingesting Live Google Apps Script + Google Sheets Data..." -ForegroundColor Green
node scripts/build-data.js

Write-Host "[*] Building optimized frontend..." -ForegroundColor Green
npm run build

Write-Host "[*] Starting local full-stack server on http://localhost:3000..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

npm run start
