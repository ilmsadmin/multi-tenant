import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { packageService } from '../../services/package.service';
import { Package, CreatePackageRequest, UpdatePackageRequest } from '../../types/package.types';

interface PackageState {
  packages: Package[];
  selectedPackage: Package | null;
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const fetchPackages = createAsyncThunk(
  'packages/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await packageService.getAllPackages();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch packages');
    }
  }
);

export const fetchPackageById = createAsyncThunk(
  'packages/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await packageService.getPackageById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch package');
    }
  }
);

export const createPackage = createAsyncThunk(
  'packages/create',
  async (packageData: CreatePackageRequest, { rejectWithValue }) => {
    try {
      return await packageService.createPackage(packageData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create package');
    }
  }
);

export const updatePackage = createAsyncThunk(
  'packages/update',
  async ({ id, data }: { id: number, data: UpdatePackageRequest }, { rejectWithValue }) => {
    try {
      return await packageService.updatePackage(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update package');
    }
  }
);

export const deletePackage = createAsyncThunk(
  'packages/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await packageService.deletePackage(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete package');
    }
  }
);

// Initial state
const initialState: PackageState = {
  packages: [],
  selectedPackage: null,
  isLoading: false,
  error: null,
};

// Slice
const packageSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    clearPackageError: (state) => {
      state.error = null;
    },
    clearSelectedPackage: (state) => {
      state.selectedPackage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all packages
      .addCase(fetchPackages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPackages.fulfilled, (state, action: PayloadAction<Package[]>) => {
        state.isLoading = false;
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch package by ID
      .addCase(fetchPackageById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPackageById.fulfilled, (state, action: PayloadAction<Package>) => {
        state.isLoading = false;
        state.selectedPackage = action.payload;
      })
      .addCase(fetchPackageById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create package
      .addCase(createPackage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPackage.fulfilled, (state, action: PayloadAction<Package>) => {
        state.isLoading = false;
        state.packages.push(action.payload);
      })
      .addCase(createPackage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update package
      .addCase(updatePackage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePackage.fulfilled, (state, action: PayloadAction<Package>) => {
        state.isLoading = false;
        const index = state.packages.findIndex(pkg => pkg.id === action.payload.id);
        if (index !== -1) {
          state.packages[index] = action.payload;
        }
        if (state.selectedPackage?.id === action.payload.id) {
          state.selectedPackage = action.payload;
        }
      })
      .addCase(updatePackage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete package
      .addCase(deletePackage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePackage.fulfilled, (state, action: PayloadAction<number>) => {
        state.isLoading = false;
        state.packages = state.packages.filter(pkg => pkg.id !== action.payload);
        if (state.selectedPackage?.id === action.payload) {
          state.selectedPackage = null;
        }
      })
      .addCase(deletePackage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPackageError, clearSelectedPackage } = packageSlice.actions;
export default packageSlice.reducer;
