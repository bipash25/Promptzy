# Promptzy - Build All Script
# Save as: scripts/build-all.ps1
# Run: .\scripts\build-all.ps1

param(
    [string]$Target = "all" # Options: web, mobile, all
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

Write-Host "🚀 Building Promptzy..." -ForegroundColor Cyan
Write-Host "Target: $Target`n" -ForegroundColor Yellow

function Build-Web {
    Write-Host "`n📦 Building Web Application..." -ForegroundColor Green
    Set-Location "$projectRoot\packages\web"
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Build
    Write-Host "Building production bundle..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Web build successful!" -ForegroundColor Green
        Write-Host "Output: packages\web\dist" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Web build failed!" -ForegroundColor Red
        exit 1
    }
}

function Build-Mobile {
    Write-Host "`n📱 Building Android APK..." -ForegroundColor Green
    Set-Location "$projectRoot\packages\mobile"
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Build Android
    Write-Host "Building Android release..." -ForegroundColor Yellow
    Set-Location "android"
    .\gradlew assembleRelease
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Android build successful!" -ForegroundColor Green
        Write-Host "Output: packages\mobile\android\app\build\outputs\apk\release\app-release.apk" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Android build failed!" -ForegroundColor Red
        exit 1
    }
    
    Set-Location $projectRoot
}

# Execute builds based on target
switch ($Target.ToLower()) {
    "web" {
        Build-Web
    }
    "mobile" {
        Build-Mobile
    }
    "all" {
        Build-Web
        Build-Mobile
    }
    default {
        Write-Host "Invalid target: $Target" -ForegroundColor Red
        Write-Host "Valid options: web, mobile, all" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n✅ Build process completed!" -ForegroundColor Green