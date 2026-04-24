# Windows setup script for Echo Control

Write-Host "=== Echo Control - Windows Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    New-Item -Path .env -ItemType File | Out-Null
}

# Check if AUTH_SECRET is already set
$authSecretExists = Get-Content .env -ErrorAction SilentlyContinue | Select-String -Pattern "^AUTH_SECRET=" -Quiet

if ($authSecretExists) {
    Write-Host "AUTH_SECRET already exists in .env file. Skipping generation." -ForegroundColor Green
} else {
    Write-Host "Generating AUTH_SECRET..." -ForegroundColor Yellow
    
    # Generate random bytes and convert to base64
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    $authSecret = [Convert]::ToBase64String($bytes)
    
    Add-Content -Path .env -Value "AUTH_SECRET=$authSecret"
    Write-Host "AUTH_SECRET generated and added to .env" -ForegroundColor Green
}

# Check if DATABASE_URL is already set
$dbUrlExists = Get-Content .env -ErrorAction SilentlyContinue | Select-String -Pattern "^DATABASE_URL=" -Quiet

if ($dbUrlExists) {
    Write-Host "DATABASE_URL already exists in .env file. Skipping." -ForegroundColor Green
} else {
    Write-Host "Adding DATABASE_URL..." -ForegroundColor Yellow
    Add-Content -Path .env -Value "DATABASE_URL='postgresql://echo_user:echo_password@localhost:5469/echo_control_v2?schema=public'"
    Write-Host "DATABASE_URL added to .env" -ForegroundColor Green
}

Write-Host ""
Write-Host "Setup complete! You can now run 'pnpm dev' to start the development server." -ForegroundColor Green
Write-Host ""
