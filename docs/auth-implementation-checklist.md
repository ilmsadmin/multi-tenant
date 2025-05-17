# Authentication Implementation Checklist

This checklist ensures that all authentication operations maintain consistency across the different user types in the multi-tenant application.

## System Admin Operations

- [ ] System login sends credentials to `/auth/system/login`
- [ ] System token is stored in `localStorage.token`
- [ ] System user info is stored in `localStorage.user`
- [ ] Schema name is stored in `localStorage.schema_name`
- [ ] System logout removes `token` and `user` from localStorage
- [ ] System routes check for valid system admin token
- [ ] System API requests include Authorization header with system token

## Tenant Admin Operations

- [ ] Tenant admin login sends credentials to `/auth/tenant/:tenantId/login`
- [ ] Tenant admin token is stored in `localStorage.tenant_token`
- [ ] Tenant admin user info is stored in `localStorage.tenant_user`
- [ ] Tenant schema name is stored in `localStorage.schema_name`
- [ ] Tenant admin logout removes `tenant_token`, `tenant_user`, and `schema_name` from localStorage
- [ ] Tenant admin routes check for valid tenant admin token
- [ ] Tenant admin API requests include Authorization header with tenant token

## Tenant User Operations

- [ ] Tenant user login sends credentials to `/auth/user/:tenantId/login`
- [ ] Tenant user token is stored in `localStorage.user_token`
- [ ] Tenant user info is stored in `localStorage.user_info`
- [ ] Tenant user schema name is stored in `localStorage.user_schema_name`
- [ ] Tenant user logout removes `user_token`, `user_info`, and `user_schema_name` from localStorage
- [ ] Tenant user routes check for valid tenant user token
- [ ] Tenant user API requests include Authorization header with user token

## Frontend API Interceptor

- [ ] API interceptor correctly identifies endpoint types
- [ ] API interceptor adds appropriate token based on endpoint
- [ ] API interceptor handles 401 errors correctly for each endpoint type
- [ ] API interceptor skips redirects for login/tenant check endpoints

## Backend Authentication

- [ ] Backend verifies system user credentials against `system_users` table
- [ ] Backend verifies tenant admin credentials against tenant's `users` table with admin role check
- [ ] Backend verifies tenant user credentials against tenant's `users` table
- [ ] JWT tokens include the correct `level` claim ('system', 'tenant', or 'user')
- [ ] JWT tokens include the correct tenant ID when applicable
- [ ] JWT tokens include appropriate role and permission information

## Error Handling

- [ ] 401 errors redirect to the correct login page based on token type
- [ ] Login endpoints don't redirect on 401 errors
- [ ] Failed login attempts return appropriate error messages
- [ ] Token refresh mechanism works for all user types

## Security

- [ ] Passwords are properly hashed in both `system_users` and tenant `users` tables
- [ ] JWT tokens have appropriate expiration time
- [ ] Refresh tokens are properly secured
- [ ] Cross-tenant access is prevented

## Testing

- [ ] System admin login/logout flow is tested
- [ ] Tenant admin login/logout flow is tested
- [ ] Tenant user login/logout flow is tested
- [ ] Token refresh is tested for all user types
- [ ] 401 error handling is tested
- [ ] Cross-tenant access prevention is tested
