```mermaid
graph TD
    A[User] -->|1. Login Attempt| B{Auth Type?}
    B -->|System Admin| C[/auth/system/login]
    B -->|Tenant Admin| D[/auth/tenant/:tenantId/login]
    B -->|Tenant User| E[/auth/user/:tenantId/login]
    
    C -->|2. Validate| F[Check system_users table]
    D -->|2. Validate| G[Check tenant.users table with admin role]
    E -->|2. Validate| H[Check tenant.users table]
    
    F -->|3. Generate Token| I[JWT with level: 'system']
    G -->|3. Generate Token| J[JWT with level: 'tenant']
    H -->|3. Generate Token| K[JWT with level: 'user']
    
    I -->|4. Store| L[localStorage.token]
    J -->|4. Store| M[localStorage.tenant_token]
    K -->|4. Store| N[localStorage.user_token]
    
    L -->|5. Access| O[System Admin Routes]
    M -->|5. Access| P[Tenant Admin Routes]
    N -->|5. Access| Q[Tenant User Routes]
    
    R[API Interceptor] -->|Add token| S{Request Type?}
    S -->|System Route| T[Add token from localStorage.token]
    S -->|Tenant Admin Route| U[Add token from localStorage.tenant_token]
    S -->|Tenant User Route| V[Add token from localStorage.user_token]
    
    W[401 Error Handler] -->|Redirect| X{User Type?}
    X -->|System| Y[/login]
    X -->|Tenant Admin| Z[/tenant/login]
    X -->|Tenant User| AA[/user/login]
```
