import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tenantService } from '../../services/tenant.service';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '../../types/tenant.types';

interface TenantState {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const fetchTenants = createAsyncThunk(
  'tenants/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await tenantService.getAllTenants();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenants');
    }
  }
);

export const fetchTenantById = createAsyncThunk(
  'tenants/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await tenantService.getTenantById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant');
    }
  }
);

export const createTenant = createAsyncThunk(
  'tenants/create',
  async (tenant: CreateTenantRequest, { rejectWithValue }) => {
    try {
      return await tenantService.createTenant(tenant);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create tenant');
    }
  }
);

export const updateTenant = createAsyncThunk(
  'tenants/update',
  async ({ id, data }: { id: number, data: UpdateTenantRequest }, { rejectWithValue }) => {
    try {
      return await tenantService.updateTenant(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tenant');
    }
  }
);

export const deleteTenant = createAsyncThunk(
  'tenants/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await tenantService.deleteTenant(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete tenant');
    }
  }
);

// Initial state
const initialState: TenantState = {
  tenants: [],
  selectedTenant: null,
  isLoading: false,
  error: null,
};

// Slice
const tenantSlice = createSlice({
  name: 'tenants',
  initialState,
  reducers: {
    clearTenantError: (state) => {
      state.error = null;
    },
    clearSelectedTenant: (state) => {
      state.selectedTenant = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tenants
      .addCase(fetchTenants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action: PayloadAction<Tenant[]>) => {
        state.isLoading = false;
        state.tenants = action.payload;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch tenant by ID
      .addCase(fetchTenantById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantById.fulfilled, (state, action: PayloadAction<Tenant>) => {
        state.isLoading = false;
        state.selectedTenant = action.payload;
      })
      .addCase(fetchTenantById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create tenant
      .addCase(createTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTenant.fulfilled, (state, action: PayloadAction<Tenant>) => {
        state.isLoading = false;
        state.tenants.push(action.payload);
      })
      .addCase(createTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update tenant
      .addCase(updateTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTenant.fulfilled, (state, action: PayloadAction<Tenant>) => {
        state.isLoading = false;
        const index = state.tenants.findIndex(tenant => tenant.id === action.payload.id);
        if (index !== -1) {
          state.tenants[index] = action.payload;
        }
        if (state.selectedTenant?.id === action.payload.id) {
          state.selectedTenant = action.payload;
        }
      })
      .addCase(updateTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete tenant
      .addCase(deleteTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTenant.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.tenants = state.tenants.filter(tenant => tenant.id !== action.payload);
        if (state.selectedTenant?.id === action.payload) {
          state.selectedTenant = null;
        }
      })
      .addCase(deleteTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTenantError, clearSelectedTenant } = tenantSlice.actions;
export default tenantSlice.reducer;
