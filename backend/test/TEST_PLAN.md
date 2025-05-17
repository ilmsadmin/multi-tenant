# Backend Testing Plan

## Unit Tests
Unit tests verify that individual units of code work as expected. For our multi-tenant system, we need to test:

- **Service Methods**: Test individual service methods with mocked dependencies
- **Controllers**: Test controller methods with mocked services
- **Guards & Middleware**: Test tenant isolation and authentication guards

## Integration Tests
Integration tests verify that different parts of the system work together. We need to test:

- **API Endpoints**: Test API endpoints with actual HTTP requests
- **Database Integration**: Test actual database operations with test databases
- **Tenant Isolation**: Test that tenant data remains isolated

## Database Migration Tests
Database migration tests verify that our migration scripts work correctly:

- **Schema Creation**: Test the creation of tenant schemas
- **Migration Scripts**: Test that migration scripts run without errors
- **Rollback Procedures**: Test that rollback procedures work as expected

## Test Coverage Goals
- Aim for at least 80% code coverage for critical services (Auth, Tenant)
- Aim for at least 70% overall code coverage

## Running Tests
```bash
# Run all unit tests
npm test

# Run tests with coverage report
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run specific test file
npm test -- tenant.service.spec.ts
```
