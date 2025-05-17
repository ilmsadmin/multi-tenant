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
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks/redux';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate();
  const { schemaName } = useAppSelector((state) => state.tenantAuth);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    // This would typically fetch real data from an API
    const fetchUsers = async () => {
      try {
        // In a real app, you would fetch this data from your API
        // const response = await api.get(`/tenant/${tenantId}/users`);
        // setUsers(response.data);
        
        // Simulating API call with mock data
        setTimeout(() => {
          const mockUsers: User[] = [
            { id: 1, username: 'admin', email: 'admin@example.com', role: 'Admin', status: 'active', lastLogin: '2025-05-15 10:23:45' },
            { id: 2, username: 'manager', email: 'manager@example.com', role: 'Manager', status: 'active', lastLogin: '2025-05-14 15:30:22' },
            { id: 3, username: 'user1', email: 'user1@example.com', role: 'Employee', status: 'active', lastLogin: '2025-05-13 09:15:33' },
            { id: 4, username: 'user2', email: 'user2@example.com', role: 'Employee', status: 'inactive', lastLogin: '2025-05-10 11:45:18' },
            { id: 5, username: 'finance', email: 'finance@example.com', role: 'Finance', status: 'active', lastLogin: '2025-05-15 08:20:51' },
          ];
          setUsers(mockUsers);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching users:', error);
        setIsLoading(false);
      }
    };    fetchUsers();
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

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // In a real app, you would call your API to delete the user
      // await api.delete(`/tenant/${tenantId}/users/${userToDelete.id}`);
      
      // Update the local state to remove the deleted user
      setUsers(users.filter(user => user.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
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
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/tenant/users/create')}
        >
          Add New User
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" alignItems="center">
          <SearchIcon sx={{ color: 'action.active', mr: 1 }} />
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search users..."
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
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton onClick={() => navigate(`/tenant/users/${user.id}/edit`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => openDeleteDialog(user)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
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
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{userToDelete?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
