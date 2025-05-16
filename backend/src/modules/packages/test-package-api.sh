#!/bin/bash

# Test script for Package API
# You can run this script to test the Package API endpoints

API_URL="http://localhost:3000/api"

# Color codes for terminal output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

echo -e "${BLUE}===== Testing Package API =====${NC}"

# Test 1: Create a new package
echo -e "\n${BLUE}Creating a new package...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/packages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Package",
    "description": "High-tier package with all features included",
    "price": 99.99
  }')

echo $CREATE_RESPONSE
PACKAGE_ID=$(echo $CREATE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -n "$PACKAGE_ID" ]; then
  echo -e "${GREEN}Package created successfully with ID: $PACKAGE_ID${NC}"
else
  echo -e "${RED}Failed to create package${NC}"
fi

# Test 2: Get all packages
echo -e "\n${BLUE}Getting all packages...${NC}"
curl -s -X GET "${API_URL}/packages" | json_pp

# Test 3: Get package by ID
echo -e "\n${BLUE}Getting package with ID: $PACKAGE_ID...${NC}"
curl -s -X GET "${API_URL}/packages/$PACKAGE_ID" | json_pp

# Test 4: Filter packages by name
echo -e "\n${BLUE}Filtering packages with name containing 'Enter'...${NC}"
curl -s -X GET "${API_URL}/packages?name=Enter" | json_pp

# Test 5: Update package
echo -e "\n${BLUE}Updating package with ID: $PACKAGE_ID...${NC}"
curl -s -X PATCH "${API_URL}/packages/$PACKAGE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enterprise Plus Package",
    "price": 129.99
  }' | json_pp

# Test 6: Delete package
echo -e "\n${BLUE}Deleting package with ID: $PACKAGE_ID...${NC}"
DELETE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "${API_URL}/packages/$PACKAGE_ID")

if [ "$DELETE_STATUS" -eq 204 ]; then
  echo -e "${GREEN}Package deleted successfully${NC}"
else
  echo -e "${RED}Failed to delete package, status: $DELETE_STATUS${NC}"
fi

# Verify deletion
echo -e "\n${BLUE}Verifying package deletion...${NC}"
GET_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${API_URL}/packages/$PACKAGE_ID")

if [ "$GET_STATUS" -eq 404 ]; then
  echo -e "${GREEN}Verification successful, package no longer exists${NC}"
else
  echo -e "${RED}Unexpected status: $GET_STATUS${NC}"
fi

echo -e "\n${BLUE}===== API Tests Completed =====${NC}"
