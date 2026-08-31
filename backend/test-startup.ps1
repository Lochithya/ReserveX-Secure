# Quick Backend Startup Test
# Tests if backend can compile and start without errors

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Backend Startup Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any running processes
Write-Host "[1/4] Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✓ Done" -ForegroundColor Green

# Step 2: Clean
Write-Host "[2/4] Cleaning..." -ForegroundColor Yellow
& .\mvnw.cmd clean 2>&1 | Out-Null
Write-Host "✓ Done" -ForegroundColor Green

# Step 3: Compile (this is where errors will show)
Write-Host "[3/4] Compiling..." -ForegroundColor Yellow
Write-Host "    (This will show any compilation errors)" -ForegroundColor Gray

$compileOutput = & .\mvnw.cmd compile 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Compilation successful!" -ForegroundColor Green
} else {
    Write-Host "✗ Compilation FAILED" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error output:" -ForegroundColor Red
    Write-Host $compileOutput
    Write-Host ""
    Write-Host "Please fix compilation errors before starting." -ForegroundColor Yellow
    exit 1
}

# Step 4: Quick validation
Write-Host "[4/4] Validating entities..." -ForegroundColor Yellow

$entityPath = "target\classes\com\reservex\backend\entity"

$entities = @(
    "Reservation.class",
    "ReservationStall.class",
    "Stall.class",
    "Exhibition.class"
)

$allFound = $true
foreach ($entity in $entities) {
    $fullPath = Join-Path $entityPath $entity
    if (Test-Path $fullPath) {
        Write-Host "  ✓ $entity" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $entity (MISSING)" -ForegroundColor Red
        $allFound = $false
    }
}

Write-Host ""

if ($allFound) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " All checks passed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Backend is ready to start." -ForegroundColor Green
    Write-Host ""
    Write-Host "To start backend, run:" -ForegroundColor Cyan
    Write-Host "  .\mvnw.cmd spring-boot:run" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host " Some entities missing!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check compilation errors above." -ForegroundColor Yellow
    exit 1
}
