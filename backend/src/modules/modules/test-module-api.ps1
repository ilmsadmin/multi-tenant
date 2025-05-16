# Test script for the Module Management API (PowerShell version)
$apiUrl = "http://localhost:3000/api"

Write-Host "Starting Module API Tests..." -ForegroundColor Blue

# Create a module
Write-Host "`nTest: Create Module" -ForegroundColor Cyan
$createResponse = Invoke-RestMethod -Method Post -Uri "$apiUrl/modules" -Headers @{
    "Content-Type" = "application/json"
} -Body @"
{
    "name": "Test Module",
    "description": "This is a test module",
    "version": "1.0.0"
}
"@ -ErrorAction Stop

# Extract the ID of the created module
$moduleId = $createResponse.id

if ($moduleId) {
    Write-Host "✓ Module created successfully with ID: $moduleId" -ForegroundColor Green
}
else {
    Write-Host "✗ Failed to create module" -ForegroundColor Red
    Write-Host ($createResponse | ConvertTo-Json)
    exit 1
}

# Get all modules
Write-Host "`nTest: Get All Modules" -ForegroundColor Cyan
$allModules = Invoke-RestMethod -Method Get -Uri "$apiUrl/modules" -ErrorAction Stop
$totalCount = $allModules.total

if ($totalCount -gt 0) {
    Write-Host "✓ Retrieved $totalCount modules" -ForegroundColor Green
}
else {
    Write-Host "✗ Failed to retrieve modules" -ForegroundColor Red
    Write-Host ($allModules | ConvertTo-Json)
    exit 1
}

# Get module by ID
Write-Host "`nTest: Get Module by ID" -ForegroundColor Cyan
$moduleById = Invoke-RestMethod -Method Get -Uri "$apiUrl/modules/$moduleId" -ErrorAction Stop
$moduleName = $moduleById.name

if ($moduleName -eq "Test Module") {
    Write-Host "✓ Retrieved module by ID successfully" -ForegroundColor Green
}
else {
    Write-Host "✗ Failed to retrieve module by ID" -ForegroundColor Red
    Write-Host ($moduleById | ConvertTo-Json)
    exit 1
}

# Get module by name
Write-Host "`nTest: Get Module by Name" -ForegroundColor Cyan
$encodedName = [System.Web.HttpUtility]::UrlEncode("Test Module")
$moduleByName = Invoke-RestMethod -Method Get -Uri "$apiUrl/modules/name/$encodedName" -ErrorAction Stop
$moduleIdByName = $moduleByName.id

if ($moduleIdByName -eq $moduleId) {
    Write-Host "✓ Retrieved module by name successfully" -ForegroundColor Green
}
else {
    Write-Host "✗ Failed to retrieve module by name" -ForegroundColor Red
    Write-Host ($moduleByName | ConvertTo-Json)
    exit 1
}

# Update module
Write-Host "`nTest: Update Module" -ForegroundColor Cyan
$updateResponse = Invoke-RestMethod -Method Patch -Uri "$apiUrl/modules/$moduleId" -Headers @{
    "Content-Type" = "application/json"
} -Body @"
{
    "description": "Updated test module description",
    "version": "1.1.0"
}
"@ -ErrorAction Stop

$updatedVersion = $updateResponse.version

if ($updatedVersion -eq "1.1.0") {
    Write-Host "✓ Module updated successfully" -ForegroundColor Green
}
else {
    Write-Host "✗ Failed to update module" -ForegroundColor Red
    Write-Host ($updateResponse | ConvertTo-Json)
    exit 1
}

# Delete module
Write-Host "`nTest: Delete Module" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Method Delete -Uri "$apiUrl/modules/$moduleId" -ErrorAction Stop
    Write-Host "✓ Module deleted successfully" -ForegroundColor Green
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 204) {
        Write-Host "✓ Module deleted successfully" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Failed to delete module: Got status code $statusCode" -ForegroundColor Red
        exit 1
    }
}

# Verify module is deleted
Write-Host "`nTest: Verify Module Deletion" -ForegroundColor Cyan
try {
    Invoke-RestMethod -Method Get -Uri "$apiUrl/modules/$moduleId" -ErrorAction SilentlyContinue
    Write-Host "✗ Module still exists after deletion" -ForegroundColor Red
    exit 1
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "✓ Module deletion verified" -ForegroundColor Green
    }
    else {
        Write-Host "✗ Unexpected error verifying deletion: Got status code $statusCode" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`nAll tests passed successfully!" -ForegroundColor Green
