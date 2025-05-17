import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { moduleService } from '../../services/module.service';
import { 
  Module, 
  TenantModule,
  CreateModuleRequest, 
  UpdateModuleRequest,
  TenantModuleActivationRequest
} from '../../types/module.types';

interface ModuleState {
  modules: Module[];
  tenantModules: TenantModule[];
  selectedModule: Module | null;
  isLoading: boolean;
  error: string | null;
}

// Async thunks for modules
export const fetchModules = createAsyncThunk(
  'modules/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await moduleService.getAllModules();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch modules');
    }
  }
);

export const fetchModuleById = createAsyncThunk(
  'modules/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await moduleService.getModuleById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch module');
    }
  }
);

export const createModule = createAsyncThunk(
  'modules/create',
  async (moduleData: CreateModuleRequest, { rejectWithValue }) => {
    try {
      return await moduleService.createModule(moduleData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create module');
    }
  }
);

export const updateModule = createAsyncThunk(
  'modules/update',
  async ({ id, data }: { id: number, data: UpdateModuleRequest }, { rejectWithValue }) => {
    try {
      return await moduleService.updateModule(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update module');
    }
  }
);

export const deleteModule = createAsyncThunk(
  'modules/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await moduleService.deleteModule(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete module');
    }
  }
);

// Async thunks for tenant modules
export const fetchTenantModules = createAsyncThunk(
  'modules/fetchTenantModules',
  async (schemaName: string, { rejectWithValue }) => {
    try {
      return await moduleService.getTenantModules(schemaName);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tenant modules');
    }
  }
);

export const activateModuleForTenant = createAsyncThunk(
  'modules/activateForTenant',
  async (data: TenantModuleActivationRequest, { rejectWithValue }) => {
    try {
      return await moduleService.activateModuleForTenant(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to activate module for tenant');
    }
  }
);

export const updateTenantModuleStatus = createAsyncThunk(
  'modules/updateTenantModuleStatus',
  async (
    { schemaName, moduleId, status }: 
    { schemaName: string, moduleId: number, status: 'active' | 'inactive' }, 
    { rejectWithValue }
  ) => {
    try {
      return await moduleService.updateTenantModuleStatus(schemaName, moduleId, status);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update tenant module status');
    }
  }
);

// Initial state
const initialState: ModuleState = {
  modules: [],
  tenantModules: [],
  selectedModule: null,
  isLoading: false,
  error: null,
};

// Slice
const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    clearModuleError: (state) => {
      state.error = null;
    },
    clearSelectedModule: (state) => {
      state.selectedModule = null;
    },
    clearTenantModules: (state) => {
      state.tenantModules = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all modules
      .addCase(fetchModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action: PayloadAction<Module[]>) => {
        state.isLoading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch module by ID
      .addCase(fetchModuleById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchModuleById.fulfilled, (state, action: PayloadAction<Module>) => {
        state.isLoading = false;
        state.selectedModule = action.payload;
      })
      .addCase(fetchModuleById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create module
      .addCase(createModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createModule.fulfilled, (state, action: PayloadAction<Module>) => {
        state.isLoading = false;
        state.modules.push(action.payload);
      })
      .addCase(createModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update module
      .addCase(updateModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateModule.fulfilled, (state, action: PayloadAction<Module>) => {
        state.isLoading = false;
        const index = state.modules.findIndex(module => module.id === action.payload.id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
        if (state.selectedModule?.id === action.payload.id) {
          state.selectedModule = action.payload;
        }
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete module
      .addCase(deleteModule.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteModule.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.modules = state.modules.filter(module => module.id !== action.payload);
        if (state.selectedModule?.id === action.payload) {
          state.selectedModule = null;
        }
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch tenant modules
      .addCase(fetchTenantModules.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantModules.fulfilled, (state, action: PayloadAction<TenantModule[]>) => {
        state.isLoading = false;
        state.tenantModules = action.payload;
      })
      .addCase(fetchTenantModules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Activate module for tenant
      .addCase(activateModuleForTenant.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(activateModuleForTenant.fulfilled, (state, action: PayloadAction<TenantModule>) => {
        state.isLoading = false;
        state.tenantModules.push(action.payload);
      })
      .addCase(activateModuleForTenant.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update tenant module status
      .addCase(updateTenantModuleStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTenantModuleStatus.fulfilled, (state, action: PayloadAction<TenantModule>) => {
        state.isLoading = false;
        const index = state.tenantModules.findIndex(
          tm => tm.tenant_id === action.payload.tenant_id && tm.module_id === action.payload.module_id
        );
        if (index !== -1) {
          state.tenantModules[index] = action.payload;
        }
      })
      .addCase(updateTenantModuleStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearModuleError, clearSelectedModule, clearTenantModules } = moduleSlice.actions;
export default moduleSlice.reducer;
