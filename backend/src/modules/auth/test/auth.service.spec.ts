import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../users/services/user.service';
import { RedisService } from '../../redis/services/redis.service';
import { SystemLogService } from '../../mongodb/services/system-log.service';
import { ActivityLogService } from '../../mongodb/services/activity-log.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let redisService: RedisService;
  let systemLogService: SystemLogService;
  let activityLogService: ActivityLogService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    email: 'test@example.com',
    role: 'user',
    status: 'active',
  };

  const mockJwtPayload = {
    sub: 1,
    username: 'testuser',
    tenantId: 1,
    role: 'user',
  };

  const mockJwtToken = 'jwt-token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockJwtToken),
            verify: jest.fn().mockReturnValue(mockJwtPayload),
          },
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: SystemLogService,
          useValue: {
            createLog: jest.fn(),
          },
        },
        {
          provide: ActivityLogService,
          useValue: {
            createLog: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
    redisService = module.get<RedisService>(RedisService);
    systemLogService = module.get<SystemLogService>(SystemLogService);
    activityLogService = module.get<ActivityLogService>(ActivityLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user object when credentials are valid', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(1, 'testuser', 'password');
      
      expect(userService.findByUsername).toHaveBeenCalledWith(1, 'testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', 'hashedpassword');
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(null);

      const result = await service.validateUser(1, 'nonexistent', 'password');
      
      expect(userService.findByUsername).toHaveBeenCalledWith(1, 'nonexistent');
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      jest.spyOn(userService, 'findByUsername').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(1, 'testuser', 'wrongpassword');
      
      expect(userService.findByUsername).toHaveBeenCalledWith(1, 'testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      const mockLoginResponse = {
        access_token: mockJwtToken,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role,
        },
      };

      jest.spyOn(service, 'validateUser').mockResolvedValue({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      });
      
      jest.spyOn(jwtService, 'sign').mockReturnValue(mockJwtToken);
      jest.spyOn(redisService, 'set').mockResolvedValue(true);
      jest.spyOn(activityLogService, 'createLog').mockResolvedValue(null);

      const result = await service.login(1, 'testuser', 'password');
      
      expect(service.validateUser).toHaveBeenCalledWith(1, 'testuser', 'password');
      expect(jwtService.sign).toHaveBeenCalled();
      expect(redisService.set).toHaveBeenCalled();
      expect(activityLogService.createLog).toHaveBeenCalled();
      expect(result).toEqual(mockLoginResponse);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);

      await expect(service.login(1, 'testuser', 'wrongpassword')).rejects.toThrow(UnauthorizedException);
      
      expect(service.validateUser).toHaveBeenCalledWith(1, 'testuser', 'wrongpassword');
    });
  });

  describe('logout', () => {
    it('should successfully log out a user', async () => {
      jest.spyOn(redisService, 'del').mockResolvedValue(1);
      jest.spyOn(activityLogService, 'createLog').mockResolvedValue(null);

      await service.logout(1, 'testuser', mockJwtToken);
      
      expect(redisService.del).toHaveBeenCalled();
      expect(activityLogService.createLog).toHaveBeenCalled();
    });
  });
});
