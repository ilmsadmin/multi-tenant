import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login } from '../../store/slices/authSlice';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [loginError, setLoginError] = useState<string | null>(null);  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      schemaName: 'default_tenant', // Sử dụng tên schema mặc định thay vì ID
    },
    validationSchema: Yup.object({
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required'),
      schemaName: Yup.string().required('Tenant name is required'),
    }),    onSubmit: async (values) => {
      setLoginError(null);
      try {
        const resultAction = await dispatch(login(values));
        if (login.fulfilled.match(resultAction)) {
          navigate('/admin/dashboard');
        } else if (login.rejected.match(resultAction)) {
          // Handle the rejected action properly
          const errorMessage = resultAction.payload || 'Invalid username or password';
          setLoginError(typeof errorMessage === 'string' ? errorMessage : 'Authentication failed');
        }
      } catch (error) {
        setLoginError('An error occurred during login');
      }
    },
  });

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            System Admin
          </Typography>          <Typography variant="subtitle1" color="text.secondary">
            Login to manage your multi-tenant system
          </Typography>
        </Box>

        {(error || loginError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || loginError}
          </Alert>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit(e);
        }}>          <TextField
            fullWidth
            id="schemaName"
            name="schemaName"
            label="Tenant Name"
            variant="outlined"
            margin="normal"
            value={formik.values.schemaName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.schemaName && Boolean(formik.errors.schemaName)}
            helperText={formik.touched.schemaName && formik.errors.schemaName}
          />

          <TextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            variant="outlined"
            margin="normal"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
