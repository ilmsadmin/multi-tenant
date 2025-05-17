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
  message?: string;
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
  },  /**
   * Kiểm tra tên schema tenant có tồn tại trong hệ thống hay không
   * @param schemaName Tên schema của tenant cần kiểm tra
   * @returns Thông tin về tenant
   */
  checkTenantExists: async (schemaName: string): Promise<CheckTenantResponse> => {
    try {
      // Sử dụng đường dẫn rõ ràng với tên schema trong URL
      // Endpoint này đã được đánh dấu là Public trong backend, không cần token
      const response = await api.get<CheckTenantResponse>(`/tenants/check/${schemaName}`);
      return response.data;
    } catch (error: any) {
      // Xử lý lỗi tại đây, không chuyển hướng
      console.error('[tenant.service] Error checking tenant existence:', error);
      
      // Xử lý lỗi 404 - Tenant không tồn tại
      if (error.response && error.response.status === 404) {
        return { exists: false, message: 'Tên tenant không tồn tại trong hệ thống' };
      }
      
      // Trả về response mặc định khi có lỗi khác
      return { 
        exists: false, 
        message: error.response?.data?.message || 'Không thể kiểm tra tenant. Vui lòng thử lại sau.'
      };
    }
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
