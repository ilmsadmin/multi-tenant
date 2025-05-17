# Multi-tenant System Setup Guide

## Starting the Services

### Option 1: Manual Start (Recommended for Development)

1. Start the backend server (port 3000):
   ```powershell
   cd d:\www\multi-tenant\backend
   npm run start:dev
   ```

2. Start the frontend server (port 3002):
   ```powershell
   cd d:\www\multi-tenant\frontend
   set PORT=3002
   npm start
   ```

### Option 2: Using PowerShell Script

Run the provided script to start both services in the background:
```powershell
cd d:\www\multi-tenant
.\start-services.ps1
```

To stop all services:
```powershell
.\stop-services.ps1
```

## Access Information

- **Backend API**: http://localhost:3000
  - Swagger API Documentation: http://localhost:3000/api/docs
- **Frontend**: http://localhost:3002

## Login Credentials

### Default Tenant (tenant_id: 1)

- **Tenant Admin**:
  - Username: `admin`
  - Password: `admin123`
  - Tenant ID: `1`

### System Admin

- **Username**: `admin`
- **Password**: `admin123`

## Authentication Flows

The system supports three authentication flows:

1. **System Admin Login**: Full system-level administrative access
2. **Tenant Admin Login**: Administrative access to a specific tenant
3. **User Login**: Regular user access to a specific tenant

When logging in, make sure to provide the correct tenant ID (usually `1` for the default tenant) for tenant admin and user authentication.

## Troubleshooting

- If you see the error "Tenant không tồn tại hoặc không được xác định" (Tenant doesn't exist or is not defined), ensure you're using tenant ID 1 (default tenant).
- Make sure both backend and frontend services are running properly.
- Check backend logs for detailed error information.
- If necessary, run the tenant creation script again:
  ```powershell
  cd d:\www\multi-tenant\backend
  node src\scripts\create-default-tenant.js
  ```
