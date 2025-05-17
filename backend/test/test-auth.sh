#!/bin/bash
# Script to test authentication endpoints

BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Authentication APIs"
echo "============================="

# Test System Login (Might not be implemented yet)
echo -e "\n1. 🔐 Testing System Login..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}' \
  $BASE_URL/auth/system/login

# Test Tenant Login
echo -e "\n\n2. 🔐 Testing Tenant Login..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: tenant_test" \
  -d '{"username":"tenant_admin","password":"password123"}' \
  $BASE_URL/auth/tenant/login

# Test Regular User Login
echo -e "\n\n3. 🔐 Testing User Login..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: default_tenant" \
  -d '{"username":"testuser","password":"password123"}' \
  $BASE_URL/auth/login

echo -e "\n\n✅ Testing completed"
