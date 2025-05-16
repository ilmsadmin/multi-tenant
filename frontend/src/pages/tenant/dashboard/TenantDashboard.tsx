import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Card,
  CardContent,
  CardHeader,
  Button
} from '@mui/material';
import { 
  People as PeopleIcon, 
  Security as SecurityIcon, 
  Extension as ExtensionIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/redux';
import { Grid } from '../../../components/shared';

const TenantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, tenantId } = useAppSelector((state) => state.tenantAuth);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRoles: 0,
    activeModules: 0
  });

  useEffect(() => {
    // This would typically fetch real data from an API
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await api.get(`/tenant/${tenantId}/dashboard/stats`);
        // setStats(response.data);
        
        // Simulating API call with mock data
        setTimeout(() => {
          setStats({
            totalUsers: 12,
            totalRoles: 5,
            activeModules: 3
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenantId]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Welcome to Your Tenant Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Manage your tenant settings, users, roles, and module configurations.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={4}>
          <Card>
            <CardHeader 
              title="Users" 
              avatar={<PeopleIcon color="primary" />} 
            />
            <CardContent>
              <Typography variant="h3" align="center">
                {stats.totalUsers}
              </Typography>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="outlined" onClick={() => navigate('/tenant/users')}>
                  Manage Users
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardHeader 
              title="Roles" 
              avatar={<SecurityIcon color="primary" />} 
            />
            <CardContent>
              <Typography variant="h3" align="center">
                {stats.totalRoles}
              </Typography>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="outlined" onClick={() => navigate('/tenant/roles')}>
                  Manage Roles
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardHeader 
              title="Active Modules" 
              avatar={<ExtensionIcon color="primary" />} 
            />
            <CardContent>
              <Typography variant="h3" align="center">
                {stats.activeModules}
              </Typography>
              <Box display="flex" justifyContent="center" mt={2}>
                <Button variant="outlined" onClick={() => navigate('/tenant/modules')}>
                  Configure Modules
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} mt={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} mt={1}>
              <Grid item>
                <Button variant="contained" onClick={() => navigate('/tenant/users/create')}>
                  Add New User
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={() => navigate('/tenant/roles/create')}>
                  Create New Role
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={() => navigate('/tenant/modules')}>
                  Configure Modules
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TenantDashboard;
