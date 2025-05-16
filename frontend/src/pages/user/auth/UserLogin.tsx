import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks/redux';
import { userLogin } from '../../../store/slices/userAuthSlice';
import { Box, Paper, Typography, TextField, Button, Alert, CircularProgress, Link } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Grid } from '../../../components/shared';

const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.userAuth);
  const [loginError, setLoginError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      tenantId: '',
      username: '',
      password: '',
    },
    validationSchema: Yup.object({
      tenantId: Yup.string().required('Tenant ID is required'),
      username: Yup.string().required('Username is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      setLoginError(null);
      try {
        const resultAction = await dispatch(userLogin(values));
        if (userLogin.fulfilled.match(resultAction)) {
          navigate('/dashboard');
        } else {
          setLoginError('Invalid tenant ID, username or password');
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
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          borderRadius: 2,
        }}
      >
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Log in to access your account
          </Typography>
        </Box>

        {(error || loginError) && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || loginError}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="tenantId"
            name="tenantId"
            label="Tenant ID"
            variant="outlined"
            margin="normal"
            value={formik.values.tenantId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.tenantId && Boolean(formik.errors.tenantId)}
            helperText={formik.touched.tenantId && formik.errors.tenantId}
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
            size="large"
            sx={{ mt: 3, mb: 2, borderRadius: 2, py: 1.2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Log In'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account? Contact your tenant administrator
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default UserLogin;
