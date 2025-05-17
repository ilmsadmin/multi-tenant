import { AuthLevel } from '../modules/auth/interfaces/auth.interfaces';

declare global {
  namespace Express {
    interface Request {
      user: {
        userId: string | number;
        username: string;
        level: AuthLevel;
        tenantId?: string | number;
        tenantName?: string;
        roles?: string[];
        permissions?: string[];
      };
    }
  }
}
