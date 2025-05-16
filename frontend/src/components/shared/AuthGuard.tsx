import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert,
  AlertTitle,
  Button,
  Paper
} from '@mui/material';

interface AuthGuardProps {
  children: React.ReactNode;
  authSelector: (state: any) => { isAuthenticated: boolean; loading: boolean; error: string | null };
  redirectTo: string;
  loadingMessage?: string;
  errorMessage?: string;
  requiresPermissions?: string[];
}

/**
 * A reusable authentication guard component that can be used to protect routes
 * based on authentication state and permissions
 */
const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  authSelector,
  redirectTo,
  loadingMessage = 'Checking authentication...',
  errorMessage = 'Authentication failed',
  requiresPermissions = []
}) => {
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [permissionsError, setPermissionsError] = useState<string | null>(null);
  
  const { isAuthenticated, loading, error } = useAppSelector(authSelector);
  
  // Check permissions if needed
  useEffect(() => {
    // Only check permissions if the user is authenticated and permissions are required
    if (isAuthenticated && requiresPermissions.length > 0) {
      // In a real app, you would check if the user has the required permissions
      // This is just a placeholder implementation
      const checkPermissions = async () => {
        try {
          // Mock a permission check
          const hasPermission = true; // Replace with actual permission check
          
          if (!hasPermission) {
            setPermissionsError('You do not have permission to access this resource');
          } else {
            setPermissionsError(null);
          }
        } catch (err) {
          setPermissionsError('Error checking permissions');
        } finally {
          setIsVerifying(false);
        }
      };
      
      checkPermissions();
    } else {
      setIsVerifying(false);
    }
  }, [isAuthenticated, requiresPermissions]);
  
  // Handle loading state
  if (loading || isVerifying) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {loadingMessage}
        </Typography>
      </Box>
    );
  }
  
  // Handle authentication error
  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          p: 3
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Authentication Error</AlertTitle>
            {error}
          </Alert>
          <Typography variant="body1" gutterBottom>
            {errorMessage}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component="a" 
            href={redirectTo}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Box>
    );
  }
  
  // Handle permission error
  if (permissionsError) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          p: 3
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 500 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <AlertTitle>Access Denied</AlertTitle>
            {permissionsError}
          </Alert>
          <Typography variant="body1" gutterBottom>
            You don't have the necessary permissions to access this page.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component="a" 
            href="/"
            sx={{ mt: 2 }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  // Render children if authenticated and has necessary permissions
  return <>{children}</>;
};

export default AuthGuard;
