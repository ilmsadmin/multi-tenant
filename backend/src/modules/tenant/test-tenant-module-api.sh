#!/bin/bash
# test-tenant-module-api.sh
# Script to test tenant module activation/deactivation API

# Configuration
API_URL="http://localhost:3000"
TENANT_ID=1
MODULE_ID=1

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Testing Tenant Module Activation API...${NC}"

# 1. Activate a module for tenant
echo -e "\n${YELLOW}1. Activating module $MODULE_ID for tenant $TENANT_ID...${NC}"
ACTIVATE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": '$MODULE_ID',
    "status": "active",
    "settings": {
      "enableFeature1": true,
      "maxUsers": 50
    }
  }' \
  $API_URL/tenants/$TENANT_ID/modules)

echo "Response: $ACTIVATE_RESPONSE"

# 2. Get all modules for tenant
echo -e "\n${YELLOW}2. Getting all modules for tenant $TENANT_ID...${NC}"
MODULES_RESPONSE=$(curl -s -X GET $API_URL/tenants/$TENANT_ID/modules)
echo "Response: $MODULES_RESPONSE"

# 3. Get specific module details
echo -e "\n${YELLOW}3. Getting details for module $MODULE_ID of tenant $TENANT_ID...${NC}"
MODULE_RESPONSE=$(curl -s -X GET $API_URL/tenants/$TENANT_ID/modules/$MODULE_ID)
echo "Response: $MODULE_RESPONSE"

# 4. Deactivate the module
echo -e "\n${YELLOW}4. Deactivating module $MODULE_ID for tenant $TENANT_ID...${NC}"
DEACTIVATE_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "module_id": '$MODULE_ID',
    "status": "inactive",
    "settings": {
      "enableFeature1": false,
      "maxUsers": 0
    }
  }' \
  $API_URL/tenants/$TENANT_ID/modules)

echo "Response: $DEACTIVATE_RESPONSE"

# 5. Check module status after deactivation
echo -e "\n${YELLOW}5. Checking module status after deactivation...${NC}"
STATUS_RESPONSE=$(curl -s -X GET $API_URL/tenants/$TENANT_ID/modules/$MODULE_ID)
echo "Response: $STATUS_RESPONSE"

echo -e "\n${GREEN}API Testing Complete!${NC}"
