# Backend Testing Guide

This directory contains tests for the multi-tenant backend system.

## Test Structure

- **Unit Tests**: Located in `src/modules/*/test/*.spec.ts`
- **E2E Tests**: Located in `test/*.e2e-spec.ts`
- **Database Tests**: Located in `test/database-*.spec.ts`

## Running Tests

You can run the tests using the following npm scripts:

```bash
# Run all unit tests
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run specific test file
npm test -- tenant.service.spec.ts
```

Or use the PowerShell script in the root directory:

```powershell
.\run-backend-tests.ps1
```

## Test Coverage Goals

- Aim for at least 80% code coverage for critical services (Auth, Tenant)
- Aim for at least 70% overall code coverage

## Testing Best Practices

1. **Unit Tests**:
   - Test each service method independently
   - Mock external dependencies
   - Test both success and error cases

2. **Integration Tests**:
   - Test API endpoints with actual HTTP requests
   - Test interactions between modules
   - Use real database or in-memory alternatives

3. **E2E Tests**:
   - Test complete workflows
   - Set up test data before tests
   - Clean up test data after tests

## Testing Multi-tenancy

When testing in a multi-tenant environment:

1. Create a test tenant
2. Set up tenant-specific data
3. Test with `X-Tenant-ID` header
4. Verify tenant isolation
5. Clean up tenant schema and data
