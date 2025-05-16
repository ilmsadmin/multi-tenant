# test-tenant-module-api.ps1
# Script to test tenant module activation/deactivation API

# Configuration
$API_URL = "http://localhost:3000"
$TENANT_ID = 1
$MODULE_ID = 1

Write-Host "Testing Tenant Module Activation API..." -ForegroundColor Yellow

# 1. Activate a module for tenant
Write-Host "`n1. Activating module $MODULE_ID for tenant $TENANT_ID..." -ForegroundColor Yellow
$activateBody = @{
    module_id = $MODULE_ID
    status = "active"
    settings = @{
        enableFeature1 = $true
        maxUsers = 50
    }
} | ConvertTo-Json

$activateResponse = Invoke-RestMethod -Uri "$API_URL/tenants/$TENANT_ID/modules" `
    -Method Post -ContentType "application/json" -Body $activateBody -ErrorAction SilentlyContinue
Write-Host "Response: $($activateResponse | ConvertTo-Json -Depth 3)"

# 2. Get all modules for tenant
Write-Host "`n2. Getting all modules for tenant $TENANT_ID..." -ForegroundColor Yellow
$modulesResponse = Invoke-RestMethod -Uri "$API_URL/tenants/$TENANT_ID/modules" `
    -Method Get -ErrorAction SilentlyContinue
Write-Host "Response: $($modulesResponse | ConvertTo-Json -Depth 3)"

# 3. Get specific module details
Write-Host "`n3. Getting details for module $MODULE_ID of tenant $TENANT_ID..." -ForegroundColor Yellow
$moduleResponse = Invoke-RestMethod -Uri "$API_URL/tenants/$TENANT_ID/modules/$MODULE_ID" `
    -Method Get -ErrorAction SilentlyContinue
Write-Host "Response: $($moduleResponse | ConvertTo-Json -Depth 3)"

# 4. Deactivate the module
Write-Host "`n4. Deactivating module $MODULE_ID for tenant $TENANT_ID..." -ForegroundColor Yellow
$deactivateBody = @{
    module_id = $MODULE_ID
    status = "inactive"
    settings = @{
        enableFeature1 = $false
        maxUsers = 0
    }
} | ConvertTo-Json

$deactivateResponse = Invoke-RestMethod -Uri "$API_URL/tenants/$TENANT_ID/modules" `
    -Method Post -ContentType "application/json" -Body $deactivateBody -ErrorAction SilentlyContinue
Write-Host "Response: $($deactivateResponse | ConvertTo-Json -Depth 3)"

# 5. Check module status after deactivation
Write-Host "`n5. Checking module status after deactivation..." -ForegroundColor Yellow
$statusResponse = Invoke-RestMethod -Uri "$API_URL/tenants/$TENANT_ID/modules/$MODULE_ID" `
    -Method Get -ErrorAction SilentlyContinue
Write-Host "Response: $($statusResponse | ConvertTo-Json -Depth 3)"

Write-Host "`nAPI Testing Complete!" -ForegroundColor Green
