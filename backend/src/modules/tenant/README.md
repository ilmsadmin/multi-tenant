# Tenant Management API

API for managing tenants in a multi-tenant system.

## Overview

This module provides CRUD operations for managing tenants. Each tenant has its own schema in the database and can be associated with different packages and modules.

## Endpoints

### Create a new tenant
- **POST** `/api/tenants`
- Creates a new tenant with a dedicated schema
- Requires a name, optionally domain, package_id, and status

### Get all tenants
- **GET** `/api/tenants`
- Returns a paginated list of all tenants
- Supports filtering by status and search by name
- Query parameters:
  - `search`: Filter tenants by name
  - `status`: Filter by tenant status (active, inactive, suspended, pending)
  - `page`: Page number (default: 1)
  - `limit`: Number of items per page (default: 10, max: 100)

### Get tenant by ID
- **GET** `/api/tenants/:id`
- Returns a specific tenant by ID

### Get tenant by domain
- **GET** `/api/tenants/domain/:domain`
- Returns a tenant by its domain name

### Activate/Deactivate module for tenant
- **POST** `/api/tenants/:id/modules`
- Activates or deactivates a module for a specific tenant
- Request body:
  ```json
  {
    "module_id": 1,
    "status": "active", // or "inactive"
    "settings": {
      // Optional custom settings for the module
      "enableFeature1": true,
      "maxUsers": 50
    }
  }
  ```

### Get all modules for tenant
- **GET** `/api/tenants/:id/modules`
- Returns a list of all modules assigned to the specified tenant

### Get module details for tenant
- **GET** `/api/tenants/:id/modules/:moduleId`
- Returns details of a specific module assigned to the tenant
- Includes custom settings if configured
- Returns a specific tenant by domain name

### Update tenant
- **PATCH** `/api/tenants/:id`
- Updates an existing tenant's information

### Update tenant status
- **PATCH** `/api/tenants/:id/status`
- Updates only the tenant's status
- Body: `{ "status": "active"|"inactive"|"suspended"|"pending" }`

### Delete tenant
- **DELETE** `/api/tenants/:id`
- Deletes a tenant and its schema
- Returns 204 No Content on success

## Data Structure

### Tenant Entity
```typescript
{
  id: number;
  name: string;
  domain: string | null;
  schema_name: string;
  package_id: number | null;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  description: string | null;
  created_at: Date;
  updated_at: Date;
  modules: TenantModule[];
}
```

## Example Usage

### Creating a tenant
```http
POST /api/tenants
Content-Type: application/json

{
  "name": "Example Tenant",
  "domain": "example-tenant",
  "package_id": 1,
  "description": "This is an example tenant"
}
```

### Querying tenants
```http
GET /api/tenants?search=example&status=active&page=1&limit=10
```
