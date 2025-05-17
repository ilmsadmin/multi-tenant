import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  TextField,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Extension as ExtensionIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAppSelector } from '../../../hooks/redux';
import { Grid } from '../../../components/shared';

interface Module {
  id: number;
  name: string;
  description: string;
  isEnabled: boolean;
  settings: {
    [key: string]: any;
  };
}

const ModuleConfiguration: React.FC = () => {
  const { schemaName } = useAppSelector((state) => state.tenantAuth);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    // This would typically fetch real data from an API
    const fetchModules = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await api.get(`/tenant/${tenantId}/modules`);
        // setModules(response.data);
        
        // Simulating API call with mock data
        setTimeout(() => {
          const mockModules: Module[] = [
            {
              id: 1,
              name: 'CRM',
              description: 'Customer Relationship Management module for managing customer interactions',
              isEnabled: true,
              settings: {
                enableEmailNotifications: true,
                customerRecordRetention: 90,
                contactSyncInterval: 'daily'
              }
            },
            {
              id: 2,
              name: 'HRM',
              description: 'Human Resource Management for employee management and payroll',
              isEnabled: true,
              settings: {
                enableEmployeeSelfService: true,
                timeTrackingEnabled: true,
                payrollProcessingDay: 25
              }
            },
            {
              id: 3,
              name: 'Analytics',
              description: 'Business analytics and reporting tools',
              isEnabled: false,
              settings: {
                dataSources: ['sales', 'customers', 'inventory'],
                refreshInterval: 'hourly',
                retentionPeriod: 365
              }
            },
            {
              id: 4,
              name: 'Inventory',
              description: 'Inventory tracking and management',
              isEnabled: true,
              settings: {
                lowStockAlerts: true,
                autoReorderEnabled: false,
                stockCountSchedule: 'monthly'
              }
            },
            {
              id: 5,
              name: 'Ecommerce',
              description: 'Online store and ecommerce capabilities',
              isEnabled: false,
              settings: {
                paymentGateways: ['stripe', 'paypal'],
                taxCalculationMethod: 'automatic',
                shippingOptionsEnabled: true
              }
            }
          ];
          setModules(mockModules);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching modules:', error);
        setIsLoading(false);
      }
    };    fetchModules();
  }, [schemaName]);
  const handleModuleToggle = async (moduleId: number, newStatus: boolean) => {
    try {
      // In a real app, you would call your API to update the module status
      // await api.patch(`/tenant/modules/${moduleId}`, { isEnabled: newStatus });
      
      // Update local state
      setModules(modules.map(module => 
        module.id === moduleId ? { ...module, isEnabled: newStatus } : module
      ));
      
      showSnackbar(`Module ${newStatus ? 'enabled' : 'disabled'} successfully`, 'success');
    } catch (error) {
      console.error('Error updating module status:', error);
      showSnackbar('Failed to update module status', 'error');
    }
  };

  const openSettingsDialog = (module: Module) => {
    setSelectedModule(module);
    setSettingsDialogOpen(true);
  };

  const handleSettingsSave = async () => {
    if (!selectedModule) return;
    
    try {
      // In a real app, you would call your API to update module settings
      // await api.patch(`/tenant/${tenantId}/modules/${selectedModule.id}/settings`, selectedModule.settings);
      
      // Update local state
      setModules(modules.map(module => 
        module.id === selectedModule.id ? { ...module, settings: selectedModule.settings } : module
      ));
      
      setSettingsDialogOpen(false);
      showSnackbar('Module settings updated successfully', 'success');
    } catch (error) {
      console.error('Error updating module settings:', error);
      showSnackbar('Failed to update module settings', 'error');
    }
  };

  const updateModuleSetting = (key: string, value: any) => {
    if (!selectedModule) return;
    
    setSelectedModule({
      ...selectedModule,
      settings: {
        ...selectedModule.settings,
        [key]: value
      }
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

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
          Module Configuration
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Enable, disable, or configure modules for your tenant
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {modules.map((module) => (
          <Grid item key={module.id} xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ExtensionIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
                  <Typography variant="h6" component="div">
                    {module.name}
                  </Typography>
                  <Box flexGrow={1} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={module.isEnabled}
                        onChange={(e) => handleModuleToggle(module.id, e.target.checked)}
                        color="primary"
                      />
                    }
                    label={module.isEnabled ? "Enabled" : "Disabled"}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {module.description}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Settings Preview
                </Typography>
                <Box sx={{ pl: 2 }}>
                  {Object.entries(module.settings).slice(0, 2).map(([key, value]) => (
                    <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
                      <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {
                        typeof value === 'boolean' 
                          ? (value ? 'Yes' : 'No')
                          : Array.isArray(value) 
                            ? value.join(', ')
                            : value
                      }
                    </Typography>
                  ))}
                  {Object.keys(module.settings).length > 2 && (
                    <Typography variant="body2" color="primary">
                      and {Object.keys(module.settings).length - 2} more settings...
                    </Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  startIcon={<SettingsIcon />}
                  onClick={() => openSettingsDialog(module)}
                  disabled={!module.isEnabled}
                >
                  Configure
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Module Settings Dialog */}
      <Dialog 
        open={settingsDialogOpen} 
        onClose={() => setSettingsDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedModule?.name} Settings
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText paragraph>
            Configure the settings for this module to customize its behavior for your tenant.
          </DialogContentText>
          
          {selectedModule && Object.entries(selectedModule.settings).map(([key, value]) => {
            // Render different input types based on value type
            if (typeof value === 'boolean') {
              return (
                <FormControlLabel
                  key={key}
                  control={
                    <Switch
                      checked={value}
                      onChange={(e) => updateModuleSetting(key, e.target.checked)}
                      color="primary"
                    />
                  }
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  sx={{ display: 'block', mb: 2 }}
                />
              );
            } else if (typeof value === 'number') {
              return (
                <TextField
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  type="number"
                  fullWidth
                  value={value}
                  onChange={(e) => updateModuleSetting(key, parseInt(e.target.value))}
                  margin="normal"
                />
              );
            } else if (Array.isArray(value)) {
              return (
                <TextField
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  fullWidth
                  value={value.join(', ')}
                  disabled
                  margin="normal"
                  helperText="Array values can be edited via API only"
                />
              );
            } else {
              return (
                <TextField
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  fullWidth
                  value={value}
                  onChange={(e) => updateModuleSetting(key, e.target.value)}
                  margin="normal"
                />
              );
            }
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSettingsSave} variant="contained">Save Settings</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModuleConfiguration;
