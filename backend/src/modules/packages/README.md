# Package API Documentation

This document provides details on how to interact with the Package API in the Multi-Tenant System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## Endpoints

### 1. Create a Package

Creates a new package in the system.

- **URL**: `/packages`
- **Method**: `POST`
- **Auth required**: Yes
- **Permissions required**: System Admin

**Request Body**:

```json
{
  "name": "Enterprise Package",
  "description": "High-tier package with all features included",
  "price": 99.99
}
```

**Response**:

```json
{
  "id": 1,
  "name": "Enterprise Package",
  "description": "High-tier package with all features included",
  "price": 99.99,
  "created_at": "2025-05-16T12:00:00.000Z",
  "updated_at": "2025-05-16T12:00:00.000Z"
}
```

### 2. Get All Packages

Retrieves a list of all packages.

- **URL**: `/packages`
- **Method**: `GET`
- **Auth required**: Yes
- **Permissions required**: System Admin

**Query Parameters**:

- `name` (optional): Filter packages by name (partial match)

**Response**:

```json
[
  {
    "id": 1,
    "name": "Enterprise Package",
    "description": "High-tier package with all features included",
    "price": 99.99,
    "created_at": "2025-05-16T12:00:00.000Z",
    "updated_at": "2025-05-16T12:00:00.000Z"
  },
  {
    "id": 2,
    "name": "Basic Package",
    "description": "Entry-level package",
    "price": 19.99,
    "created_at": "2025-05-16T12:10:00.000Z",
    "updated_at": "2025-05-16T12:10:00.000Z"
  }
]
```

### 3. Get Package by ID

Retrieves a specific package by its ID.

- **URL**: `/packages/:id`
- **Method**: `GET`
- **Auth required**: Yes
- **Permissions required**: System Admin

**URL Parameters**:

- `id`: The ID of the package to retrieve

**Response**:

```json
{
  "id": 1,
  "name": "Enterprise Package",
  "description": "High-tier package with all features included",
  "price": 99.99,
  "created_at": "2025-05-16T12:00:00.000Z",
  "updated_at": "2025-05-16T12:00:00.000Z"
}
```

### 4. Update Package

Updates an existing package.

- **URL**: `/packages/:id`
- **Method**: `PATCH`
- **Auth required**: Yes
- **Permissions required**: System Admin

**URL Parameters**:

- `id`: The ID of the package to update

**Request Body**:

```json
{
  "name": "Enterprise Plus Package",
  "price": 129.99
}
```

**Response**:

```json
{
  "id": 1,
  "name": "Enterprise Plus Package",
  "description": "High-tier package with all features included",
  "price": 129.99,
  "created_at": "2025-05-16T12:00:00.000Z",
  "updated_at": "2025-05-16T12:30:00.000Z"
}
```

### 5. Delete Package

Deletes a package from the system.

- **URL**: `/packages/:id`
- **Method**: `DELETE`
- **Auth required**: Yes
- **Permissions required**: System Admin

**URL Parameters**:

- `id`: The ID of the package to delete

**Response**:

- Status: `204 No Content`

## Error Responses

### 400 Bad Request

```json
{
  "statusCode": 400,
  "message": ["Error message describing the validation error"],
  "error": "Bad Request"
}
```

### 404 Not Found

```json
{
  "statusCode": 404,
  "message": "Package with ID 999 not found",
  "error": "Not Found"
}
```

### 401 Unauthorized

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Swagger Documentation

A complete API documentation is available using Swagger UI at:

```
http://localhost:3000/api/docs
```

## Testing with Postman

A Postman collection is available at:
`d:\www\multi-tenant\backend\src\modules\packages\package-api.postman_collection.json`

Import this file into Postman to test the API endpoints.
