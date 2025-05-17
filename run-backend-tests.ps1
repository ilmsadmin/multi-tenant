# Backend Testing Script

# Run unit tests
function Run-UnitTests {
    Write-Host "Running unit tests..." -ForegroundColor Cyan
    Set-Location -Path "$PSScriptRoot\backend"
    npm test
}

# Run e2e tests
function Run-E2ETests {
    Write-Host "Running e2e tests..." -ForegroundColor Cyan
    Set-Location -Path "$PSScriptRoot\backend"
    npm run test:e2e
}

# Run tests with coverage
function Run-CoverageTests {
    Write-Host "Running tests with coverage..." -ForegroundColor Cyan
    Set-Location -Path "$PSScriptRoot\backend"
    npm run test:cov
}

# Main script
Write-Host "Multi-Tenant System Backend Testing" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green

$testOption = Read-Host "
Choose a test option:
1) Run unit tests
2) Run e2e tests
3) Run with coverage
4) Run all tests
Enter option (1-4)"

switch ($testOption) {
    "1" { Run-UnitTests }
    "2" { Run-E2ETests }
    "3" { Run-CoverageTests }
    "4" {
        Run-UnitTests
        Run-E2ETests
        Run-CoverageTests
    }
    default {
        Write-Host "Invalid option selected. Exiting..." -ForegroundColor Red
        Exit 1
    }
}

Write-Host "Testing completed!" -ForegroundColor Green
