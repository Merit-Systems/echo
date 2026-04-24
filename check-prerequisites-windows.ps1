# Echo Prerequisites Checker for Windows

Write-Host "=== Echo Prerequisites Verification ===" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check Node.js
Write-Host "Checking Node.js..." -NoNewline
$nodeInstalled = $false
try {
    $nodeCheck = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $nodeInstalled = $true
        Write-Host " OK $nodeCheck" -ForegroundColor Green
    }
} catch { }

if (-not $nodeInstalled) {
    Write-Host " MISSING" -ForegroundColor Red
    Write-Host "   Install from https://nodejs.org/" -ForegroundColor Yellow
    $allGood = $false
}

# Check pnpm
Write-Host "Checking pnpm..." -NoNewline
$pnpmInstalled = $false
try {
    $pnpmCheck = & pnpm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $pnpmInstalled = $true
        Write-Host " OK $pnpmCheck" -ForegroundColor Green
    }
} catch { }

if (-not $pnpmInstalled) {
    Write-Host " MISSING" -ForegroundColor Red
    Write-Host "   Run: npm install -g pnpm" -ForegroundColor Yellow
    $allGood = $false
}

# Check Docker
Write-Host "Checking Docker..." -NoNewline
$dockerInstalled = $false
try {
    $dockerCheck = & docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerInstalled = $true
        Write-Host " OK" -ForegroundColor Green
        
        # Check if Docker daemon is running
        Write-Host "Checking Docker daemon..." -NoNewline
        $daemonCheck = & docker ps 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " RUNNING" -ForegroundColor Green
        } else {
            Write-Host " NOT RUNNING" -ForegroundColor Red
            Write-Host "   Start Docker Desktop" -ForegroundColor Yellow
            $allGood = $false
        }
    }
} catch { }

if (-not $dockerInstalled) {
    Write-Host " MISSING" -ForegroundColor Red
    Write-Host "   Install from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    $allGood = $false
}

# Check Git
Write-Host "Checking Git..." -NoNewline
$gitInstalled = $false
try {
    $gitCheck = & git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $gitInstalled = $true
        Write-Host " OK" -ForegroundColor Green
    }
} catch { }

if (-not $gitInstalled) {
    Write-Host " MISSING" -ForegroundColor Red
    Write-Host "   Install from https://git-scm.com/download/win" -ForegroundColor Yellow
    $allGood = $false
}

Write-Host ""
if ($allGood) {
    Write-Host "All prerequisites met! You are ready to run Echo." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. pnpm install" -ForegroundColor White
    Write-Host "  2. cd packages\app\control" -ForegroundColor White
    Write-Host "  3. .\scripts\setup-windows.ps1" -ForegroundColor White
    Write-Host "  4. cd ..\..\..  " -ForegroundColor White
    Write-Host "  5. pnpm dev" -ForegroundColor White
} else {
    Write-Host "Please install missing prerequisites and run this script again." -ForegroundColor Red
}
Write-Host ""
