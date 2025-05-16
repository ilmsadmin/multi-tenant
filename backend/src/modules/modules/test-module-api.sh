#!/bin/bash

# Test script for the Module Management API
API_URL="http://localhost:3000/api"

# Colors for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting Module API Tests..."

# Create a module
echo -e "\nTest: Create Module"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/modules" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Module",
    "description": "This is a test module",
    "version": "1.0.0"
  }')

# Extract the ID of the created module
MODULE_ID=$(echo $CREATE_RESPONSE | jq -r '.id')

if [ -n "$MODULE_ID" ] && [ "$MODULE_ID" != "null" ]; then
  echo -e "${GREEN}✓ Module created successfully with ID: $MODULE_ID${NC}"
else
  echo -e "${RED}✗ Failed to create module${NC}"
  echo $CREATE_RESPONSE
  exit 1
fi

# Get all modules
echo -e "\nTest: Get All Modules"
ALL_MODULES=$(curl -s -X GET "$API_URL/modules")
TOTAL_COUNT=$(echo $ALL_MODULES | jq -r '.total')

if [ -n "$TOTAL_COUNT" ] && [ "$TOTAL_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✓ Retrieved $TOTAL_COUNT modules${NC}"
else
  echo -e "${RED}✗ Failed to retrieve modules${NC}"
  echo $ALL_MODULES
  exit 1
fi

# Get module by ID
echo -e "\nTest: Get Module by ID"
MODULE_BY_ID=$(curl -s -X GET "$API_URL/modules/$MODULE_ID")
MODULE_NAME=$(echo $MODULE_BY_ID | jq -r '.name')

if [ "$MODULE_NAME" = "Test Module" ]; then
  echo -e "${GREEN}✓ Retrieved module by ID successfully${NC}"
else
  echo -e "${RED}✗ Failed to retrieve module by ID${NC}"
  echo $MODULE_BY_ID
  exit 1
fi

# Get module by name
echo -e "\nTest: Get Module by Name"
MODULE_BY_NAME=$(curl -s -X GET "$API_URL/modules/name/Test%20Module")
MODULE_ID_BY_NAME=$(echo $MODULE_BY_NAME | jq -r '.id')

if [ "$MODULE_ID_BY_NAME" = "$MODULE_ID" ]; then
  echo -e "${GREEN}✓ Retrieved module by name successfully${NC}"
else
  echo -e "${RED}✗ Failed to retrieve module by name${NC}"
  echo $MODULE_BY_NAME
  exit 1
fi

# Update module
echo -e "\nTest: Update Module"
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/modules/$MODULE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated test module description",
    "version": "1.1.0"
  }')

UPDATED_VERSION=$(echo $UPDATE_RESPONSE | jq -r '.version')

if [ "$UPDATED_VERSION" = "1.1.0" ]; then
  echo -e "${GREEN}✓ Module updated successfully${NC}"
else
  echo -e "${RED}✗ Failed to update module${NC}"
  echo $UPDATE_RESPONSE
  exit 1
fi

# Delete module
echo -e "\nTest: Delete Module"
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/modules/$MODULE_ID" -w "%{http_code}" -o /dev/null)

if [ "$DELETE_RESPONSE" = "204" ]; then
  echo -e "${GREEN}✓ Module deleted successfully${NC}"
else
  echo -e "${RED}✗ Failed to delete module: Got status code $DELETE_RESPONSE${NC}"
  exit 1
fi

# Verify module is deleted
echo -e "\nTest: Verify Module Deletion"
VERIFY_DELETE=$(curl -s -X GET "$API_URL/modules/$MODULE_ID" -w "%{http_code}" -o /dev/null)

if [ "$VERIFY_DELETE" = "404" ]; then
  echo -e "${GREEN}✓ Module deletion verified${NC}"
else
  echo -e "${RED}✗ Module still exists after deletion: Got status code $VERIFY_DELETE${NC}"
  exit 1
fi

echo -e "\n${GREEN}All tests passed successfully!${NC}"
