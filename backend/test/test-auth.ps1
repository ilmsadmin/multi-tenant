# Script để kiểm tra các API xác thực

$BaseUrl = "http://localhost:3000/api"

Write-Host "🧪 Testing Authentication APIs"
Write-Host "============================="

# Test System Login
Write-Host "`n1. 🔐 Testing System Login..."
$systemLoginBody = @{
    username = "admin"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$BaseUrl/auth/system/login" -Method Post -ContentType "application/json" -Body $systemLoginBody -ErrorAction SilentlyContinue

# Test Tenant Login
Write-Host "`n2. 🔐 Testing Tenant Login..."
$tenantLoginBody = @{
    username = "tenant_admin"
    password = "password123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BaseUrl/auth/tenant/login" -Method Post -ContentType "application/json" -Headers @{ "x-tenant-id" = "tenant_test" } -Body $tenantLoginBody
} catch {
    Write-Host "⚠️ Error: $_"
    Write-Host $_.Exception.Response.StatusCode
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody
    }
}

# Test User Login
Write-Host "`n3. 🔐 Testing User Login..."
$userLoginBody = @{
    username = "testuser"
    password = "password123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -ContentType "application/json" -Headers @{ "x-tenant-id" = "default_tenant" } -Body $userLoginBody
} catch {
    Write-Host "⚠️ Error: $_"
    Write-Host $_.Exception.Response.StatusCode
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host $responseBody
    }
}

Write-Host "`n✅ Testing completed"
