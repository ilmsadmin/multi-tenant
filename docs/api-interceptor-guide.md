# API Interceptor Consistency Guide

This guide explains how the API interceptor should handle requests and responses consistently across all user types.

## Request Interceptor

The request interceptor should:

1. Identify the endpoint type (system, tenant, or user)
2. Add the correct token to the request
3. Add schema information when needed

```typescript
// Thêm interceptor để xử lý token và schema name trong mỗi request
api.interceptors.request.use(
  (config) => {
    // Xác định token dựa trên loại endpoint đang gọi
    let token = null;
    let schemaName = null;
    
    if (config.url?.includes('/auth/system')) {
      // System admin endpoint
      token = localStorage.getItem('token');
      console.log('[API Interceptor] System admin endpoint detected');
    } else if (config.url?.includes('/auth/tenant')) {
      // Tenant admin endpoint
      token = localStorage.getItem('tenant_token');
      schemaName = localStorage.getItem('schema_name');
      console.log(`[API Interceptor] Tenant admin endpoint detected. Schema name from storage: ${schemaName}`);
    } else if (config.url?.includes('/auth/user')) {
      // User endpoint
      token = localStorage.getItem('user_token');
      schemaName = localStorage.getItem('user_schema_name');
      console.log(`[API Interceptor] User endpoint detected. Schema name from storage: ${schemaName}`);
    } else {
      // Default - try tokens in priority order
      token = localStorage.getItem('token') || 
              localStorage.getItem('tenant_token') || 
              localStorage.getItem('user_token');
      
      schemaName = localStorage.getItem('schema_name') || 
                   localStorage.getItem('user_schema_name') || 'default';
      console.log(`[API Interceptor] Default endpoint. Using Schema name: ${schemaName}`);
    }
    
    // Thêm Authorization header nếu có token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add schema header for tenant-specific operations
    if (schemaName && (config.url?.includes('/auth/tenant') || config.url?.includes('/auth/user'))) {
      console.log(`[API Interceptor] Adding schema_name to request: ${schemaName}`);
      config.headers['X-Schema-Name'] = schemaName;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## Response Interceptor

The response interceptor should:

1. Handle 401 errors correctly
2. Redirect to the appropriate login page based on the endpoint
3. Skip redirects for login and tenant check endpoints

```typescript
// Thêm interceptor để xử lý các response
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] Status: ${response.status} ${response.statusText}`);
    console.log(`[API Response] URL: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`[API Error] ${error.message}`);
    
    // Xử lý lỗi 401 (Unauthorized) - logout nếu token hết hạn
    if (error.response && error.response.status === 401) {
      // Xác định loại endpoint đang gọi để chuyển hướng đến trang login tương ứng
      const url = error.config ? error.config.url : '';
      
      // Không chuyển hướng khi đang kiểm tra tenant tồn tại hoặc khi đang đăng nhập
      if (url && (url.includes('/tenants/check/') || url.includes('/login'))) {
        console.log('[API Error] Skipping redirect for tenant check or login endpoint');
        return Promise.reject(error);
      }
      
      if (url && url.includes('/auth/system')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';  // Go to system admin login
      } else if (url && url.includes('/auth/tenant')) {
        localStorage.removeItem('tenant_token');
        localStorage.removeItem('tenant_user');
        localStorage.removeItem('schema_name');
        window.location.href = '/tenant/login';
      } else if (url && url.includes('/auth/user')) {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_info');
        localStorage.removeItem('user_schema_name');
        window.location.href = '/user/login';
      } else {
        // Default - only clear tokens relevant to the user type
        // Don't clear everything as that might affect other user types
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else if (localStorage.getItem('tenant_token')) {
          localStorage.removeItem('tenant_token');
          localStorage.removeItem('tenant_user');
          localStorage.removeItem('schema_name');
          window.location.href = '/tenant/login';
        } else if (localStorage.getItem('user_token')) {
          localStorage.removeItem('user_token');
          localStorage.removeItem('user_info');
          localStorage.removeItem('user_schema_name');
          window.location.href = '/user/login';
        } else {
          // If no tokens found, go to the default login page
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);
```

## Key Consistency Points

1. **Token Storage**: Each user type should have its own localStorage key for tokens
   - System Admin: `token`
   - Tenant Admin: `tenant_token`
   - Tenant User: `user_token`

2. **Schema Storage**: Each user type should store schema information correctly
   - System Admin: `schema_name` (global schema)
   - Tenant Admin: `schema_name` (tenant schema)
   - Tenant User: `user_schema_name` (tenant schema)

3. **Logout Cleanup**: On logout, only remove tokens related to the current user type
   - Don't clear ALL tokens as that affects multiple sessions

4. **Error Handling**: Skip redirects for login endpoints to prevent redirect loops

5. **Headers**: Include Authorization and schema headers as appropriate for each request type
