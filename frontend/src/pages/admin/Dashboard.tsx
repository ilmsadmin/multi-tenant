import React, { useEffect } from 'react';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { 
  Business as BusinessIcon, 
  Inventory as InventoryIcon, 
  Extension as ExtensionIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchTenants } from '../../store/slices/tenantSlice';
import { fetchPackages } from '../../store/slices/packageSlice';
import { Grid } from '../../components/shared';
import { fetchModules } from '../../store/slices/moduleSlice';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tenants, isLoading: tenantsLoading } = useAppSelector((state) => state.tenants);
  const { packages, isLoading: packagesLoading } = useAppSelector((state) => state.packages);
  const { modules, isLoading: modulesLoading } = useAppSelector((state) => state.modules);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchTenants());
    dispatch(fetchPackages());
    dispatch(fetchModules());
  }, [dispatch]);

  const isLoading = tenantsLoading || packagesLoading || modulesLoading;

  const stats = [
    { 
      title: 'Total Tenants', 
      value: tenants.length, 
      icon: <BusinessIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: '#bbdefb'
    },
    { 
      title: 'Active Packages', 
      value: packages.filter(p => p.status === 'active').length,
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: '#c8e6c9'
    },
    { 
      title: 'Available Modules', 
      value: modules.length,
      icon: <ExtensionIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: '#fff9c4'
    },
    { 
      title: 'System Admins', 
      value: 1, // Assuming at least the current user
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: '#e1f5fe'
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {user?.username || 'Admin'}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        System overview and statistics
      </Typography>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 140,
                  bgcolor: stat.color,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography component="h2" variant="h6" color="text.primary" gutterBottom>
                    {stat.title}
                  </Typography>
                  {stat.icon}
                </Box>
                <Typography component="p" variant="h3">
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Additional dashboard content can be added here */}
    </Box>
  );
};

export default Dashboard;
