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
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { 
  fetchPackages, 
  createPackage, 
  updatePackage, 
  deletePackage,
  clearPackageError
} from '../../../store/slices/packageSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreatePackageRequest, UpdatePackageRequest } from '../../../types/package.types';

const PackageManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { packages, isLoading, error } = useAppSelector((state) => state.packages);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    dispatch(fetchPackages());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setAlertMessage({ type: 'error', message: error });
      setTimeout(() => {
        dispatch(clearPackageError());
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

  const handleEditDialogOpen = (packageId: number) => {
    setSelectedPackage(packageId);
    const pkg = packages.find(p => p.id === packageId);
    if (pkg) {
      editFormik.setValues({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        billing_cycle: pkg.billing_cycle,
        status: pkg.status,
      });
    }
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedPackage(null);
    editFormik.resetForm();
  };

  const handleDeleteDialogOpen = (packageId: number) => {
    setSelectedPackage(packageId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedPackage(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPackage) {
      await dispatch(deletePackage(selectedPackage));
      setAlertMessage({ type: 'success', message: 'Package deleted successfully' });
      handleDeleteDialogClose();
    }
  };

  const addFormik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      billing_cycle: 'monthly' as 'monthly' | 'yearly',
      status: 'active' as 'active' | 'inactive',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      description: Yup.string().required('Description is required'),
      price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
      billing_cycle: Yup.string().oneOf(['monthly', 'yearly']).required('Billing cycle is required'),
      status: Yup.string().oneOf(['active', 'inactive']).required('Status is required'),
    }),
    onSubmit: async (values: CreatePackageRequest) => {
      const resultAction = await dispatch(createPackage(values));
      if (createPackage.fulfilled.match(resultAction)) {
        setAlertMessage({ type: 'success', message: 'Package created successfully' });
        handleAddDialogClose();
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      billing_cycle: 'monthly' as 'monthly' | 'yearly',
      status: 'active' as 'active' | 'inactive',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      description: Yup.string().required('Description is required'),
      price: Yup.number().min(0, 'Price must be positive').required('Price is required'),
      billing_cycle: Yup.string().oneOf(['monthly', 'yearly']).required('Billing cycle is required'),
      status: Yup.string().oneOf(['active', 'inactive']).required('Status is required'),
    }),
    onSubmit: async (values: UpdatePackageRequest) => {
      if (selectedPackage) {
        const resultAction = await dispatch(updatePackage({ 
          id: selectedPackage, 
          data: values 
        }));
        if (updatePackage.fulfilled.match(resultAction)) {
          setAlertMessage({ type: 'success', message: 'Package updated successfully' });
          handleEditDialogClose();
        }
      }
    },
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Package Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          Add Package
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
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Billing Cycle</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>{pkg.id}</TableCell>
                  <TableCell>{pkg.name}</TableCell>
                  <TableCell>{pkg.description}</TableCell>
                  <TableCell>${pkg.price}</TableCell>
                  <TableCell>{pkg.billing_cycle}</TableCell>
                  <TableCell>
                    <Chip 
                      label={pkg.status} 
                      color={pkg.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(pkg.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditDialogOpen(pkg.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteDialogOpen(pkg.id)}
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

      {/* Add Package Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add New Package</DialogTitle>
        <form onSubmit={addFormik.handleSubmit}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please fill in the package details.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Package Name"
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
              id="description"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={addFormik.values.description}
              onChange={addFormik.handleChange}
              onBlur={addFormik.handleBlur}
              error={addFormik.touched.description && Boolean(addFormik.errors.description)}
              helperText={addFormik.touched.description && addFormik.errors.description}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="price"
              name="price"
              label="Price"
              type="number"
              fullWidth
              variant="outlined"
              value={addFormik.values.price}
              onChange={addFormik.handleChange}
              onBlur={addFormik.handleBlur}
              error={addFormik.touched.price && Boolean(addFormik.errors.price)}
              helperText={addFormik.touched.price && addFormik.errors.price}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="billing-cycle-select-label">Billing Cycle</InputLabel>
              <Select
                labelId="billing-cycle-select-label"
                id="billing_cycle"
                name="billing_cycle"
                value={addFormik.values.billing_cycle}
                label="Billing Cycle"
                onChange={addFormik.handleChange}
                onBlur={addFormik.handleBlur}
                error={addFormik.touched.billing_cycle && Boolean(addFormik.errors.billing_cycle)}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
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

      {/* Edit Package Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Package</DialogTitle>
        <form onSubmit={editFormik.handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Package Name"
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
              id="description"
              name="description"
              label="Description"
              type="text"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={editFormik.values.description}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.description && Boolean(editFormik.errors.description)}
              helperText={editFormik.touched.description && editFormik.errors.description}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="price"
              name="price"
              label="Price"
              type="number"
              fullWidth
              variant="outlined"
              value={editFormik.values.price}
              onChange={editFormik.handleChange}
              onBlur={editFormik.handleBlur}
              error={editFormik.touched.price && Boolean(editFormik.errors.price)}
              helperText={editFormik.touched.price && editFormik.errors.price}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="edit-billing-cycle-select-label">Billing Cycle</InputLabel>
              <Select
                labelId="edit-billing-cycle-select-label"
                id="billing_cycle"
                name="billing_cycle"
                value={editFormik.values.billing_cycle}
                label="Billing Cycle"
                onChange={editFormik.handleChange}
                onBlur={editFormik.handleBlur}
                error={editFormik.touched.billing_cycle && Boolean(editFormik.errors.billing_cycle)}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
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
            Are you sure you want to delete this package? Tenants using this package may be affected.
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

export default PackageManagement;
