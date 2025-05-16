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
  fetchModules, 
  createModule, 
  updateModule, 
  deleteModule,
  clearModuleError
} from '../../../store/slices/moduleSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CreateModuleRequest, UpdateModuleRequest } from '../../../types/module.types';

const ModuleManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { modules, isLoading, error } = useAppSelector((state) => state.modules);
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [alertMessage, setAlertMessage] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    dispatch(fetchModules());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setAlertMessage({ type: 'error', message: error });
      setTimeout(() => {
        dispatch(clearModuleError());
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

  const handleEditDialogOpen = (moduleId: number) => {
    setSelectedModule(moduleId);
    const module = modules.find(m => m.id === moduleId);
    if (module) {
      editFormik.setValues({
        name: module.name,
        description: module.description,
        status: module.status,
      });
    }
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
    setSelectedModule(null);
    editFormik.resetForm();
  };

  const handleDeleteDialogOpen = (moduleId: number) => {
    setSelectedModule(moduleId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
    setSelectedModule(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedModule) {
      await dispatch(deleteModule(selectedModule));
      setAlertMessage({ type: 'success', message: 'Module deleted successfully' });
      handleDeleteDialogClose();
    }
  };

  const addFormik = useFormik({
    initialValues: {
      name: '',
      description: '',
      status: 'active' as 'active' | 'inactive',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      description: Yup.string().required('Description is required'),
      status: Yup.string().oneOf(['active', 'inactive']).required('Status is required'),
    }),
    onSubmit: async (values: CreateModuleRequest) => {
      const resultAction = await dispatch(createModule(values));
      if (createModule.fulfilled.match(resultAction)) {
        setAlertMessage({ type: 'success', message: 'Module created successfully' });
        handleAddDialogClose();
      }
    },
  });

  const editFormik = useFormik({
    initialValues: {
      name: '',
      description: '',
      status: 'active' as 'active' | 'inactive',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      description: Yup.string().required('Description is required'),
      status: Yup.string().oneOf(['active', 'inactive']).required('Status is required'),
    }),
    onSubmit: async (values: UpdateModuleRequest) => {
      if (selectedModule) {
        const resultAction = await dispatch(updateModule({ 
          id: selectedModule, 
          data: values 
        }));
        if (updateModule.fulfilled.match(resultAction)) {
          setAlertMessage({ type: 'success', message: 'Module updated successfully' });
          handleEditDialogClose();
        }
      }
    },
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Module Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddDialogOpen}
        >
          Add Module
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
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
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
                      label={module.status} 
                      color={module.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(module.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      onClick={() => handleEditDialogOpen(module.id)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteDialogOpen(module.id)}
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

      {/* Add Module Dialog */}
      <Dialog open={openAddDialog} onClose={handleAddDialogClose}>
        <DialogTitle>Add New Module</DialogTitle>
        <form onSubmit={addFormik.handleSubmit}>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Please fill in the module details.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Module Name"
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

      {/* Edit Module Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle>Edit Module</DialogTitle>
        <form onSubmit={editFormik.handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              name="name"
              label="Module Name"
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
            Are you sure you want to delete this module? Tenants using this module may be affected.
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

export default ModuleManagement;
