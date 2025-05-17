export interface EndUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  tenant_id: number;
  status: 'active' | 'inactive';
  avatar?: string;
  created_at: string;
  updated_at: string;
  // Additional fields used in profile
  phone?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
}

export interface UserAuthState {
  user: EndUser | null;
  token: string | null;
  schemaName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UserLoginRequest {
  schemaName: string;
  username: string;
  password: string;
}

export interface UserLoginResponse {
  user: EndUser;
  access_token: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  timezone: string;
  dateFormat: string;
  defaultView: string;
}

export interface UserProfile {
  user: EndUser;
  preferences: UserPreferences;
}
