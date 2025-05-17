import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link
} from '@mui/material';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  fetchTenantById,
} from '../../../store/slices/tenantSlice';
import { 
  fetchModules,
  fetchTenantModules,
  activateModuleForTenant,
  updateTenantModuleStatus,
  clearModuleError
} from '../../../store/slices/moduleSlice';

const TenantModules: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const dispatch = useAppDispatch();
  
  const { selectedTenant } = useAppSelector((state) => state.tenants);
  const { modules, tenantModules, isLoading, error } = useAppSelector((state) => state.modules);
  
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);  useEffect(() => {
    if (tenantId) {
      dispatch(fetchTenantById(parseInt(tenantId)));
      dispatch(fetchModules());
    }
  }, [dispatch, tenantId]);

  // Theo dõi sự thay đổi của selectedTenant để lấy modules
  useEffect(() => {
    if (selectedTenant && selectedTenant.schema_name) {
      dispatch(fetchTenantModules(selectedTenant.schema_name));
    }
  }, [dispatch, selectedTenant]);

  useEffect(() => {
    if (error) {
      setAlertMessage({ type: 'error', message: error });
      setTimeout(() => {
        dispatch(clearModuleError());
        setAlertMessage(null);
      }, 5000);
    }
  }, [error, dispatch]);
  const handleModuleStatusChange = async (moduleId: number, checked: boolean) => {
    if (!tenantId || !selectedTenant?.schema_name) return;
    
    const tenantModule = tenantModules.find(
      tm => tm.module_id === moduleId && tm.schema_name === selectedTenant.schema_name
    );
    
    if (tenantModule) {      // Update existing tenant module
      const resultAction = await dispatch(updateTenantModuleStatus({
        schemaName: selectedTenant?.schema_name || '',
        moduleId: moduleId,
        status: checked ? 'active' : 'inactive'
      }));
      
      if (updateTenantModuleStatus.fulfilled.match(resultAction)) {
        setAlertMessage({ 
          type: 'success', 
          message: `Module ${checked ? 'activated' : 'deactivated'} successfully` 
        });
      }
    } else {      // Create new tenant module activation
      const resultAction = await dispatch(activateModuleForTenant({
        schema_name: selectedTenant?.schema_name || '',
        module_id: moduleId,
        status: checked ? 'active' : 'inactive'
      }));
      
      if (activateModuleForTenant.fulfilled.match(resultAction)) {
        setAlertMessage({ 
          type: 'success', 
          message: `Module ${checked ? 'activated' : 'deactivated'} successfully` 
        });
      }
    }
  };

  const isModuleActive = (moduleId: number): boolean => {
    const tenantModule = tenantModules.find(
      tm => tm.module_id === moduleId && tm.tenant_id === parseInt(tenantId || '0')
    );
    return tenantModule ? tenantModule.status === 'active' : false;
  };

  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/admin/tenants">
          Tenants
        </Link>
        <Typography color="text.primary">Modules for {selectedTenant?.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          Modules for {selectedTenant?.name}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage modules activation for this tenant
        </Typography>
      </Box>

      {alertMessage && (
        <Alert 
          severity={alertMessage.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlertMessage(null)}
        >
          {alertMessage.message}
        </Alert>
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Module Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell>{module.id}</TableCell>
                  <TableCell>{module.name}</TableCell>
                  <TableCell>{module.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={isModuleActive(module.id) ? 'Active' : 'Inactive'} 
                      color={isModuleActive(module.id) ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isModuleActive(module.id)}
                          onChange={(e) => handleModuleStatusChange(module.id, e.target.checked)}
                          color="primary"
                        />
                      }
                      label={isModuleActive(module.id) ? 'Enabled' : 'Disabled'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TenantModules;
