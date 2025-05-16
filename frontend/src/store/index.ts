import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import tenantReducer from './slices/tenantSlice';
import packageReducer from './slices/packageSlice';
import moduleReducer from './slices/moduleSlice';
import tenantAuthReducer from './slices/tenantAuthSlice';
import userAuthReducer from './slices/userAuthSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tenantAuth: tenantAuthReducer,
    userAuth: userAuthReducer,
    tenants: tenantReducer,
    packages: packageReducer,
    modules: moduleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
