import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Extension as ExtensionIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  fetchTenants, 
  createTenant, 
  updateTenant, 
  deleteTenant,
  clearTenantError
} from '../../../store/slices/tenantSlice';
import { fetchPackages } from '../../../store/slices/packageSlice';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateTenantRequest, UpdateTenantRequest } from '../../../types/tenant.types';

const TenantManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tenants, isLoading, error } = useAppSelector((state) => state.tenants);
  const { packages } = useAppSelector((state) => state.packages);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    dispatch(fetchTenants());
    dispatch(fetchPackages());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setAlertMessage({ type: 'error', message: error });
      setTimeout(() => {
        dispatch(clearTenantError());
        setAlertMessage(null);
      }, 5000);
    }
  }, [error, dispatch]);

  const handleAddDialogOpen = () => {
    setOpenAddDialog(true);
  };

  const handleAddDialogClose = () => {
    setOpenAddDialog(false);
    addFormik.resetForm();
  };

  const handleEditDialogOpen = (tenantId: number) => {
    setSelectedTenant(tenantId);
    const tenant = tenants.find(t => t.id === tenantId);
    if (tenant) {
      editFormik.setValues({
        name: tenant.name,
        domain: tenant.domain,
        package_id: tenant.package_id,
        status: tenant.status as 'active' | 'inactive',
      });
    }
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedTenant(null);
    editFormik.resetForm();
  };

  const handleDeleteDialogOpen = (tenantId: number) => {
    setSelectedTenant(tenantId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedTenant(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTenant) {
      await dispatch(deleteTenant(selectedTenant));
      setAlertMessage({ type: 'success', message: 'Tenant deleted successfully' });
      handleDeleteDialogClose();
    }
  };

  const addFormik = useFormik({
    initialValues: {
      name: '',
      domain: '',
      package_id: 0,
      status: 'active' as 'active' | 'inactive',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      domain: Yup.string().required('Domain is required'),
      package_id: Yup.number().min(1, 'Package is required'),
      status: Yup.string().oneOf(['active', 'inactive']).required('Status is required'),
    }),
    onSubmit: async (values: CreateTenantRequest) => {
      const resultAction = await dispatch(createTenant(values));
      if (createTenant.fulfilled.match(resultAction)) {
        setAlertMessage({ type: 'success', message: 'Tenant created successfully' });
        handleAddDialogClose();
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      name: '',
      domain: '',
      package_id: 0,
      status: 'active' as 'active' | 'inactive' | 'suspended',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      domain: Yup.string().required('Domain is required'),
      package_id: Yup.number().min(1, 'Package is required'),
      status: Yup.string().oneOf(['active', 'inactive', 'suspended']).required('Status is required'),
    }),
    onSubmit: async (values: UpdateTenantRequest) => {
      if (selectedTenant) {
        const resultAction = await dispatch(updateTenant({ 
          id: selectedTenant, 
          data: values 
        }));
        if (updateTenant.fulfilled.match(resultAction)) {
          setAlertMessage({ type: 'success', message: 'Tenant updated successfully' });
          handleEditDialogClose();
        }
      }
    },
  });

  const handleViewModules = (tenantId: number) => {
    navigate(`/admin/tenants/${tenantId}/modules`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tenant Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          Add Tenant
        </Button>
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
                <TableCell>Name</TableCell>
                <TableCell>Domain</TableCell>
                <TableCell>Schema</TableCell>
                <TableCell>Package</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>{tenant.id}</TableCell>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.domain}</TableCell>
                  <TableCell>{tenant.schema_name}</TableCell>
                  <TableCell>
                    {packages.find(p => p.id === tenant.package_id)?.name || tenant.package_id}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={tenant.status} 
                      color={getStatusColor(tenant.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditDialogOpen(tenant.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="secondary"
                      onClick={() => handleViewModules(tenant.id)}
                    >
                      <ExtensionIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteDialogOpen(tenant.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Tenant Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add New Tenant</DialogTitle>
        <form onSubmit={addFormik.handleSubmit}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please fill in the tenant details.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Tenant Name"
              type="text"
              fullWidth
              variant="outlined"
              value={addFormik.values.name}
              onChange={addFormik.handleChange}
              onBlur={addFormik.handleBlur}
              error={addFormik.touched.name && Boolean(addFormik.errors.name)}
              helperText={addFormik.touched.name && addFormik.errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="domain"
              name="domain"
              label="Domain"
              type="text"
              fullWidth
              variant="outlined"
              value={addFormik.values.domain}
              onChange={addFormik.handleChange}
              onBlur={addFormik.handleBlur}
              error={addFormik.touched.domain && Boolean(addFormik.errors.domain)}
              helperText={addFormik.touched.domain && addFormik.errors.domain}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="package-select-label">Package</InputLabel>
              <Select
                labelId="package-select-label"
                id="package_id"
                name="package_id"
                value={addFormik.values.package_id}
                label="Package"
                onChange={addFormik.handleChange}
                onBlur={addFormik.handleBlur}
                error={addFormik.touched.package_id && Boolean(addFormik.errors.package_id)}
              >
                <MenuItem value={0} disabled>Select a package</MenuItem>
                {packages.map((pkg) => (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.name} (${pkg.price}/{pkg.billing_cycle})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                id="status"
                name="status"
                value={addFormik.values.status}
                label="Status"
                onChange={addFormik.handleChange}
                onBlur={addFormik.handleBlur}
                error={addFormik.touched.status && Boolean(addFormik.errors.status)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddDialogClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!addFormik.isValid || addFormik.isSubmitting}
            >
              {addFormik.isSubmitting ? <CircularProgress size={24} /> : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Tenant Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Tenant</DialogTitle>
        <form onSubmit={editFormik.handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Tenant Name"
              type="text"
              fullWidth
              variant="outlined"
              value={editFormik.values.name}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.name && Boolean(editFormik.errors.name)}
              helperText={editFormik.touched.name && editFormik.errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="domain"
              name="domain"
              label="Domain"
              type="text"
              fullWidth
              variant="outlined"
              value={editFormik.values.domain}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.domain && Boolean(editFormik.errors.domain)}
              helperText={editFormik.touched.domain && editFormik.errors.domain}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="edit-package-select-label">Package</InputLabel>
              <Select
                labelId="edit-package-select-label"
                id="package_id"
                name="package_id"
                value={editFormik.values.package_id}
                label="Package"
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                error={editFormik.touched.package_id && Boolean(editFormik.errors.package_id)}
              >
                {packages.map((pkg) => (
                  <MenuItem key={pkg.id} value={pkg.id}>
                    {pkg.name} (${pkg.price}/{pkg.billing_cycle})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="edit-status-select-label">Status</InputLabel>
              <Select
                labelId="edit-status-select-label"
                id="status"
                name="status"
                value={editFormik.values.status}
                label="Status"
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                error={editFormik.touched.status && Boolean(editFormik.errors.status)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditDialogClose}>Cancel</Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={!editFormik.isValid || editFormik.isSubmitting}
            >
              {editFormik.isSubmitting ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this tenant? This action cannot be undone and will permanently remove all tenant data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TenantManagement;
