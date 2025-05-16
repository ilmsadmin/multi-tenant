import api from './api';
import { 
  Package, 
  CreatePackageRequest, 
  UpdatePackageRequest 
} from '../types/package.types';

export const packageService = {
  getAllPackages: async (): Promise<Package[]> => {
    const response = await api.get<Package[]>('/packages');
    return response.data;
  },

  getPackageById: async (id: number): Promise<Package> => {
    const response = await api.get<Package>(`/packages/${id}`);
    return response.data;
  },

  createPackage: async (packageData: CreatePackageRequest): Promise<Package> => {
    const response = await api.post<Package>('/packages', packageData);
    return response.data;
  },

  updatePackage: async (id: number, packageData: UpdatePackageRequest): Promise<Package> => {
    const response = await api.patch<Package>(`/packages/${id}`, packageData);
    return response.data;
  },

  deletePackage: async (id: number): Promise<void> => {
    await api.delete(`/packages/${id}`);
  }
};
