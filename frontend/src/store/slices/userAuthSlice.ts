import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { userAuthService } from '../../services/userAuth.service';
import { UserAuthState, UserLoginRequest } from '../../types/userAuth.types';

// Async thunks
export const userLogin = createAsyncThunk(
  'userAuth/login',  async (credentials: UserLoginRequest, { rejectWithValue }) => {
    try {
      const response = await userAuthService.login(credentials);
      // Store token and user info in localStorage
      localStorage.setItem('user_token', response.access_token);
      localStorage.setItem('user_info', JSON.stringify(response.user));
      localStorage.setItem('user_schema_name', credentials.schemaName);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const userLogout = createAsyncThunk(
  'userAuth/logout',
  async () => {
    await userAuthService.logout();
  }
);

export const getUserProfile = createAsyncThunk(
  'userAuth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await userAuthService.getProfile();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user profile');
    }
  }
);

// Initial state
const initialState: UserAuthState = {
  user: JSON.parse(localStorage.getItem('user_info') || 'null'),
  token: localStorage.getItem('user_token'),
  schemaName: localStorage.getItem('user_schema_name'),
  isAuthenticated: !!localStorage.getItem('user_token'),
  isLoading: false,
  error: null,
};

// Slice
const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },    updateUserProfile: (state, action: PayloadAction<any>) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user_info', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    // eslint-disable-next-line no-whitespace-before-property
    builder
      // Login
      .addCase(userLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })      .addCase(userLogin.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.schemaName = localStorage.getItem('user_schema_name');
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
        // Logout
      .addCase(userLogout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.schemaName = null;
        state.isAuthenticated = false;
      })
      
      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
      })      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if ('user' in action.payload) {
          // If it's a UserProfile type with nested user object
          state.user = action.payload.user;
        } else {
          // If it's directly an EndUser type
          state.user = action.payload as any;
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, updateUserProfile } = userAuthSlice.actions;
export default userAuthSlice.reducer;