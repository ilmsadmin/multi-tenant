# Module Management API

The Module Management API provides CRUD operations for managing modules in the Multi-Tenant system.

## Overview

Modules represent different functionalities that can be enabled for tenants in the system. Each module can be activated or deactivated for specific tenants.

## API Endpoints

### Create a Module

```
POST /api/modules
```

Creates a new module.

**Request Body:**
```json
{
  "name": "CRM",
  "description": "Customer Relationship Management module",
  "version": "1.0.0"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "CRM",
  "description": "Customer Relationship Management module",
  "version": "1.0.0",
  "created_at": "2025-05-16T12:00:00.000Z",
  "updated_at": "2025-05-16T12:00:00.000Z"
}
```

### Get All Modules

```
GET /api/modules?search=&skip=0&take=10
```

Retrieves a paginated list of modules with optional filtering.

**Query Parameters:**
- `search` (optional): Filter modules by name
- `skip` (optional): Number of records to skip (default: 0)
- `take` (optional): Number of records to return (default: 10)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "CRM",
      "description": "Customer Relationship Management module",
      "version": "1.0.0",
      "created_at": "2025-05-16T12:00:00.000Z",
      "updated_at": "2025-05-16T12:00:00.000Z"
    },
    {
      "id": 2,
      "name": "HRM",
      "description": "Human Resource Management module",
      "version": "1.0.0",
      "created_at": "2025-05-16T12:30:00.000Z",
      "updated_at": "2025-05-16T12:30:00.000Z"
    }
  ],
  "total": 2,
  "skip": 0,
  "take": 10
}
```

### Get Module by ID

```
GET /api/modules/:id
```

Retrieves a specific module by its ID.

**Response:**
```json
{
  "id": 1,
  "name": "CRM",
  "description": "Customer Relationship Management module",
  "version": "1.0.0",
  "created_at": "2025-05-16T12:00:00.000Z",
  "updated_at": "2025-05-16T12:00:00.000Z"
}
```

### Get Module by Name

```
GET /api/modules/name/:name
```

Retrieves a specific module by its name.

**Response:**
```json
{
  "id": 1,
  "name": "CRM",
  "description": "Customer Relationship Management module",
  "version": "1.0.0",
  "created_at": "2025-05-16T12:00:00.000Z",
  "updated_at": "2025-05-16T12:00:00.000Z"
}
```

### Update Module

```
PATCH /api/modules/:id
```

Updates an existing module.

**Request Body:**
```json
{
  "description": "Updated description for CRM module",
  "version": "1.1.0"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "CRM",
  "description": "Updated description for CRM module",
  "version": "1.1.0",
  "created_at": "2025-05-16T12:00:00.000Z",
  "updated_at": "2025-05-16T13:00:00.000Z"
}
```

### Delete Module

```
DELETE /api/modules/:id
```

Deletes a module by its ID.

**Response:** 204 No Content

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 400 Bad Request: Invalid input data
- 404 Not Found: Module not found
- 409 Conflict: Module with the same name already exists
- 500 Internal Server Error: Server-side error

## Testing

You can test the Module API using the provided Postman collection and test script:

1. Import the Postman collection: `module-api.postman_collection.json`
2. Run the test script: `./test-module-api.sh`
