# Multi-Tenant Authentication Architecture Documentation

## Overview

This document outlines the authentication architecture for the multi-tenant application, detailing how different user types authenticate and how data is stored across the system. It's designed to ensure consistency in the authentication flow and data management.

## User Types

The system supports three main user types:

1. **System Administrators** (`system_users` table) - Global administrators who manage the entire platform
2. **Tenant Administrators** (`tenant.users` table with admin roles) - Administrators of specific tenant environments
3. **Tenant Users** (`tenant.users` table with regular roles) - Regular users within a tenant environment

## Authentication Process

### Login Flow

1. User provides credentials (username/password) and tenant ID (for tenant users)
2. System validates credentials against the appropriate database (system_users or tenant-specific users table)
3. On successful authentication:
   - JWT tokens (access and refresh) are generated
   - User session data is stored in Redis
   - Login activity is logged
4. User receives tokens for subsequent API requests

### Error Handling

The system provides specific error messages for various authentication scenarios:

- Missing username or password
- User not found
- Invalid credentials
- Missing tenant ID
- Invalid tenant
- Expired or invalid tokens
- Session expiration or invalidation

For detailed information on error handling improvements, see [Authentication Error Handling](./authentication-error-handling.md).

## Database Structure

### System User Storage (`public.system_users`)

```sql
CREATE TABLE IF NOT EXISTS public.system_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- System users have platform-wide access
- They are stored in the public schema
- Authentication is handled through `/auth/system/login` endpoint

### Tenant User Storage (`tenant.users`)

Each tenant has its own schema with a users table:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

- Tenant users (both admin and regular) are stored in their respective tenant schemas
- Tenant admins authenticate through `/auth/tenant/:tenantId/login` endpoint
- Regular users authenticate through `/auth/user/:tenantId/login` endpoint

## Authentication Flow

### System Admin Authentication

1. User submits credentials to `/auth/system/login`
2. Backend validates against `system_users` table
3. On success, returns JWT token with `level: 'system'` claim
4. Frontend stores token in `localStorage` as `token`

```typescript
// Frontend auth service for system admin
login: async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(`/auth/system/login`, {
    username: credentials.username,
    password: credentials.password,
    schemaName: credentials.schemaName
  });
  
  localStorage.setItem('token', response.data.access_token);
  localStorage.removeItem('tenant_token');
  localStorage.setItem('schema_name', credentials.schemaName);
  
  return response.data;
}
```

### Tenant Admin Authentication

1. User submits credentials with tenant ID to `/auth/tenant/:tenantId/login`
2. Backend connects to tenant schema and validates against `users` table
3. Checks if user has admin role
4. On success, returns JWT token with `level: 'tenant'` claim
5. Frontend stores token in `localStorage` as `tenant_token`

```typescript
// Backend tenant admin login
async tenantAdminLogin(tenantId: string, username: string, password: string) {
  // Connect to tenant schema
  // Validate credentials against tenant.users
  // Verify admin role
  // Generate JWT token with tenant-specific claims
}
```

### Tenant User Authentication

1. User submits credentials with tenant ID to `/auth/user/:tenantId/login`
2. Backend connects to tenant schema and validates against `users` table
3. On success, returns JWT token with `level: 'user'` claim
4. Frontend stores token in `localStorage` as `user_token`

## Token Structure

All JWT tokens include:

- `sub`: User ID
- `username`: Username
- `level`: User level ('system', 'tenant', or 'user')
- `tenantId`: Tenant ID (except for system tokens)
- `type`: Token type ('access_token' or 'refresh_token')
- `exp`: Expiration time

Admin tokens additionally include:
- `roles`: Array of role names
- `permissions`: Flattened array of permissions

## API Interceptors

The API interceptor in the frontend automatically handles token management:

1. Adds appropriate token to requests based on endpoint pattern
2. For system endpoints (`/auth/system/*`), adds `token`
3. For tenant admin endpoints (`/auth/tenant/*`), adds `tenant_token`
4. For tenant user endpoints (`/auth/user/*`), adds `user_token`
5. Handles 401 Unauthorized errors by redirecting to appropriate login page

## Session Management

- Token expiration is handled automatically by the JWT
- Refresh tokens can be used to obtain new access tokens without re-login
- Logout endpoints remove tokens from local storage and invalidate them on the server

## Error Handling

- 401 Unauthorized errors redirect to the appropriate login page
- Login endpoints (`/auth/*/login`) do not redirect on 401 errors

## Security Considerations

1. Passwords are hashed using bcrypt before storage
2. Tokens have expiration times
3. Schema segregation provides tenant isolation
4. Role-based access control restricts actions within tenants

## Implementation Guidelines

1. Always verify tenant ID in requests for tenant-specific endpoints
2. Use the appropriate endpoint for each user type
3. Store tokens in the designated localStorage keys
4. Include schema information for tenant operations
5. Use the appropriate guard for route protection

## Token Storage in Frontend

| User Type      | Token Location        | User Info Location     | Schema Name Location     |
|----------------|----------------------|------------------------|--------------------------|
| System Admin   | `localStorage.token` | `localStorage.user`    | `localStorage.schema_name` |
| Tenant Admin   | `localStorage.tenant_token` | `localStorage.tenant_user` | `localStorage.schema_name` |
| Tenant User    | `localStorage.user_token` | `localStorage.user_info` | `localStorage.user_schema_name` |
