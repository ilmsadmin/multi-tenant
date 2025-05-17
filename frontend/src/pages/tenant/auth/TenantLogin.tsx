import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { tenantLogin } from '../../../store/slices/tenantAuthSlice';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const TenantLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.tenantAuth);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Lấy tham số schema từ URL
  const queryParams = new URLSearchParams(location.search);
  const schemaFromUrl = queryParams.get('schema') || '';
  
  const formik = useFormik({
    initialValues: {
      schemaName: schemaFromUrl,
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      schemaName: Yup.string().required('Tenant name is required'),
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      setLoginError(null);
      try {
        const resultAction = await dispatch(tenantLogin(values));
        if (tenantLogin.fulfilled.match(resultAction)) {
          navigate('/tenant/dashboard');        } else {
          setLoginError('Invalid tenant name, username or password');
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
            Tenant Admin
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Login to manage your tenant
          </Typography>
        </Box>

        {(error || loginError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || loginError}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>          <TextField
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
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default TenantLogin;
