import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './App.css';

// Use the shared AuthGuard component
import { AuthGuard } from './components';

// Home Page
import HomePage from './pages/HomePage';

// Admin Pages
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import TenantManagement from './pages/admin/tenants/TenantManagement';
import TenantModules from './pages/admin/tenants/TenantModules';
import PackageManagement from './pages/admin/packages/PackageManagement';
import ModuleManagement from './pages/admin/modules/ModuleManagement';

// Tenant Pages
import TenantLogin from './pages/tenant/auth/TenantLogin';
import TenantDashboard from './pages/tenant/dashboard/TenantDashboard';
import UserManagement from './pages/tenant/users/UserManagement';
import RoleManagement from './pages/tenant/roles/RoleManagement';
import ModuleConfiguration from './pages/tenant/modules/ModuleConfiguration';

// User Pages
import UserLogin from './pages/user/auth/UserLogin';
import UserDashboard from './pages/user/dashboard/Dashboard';
import UserProfile from './pages/user/profile/UserProfile';
import UserSettings from './pages/user/settings/UserSettings';
import CrmModule from './pages/user/modules/CrmModule';
import HrmModule from './pages/user/modules/HrmModule';
import AnalyticsModule from './pages/user/modules/AnalyticsModule';
import InventoryModule from './pages/user/modules/InventoryModule';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TenantLayout from './layouts/TenantLayout';
import UserLayout from './layouts/UserLayout';

// Theme definition
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f50057',
      light: '#ff4081',
      dark: '#c51162',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
  },
});

// Auth guard for system admin routes
const AdminAuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard
      authSelector={(state) => ({
        isAuthenticated: Boolean(localStorage.getItem('token')),
        loading: false,
        error: null,
      })}
      redirectTo="/login"
      loadingMessage="Checking admin credentials..."
    >
      {children}
    </AuthGuard>
  );
};

// Auth guard for tenant admin routes
const TenantAuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard
      authSelector={(state) => ({
        isAuthenticated: Boolean(localStorage.getItem('tenant_token')),
        loading: false,
        error: null,
      })}
      redirectTo="/tenant/login"
      loadingMessage="Checking tenant credentials..."
    >
      {children}
    </AuthGuard>
  );
};

// Auth guard for end user routes
const UserAuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard
      authSelector={(state) => ({
        isAuthenticated: Boolean(localStorage.getItem('user_token')),
        loading: false,
        error: null,
      })}
      redirectTo="/user/login"
      loadingMessage="Checking user credentials..."
    >
      {children}
    </AuthGuard>
  );
};

function App() {
  // Create the router with future flags enabled
  const router = createBrowserRouter([
    // Home route
    {
      path: "/",
      element: <HomePage />
    },
    
    // Admin routes
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/admin",
      element: (
        <AdminAuthGuard>
          <AdminLayout />
        </AdminAuthGuard>
      ),
      children: [
        { path: "dashboard", element: <AdminDashboard /> },
        { path: "tenants", element: <TenantManagement /> },
        { path: "tenants/:tenantId/modules", element: <TenantModules /> },
        { path: "packages", element: <PackageManagement /> },
        { path: "modules", element: <ModuleManagement /> }
      ]
    },
    
    // Tenant routes
    {
      path: "/tenant/login",
      element: <TenantLogin />
    },
    {
      path: "/tenant",
      element: (
        <TenantAuthGuard>
          <TenantLayout />
        </TenantAuthGuard>
      ),
      children: [
        { path: "dashboard", element: <TenantDashboard /> },
        { path: "users", element: <UserManagement /> },
        { path: "roles", element: <RoleManagement /> },
        { path: "modules", element: <ModuleConfiguration /> }
      ]
    },
    
    // User routes
    {
      path: "/user/login",
      element: <UserLogin />
    },
    {
      path: "/user",
      element: (
        <UserAuthGuard>
          <UserLayout />
        </UserAuthGuard>
      ),
      children: [
        { path: "dashboard", element: <UserDashboard /> },
        { path: "profile", element: <UserProfile /> },
        { path: "settings", element: <UserSettings /> },
        { path: "crm", element: <CrmModule /> },
        { path: "hrm", element: <HrmModule /> },
        { path: "analytics", element: <AnalyticsModule /> },
        { path: "inventory", element: <InventoryModule /> }
      ]
    },
    
    // Fallback route
    {
      path: "*",
      element: <Navigate to="/" replace />
    }
  ], {
    future: {
      v7_relativeSplatPath: true
    }
  });

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider 
          router={router} 
          future={{ v7_startTransition: true }}
        />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
