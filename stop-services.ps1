# Script to stop all Node.js processes
# PowerShell script for Windows

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "  Stopping Node.js process (PID: $($_.Id))" -ForegroundColor Gray
        $_ | Stop-Process -Force
    }
    Write-Host "All Node.js processes have been stopped." -ForegroundColor Green
} else {
    Write-Host "No Node.js processes found." -ForegroundColor Cyan
}

# Also stop any background jobs
$jobs = Get-Job -ErrorAction SilentlyContinue
if ($jobs) {
    Write-Host "Stopping all background jobs..." -ForegroundColor Yellow
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "All background jobs have been stopped and removed." -ForegroundColor Green
} else {
    Write-Host "No background jobs found." -ForegroundColor Cyan
}
