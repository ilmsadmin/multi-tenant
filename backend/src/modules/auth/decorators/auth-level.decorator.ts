import { SetMetadata } from '@nestjs/common';
import { AuthLevel } from '../interfaces/auth.interfaces';

export const AUTH_LEVEL_KEY = 'auth_level';

/**
 * Đặt cấp độ xác thực yêu cầu cho một route
 * @param level Cấp độ xác thực: 'system', 'tenant', or 'user'
 * @returns DecoratorFactory
 */
export const RequireAuthLevel = (level: AuthLevel) => SetMetadata(AUTH_LEVEL_KEY, level);
