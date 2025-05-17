# Script to start both backend and frontend servers in the background
# PowerShell script for Windows

# Kill any existing Node.js processes (optional, uncomment if needed)
# Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "Creating default tenant if it doesn't exist..." -ForegroundColor Green
cd $PSScriptRoot\backend
node src\scripts\create-default-tenant.js

Write-Host "Starting backend server on port 3000..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    cd $using:PSScriptRoot\backend
    npm run start:dev
}

Write-Host "Starting frontend server on port 3002..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    cd $using:PSScriptRoot\frontend
    $env:PORT = 3002
    npm start
}

Write-Host "Both services are starting in the background." -ForegroundColor Green
Write-Host "- Backend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "- Frontend will be available at: http://localhost:3002" -ForegroundColor Cyan
Write-Host "" -ForegroundColor White
Write-Host "To view backend logs, run: Receive-Job $($backendJob.Id)" -ForegroundColor Yellow
Write-Host "To view frontend logs, run: Receive-Job $($frontendJob.Id)" -ForegroundColor Yellow
Write-Host "" -ForegroundColor White
Write-Host "To stop the services, you can use:" -ForegroundColor Red
Write-Host "Stop-Job $($backendJob.Id); Stop-Job $($frontendJob.Id)" -ForegroundColor Red
Write-Host "Or to stop all background jobs: Get-Job | Stop-Job" -ForegroundColor Red

# Output job IDs for reference
Write-Host ""
Write-Host "Job IDs for reference:" -ForegroundColor Magenta
Write-Host "Backend Job ID: $($backendJob.Id)" -ForegroundColor Magenta
Write-Host "Frontend Job ID: $($frontendJob.Id)" -ForegroundColor Magenta
