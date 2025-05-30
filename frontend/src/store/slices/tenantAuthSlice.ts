// filepath: d:\www\multi-tenant\frontend\src\store\slices\tenantAuthSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tenantAuthService } from '../../services/tenantAuth.service';
import { TenantAuthState, TenantLoginRequest } from '../../types/tenantAuth.types';

// Async thunks
export const tenantLogin = createAsyncThunk(
  'tenantAuth/login',
  async (credentials: TenantLoginRequest, { rejectWithValue }) => {
    try {
      const response = await tenantAuthService.login(credentials);
      // Store token and user info in localStorage
      localStorage.setItem('tenant_token', response.access_token);
      localStorage.setItem('tenant_user', JSON.stringify(response.user));
      localStorage.setItem('schema_name', credentials.schemaName);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const tenantLogout = createAsyncThunk(
  'tenantAuth/logout',
  async () => {
    await tenantAuthService.logout();
  }
);

export const getTenantCurrentUser = createAsyncThunk(
  'tenantAuth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      return await tenantAuthService.getCurrentUser();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get current user');
    }
  }
);

// Initial state
const initialState: TenantAuthState = {
  user: JSON.parse(localStorage.getItem('tenant_user') || 'null'),
  token: localStorage.getItem('tenant_token'),
  schemaName: localStorage.getItem('schema_name'),
  isAuthenticated: !!localStorage.getItem('tenant_token'),
  isLoading: false,
  error: null,
};

// Slice
const tenantAuthSlice = createSlice({
  name: 'tenantAuth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(tenantLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(tenantLogin.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.schemaName = localStorage.getItem('schema_name');
      })
      .addCase(tenantLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(tenantLogout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.schemaName = null;
        state.isAuthenticated = false;
      })
      
      // Get current user
      .addCase(getTenantCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTenantCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.schemaName = localStorage.getItem('schema_name');
      })
      .addCase(getTenantCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.schemaName = null;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = tenantAuthSlice.actions;
export default tenantAuthSlice.reducer;