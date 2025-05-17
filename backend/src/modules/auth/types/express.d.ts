// Add Express Request extension for user property
import { AuthLevel } from '../interfaces/auth.interfaces';

declare global {
  namespace Express {
    export interface Request {
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
