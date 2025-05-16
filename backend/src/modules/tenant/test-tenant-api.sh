#!/bin/bash
# filepath: d:\www\multi-tenant\backend\src\modules\tenant\test-tenant-api.sh

echo "Running Tenant API tests..."

# Run unit tests
echo "Running unit tests..."
npm test -- --testPathPattern=src/modules/tenant/test/tenant.controller.spec.ts
npm test -- --testPathPattern=src/modules/tenant/test/tenant.service.spec.ts

# Run e2e tests
echo "Running e2e tests..."
npm run test:e2e -- --testPathPattern=src/modules/tenant/test/tenant.e2e-spec.ts

echo "All tests completed!"
