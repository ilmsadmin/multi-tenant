# Multi-Tenant Authentication System Updates

## Overview of Changes

As part of our recent system update, we've standardized the authentication flow and user data management across the different user types in our multi-tenant application. This document outlines the standardized approach and provides guidance for implementing consistent authentication.

## New Documentation

We've added several new documentation files to help maintain consistency:

1. [Authentication Architecture](./docs/authentication-architecture.md) - Complete overview of the authentication system
2. [Authentication Flow Diagram](./docs/auth-flow-diagram.md) - Visual representation of authentication processes
3. [Authentication Implementation Checklist](./docs/auth-implementation-checklist.md) - Checklist for verifying consistent implementation
4. [API Interceptor Guide](./docs/api-interceptor-guide.md) - Guide to consistent API request/response handling

## User Types and Database Structure

Our system has three distinct user types, each stored differently:

1. **System Administrators** (`system_users` table)
   - Global system administrators
   - Stored in the public schema
   - Authenticate through `/auth/system/login`

2. **Tenant Administrators** (`tenant.users` table)
   - Tenant-specific administrators 
   - Stored in tenant-specific schemas
   - Authenticate through `/auth/tenant/:tenantId/login`

3. **Tenant Users** (`tenant.users` table)
   - Regular users within a tenant
   - Stored in tenant-specific schemas
   - Authenticate through `/auth/user/:tenantId/login`

## Key Implementation Points

1. Each user type has dedicated storage in localStorage:
   - System Admin: `token`, `user`, `schema_name`
   - Tenant Admin: `tenant_token`, `tenant_user`, `schema_name`
   - Tenant User: `user_token`, `user_info`, `user_schema_name`

2. API interceptors add appropriate tokens based on endpoint type

3. 401 errors redirect to the appropriate login page (except during login attempts)

4. Each user type has dedicated login/logout flows

## Next Steps

1. Review the new documentation
2. Use the implementation checklist to verify your code
3. Apply best practices from the API interceptor guide
4. Follow the authentication architecture document for any new development
