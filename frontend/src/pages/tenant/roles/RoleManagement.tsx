import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/redux';

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const RoleManagement: React.FC = () => {
  const navigate = useNavigate();
  const { schemaName } = useAppSelector((state) => state.tenantAuth);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  useEffect(() => {
    // This would typically fetch real data from an API
    const fetchRoles = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await api.get(`/tenant/${tenantId}/roles`);
        // setRoles(response.data);
        
        // Simulating API call with mock data
        setTimeout(() => {
          const mockRoles: Role[] = [
            { 
              id: 1, 
              name: 'Admin', 
              description: 'Full system access',
              permissions: ['manage_users', 'manage_roles', 'manage_modules', 'view_reports', 'edit_settings'],
              userCount: 2
            },
            { 
              id: 2, 
              name: 'Manager', 
              description: 'Department management',
              permissions: ['view_users', 'view_reports', 'approve_requests'],
              userCount: 5
            },
            { 
              id: 3, 
              name: 'Employee', 
              description: 'Standard employee access',
              permissions: ['view_own_data', 'create_requests', 'view_announcements'],
              userCount: 18
            },
            { 
              id: 4, 
              name: 'Finance', 
              description: 'Finance department role',
              permissions: ['view_reports', 'manage_payments', 'process_payroll'],
              userCount: 3
            },
            { 
              id: 5, 
              name: 'HR Specialist', 
              description: 'Human resources role',
              permissions: ['view_users', 'manage_timesheets', 'process_onboarding'],
              userCount: 2
            },
          ];
          setRoles(mockRoles);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setIsLoading(false);
      }
    };    fetchRoles();
  }, [schemaName]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const openDeleteDialog = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    
    try {
      // In a real app, you would call your API to delete the role
      // await api.delete(`/tenant/${tenantId}/roles/${roleToDelete.id}`);
      
      // Update the local state to remove the deleted role
      setRoles(roles.filter(role => role.id !== roleToDelete.id));
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  // Filter roles based on search query
  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4">
          Role Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tenant/roles/create')}
        >
          Create New Role
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" alignItems="center">
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search roles..."
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Role Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Users</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRoles
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <Typography variant="subtitle2">{role.name}</Typography>
                  </TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {role.permissions.slice(0, 2).map((permission, index) => (
                        <Chip 
                          key={index} 
                          label={permission.replace('_', ' ')} 
                          size="small" 
                          variant="outlined"
                        />
                      ))}
                      {role.permissions.length > 2 && (
                        <Chip 
                          label={`+${role.permissions.length - 2} more`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography>{role.userCount}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => navigate(`/tenant/roles/${role.id}/edit`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        color="error" 
                        onClick={() => openDeleteDialog(role)}
                        disabled={role.userCount > 0}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            {filteredRoles.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No roles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRoles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the role "{roleToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
          {roleToDelete && roleToDelete.userCount > 0 && (
            <DialogContentText color="error" sx={{ mt: 2 }}>
              This role cannot be deleted because it is assigned to {roleToDelete.userCount} user(s). 
              Please reassign these users to another role first.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteRole} 
            color="error"
            disabled={roleToDelete?.userCount! > 0}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagement;
