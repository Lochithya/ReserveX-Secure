# PowerShell script to restart the Spring Boot backend
# Run this from PowerShell: .\restart-backend.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ReserveX Backend Restart Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop any running backend process
Write-Host "Step 1: Stopping any running backend processes..." -ForegroundColor Yellow
$processes = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "Found running Java processes. Stopping..." -ForegroundColor Yellow
    $processes | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "✓ Stopped" -ForegroundColor Green
} else {
    Write-Host "✓ No running Java processes found" -ForegroundColor Green
}

Write-Host ""

# Clean build
Write-Host "Step 2: Cleaning previous build..." -ForegroundColor Yellow
& .\mvnw.cmd clean | Out-Null
Write-Host "✓ Clean complete" -ForegroundColor Green

Write-Host ""

# Compile
Write-Host "Step 3: Compiling new code..." -ForegroundColor Yellow
$compileOutput = & .\mvnw.cmd compile -DskipTests 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Compilation successful" -ForegroundColor Green
} else {
    Write-Host "✗ Compilation failed!" -ForegroundColor Red
    Write-Host $compileOutput
    exit 1
}

Write-Host ""

# Package
Write-Host "Step 4: Packaging application..." -ForegroundColor Yellow
$packageOutput = & .\mvnw.cmd package -DskipTests 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Package created" -ForegroundColor Green
} else {
    Write-Host "✗ Packaging failed!" -ForegroundColor Red
    Write-Host $packageOutput
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Now starting backend..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Run
& .\mvnw.cmd spring-boot:run
