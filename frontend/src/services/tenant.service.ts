import api from './api';
import { 
  Tenant, 
  CreateTenantRequest, 
  UpdateTenantRequest 
} from '../types/tenant.types';

// Interface cho đăng ký tenant dùng thử
interface RegisterFreeTrialRequest {
  fullName: string;
  phoneNumber: string;
  captchaToken: string;
}

// Interface cho response kiểm tra tenant
interface CheckTenantResponse {
  exists: boolean;
  domain?: string;
  tenant?: {
    id: number;
    name: string;
    schema_name: string;
  };
}

// Interface cho response đăng ký tenant
interface RegisterTenantResponse {
  success: boolean;
  message: string;
  schemaName?: string;
}

export const tenantService = {
  getAllTenants: async (): Promise<Tenant[]> => {
    const response = await api.get<Tenant[]>('/tenants');
    return response.data;
  },

  getTenantById: async (id: number): Promise<Tenant> => {
    const response = await api.get<Tenant>(`/tenants/${id}`);
    return response.data;
  },

  createTenant: async (tenant: CreateTenantRequest): Promise<Tenant> => {
    const response = await api.post<Tenant>('/tenants', tenant);
    return response.data;
  },

  updateTenant: async (id: number, tenant: UpdateTenantRequest): Promise<Tenant> => {
    const response = await api.patch<Tenant>(`/tenants/${id}`, tenant);
    return response.data;
  },

  deleteTenant: async (id: number): Promise<void> => {
    await api.delete(`/tenants/${id}`);
  },
  /**
   * Kiểm tra tên schema tenant có tồn tại trong hệ thống hay không
   * @param schemaName Tên schema của tenant cần kiểm tra
   * @returns Thông tin về tenant
   */
  checkTenantExists: async (schemaName: string): Promise<CheckTenantResponse> => {
    // Sử dụng đường dẫn rõ ràng với tên schema trong URL, không phụ thuộc vào interceptor
    const response = await api.get<CheckTenantResponse>(`/tenants/check/${schemaName}`);
    return response.data;
  },

  /**
   * Đăng ký tài khoản tenant dùng thử miễn phí
   * @param data Thông tin đăng ký
   * @returns Kết quả đăng ký
   */
  registerFreeTrial: async (data: RegisterFreeTrialRequest): Promise<RegisterTenantResponse> => {
    const response = await api.post<RegisterTenantResponse>('/tenants/register-trial', data);
    return response.data;
  }
};
