import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GenderEnum } from '../../src/users/enum/gender.enum';
import { UserEntity } from '../../src/users/entity/user.entity';
import { UsersService } from '../../src/users/users.service';
import { AuthService } from '../../src/auth/auth.service';
import { RefreshTokenEntity } from '../../src/auth/entity/refresh-token.entity';
import { plainToClass } from 'class-transformer';

const mockUser = {
  id: 2,
  email: 'jonh.doe@test.com',
  lastName: 'Doe',
  firstName: 'Jonh',
  gender: GenderEnum.M,
  password: '$2b$10$XBzaoVUyBYbofSoPwigNkuDU7LJ8IOTomauObVjWEPthefpv.2.W6', //Password!123
  company: 'XXX',
};

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let mockRefreshTokenRepository;
  let findUser: jest.Mock;
  beforeEach(async () => {
    findUser = jest.fn();
    const mockUserRepository = {
      findOne: findUser,
    };
    mockRefreshTokenRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const mockedJwtService = {
      sign: () => '',
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: JwtService,
          useValue: mockedJwtService,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(RefreshTokenEntity),
          useValue: mockRefreshTokenRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('User login', () => {
    it('should throw error when user email not found', async () => {
      findUser.mockResolvedValue(undefined);
      await expect(
        authService.login('jonh.doe@test.com', 'xxxxxxx'),
      ).rejects.toThrow(new UnauthorizedException());
    });
    it('should throw an error if password is invalid', async () => {
      findUser.mockResolvedValue(mockUser);
      await expect(
        authService.login('jonh.doe@test.com', 'xxxxxxx'),
      ).rejects.toThrow(new UnauthorizedException());
    });
    it('should login user', async () => {
      const signSpy = jest.spyOn(jwtService, 'sign');
      const refreshTokenSpy = jest.spyOn(authService, 'createRefreshToken');
      findUser.mockResolvedValue(mockUser);
      const result = await authService.login(
        'jonh.doe@test.com',
        'Password!123',
      );
      expect(refreshTokenSpy).toHaveBeenCalledWith(mockUser.id);
      expect(signSpy).toHaveBeenCalledWith(
        {
          email: mockUser.email,
          id: mockUser.id,
        },
        { secret: expect.any(String), expiresIn: expect.any(Number) },
      );
      expect(result).toStrictEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });
  });

  describe('Refresh token', () => {
    let mockRefreshToken;
    beforeEach(() => {
      mockRefreshToken = {
        id: 1,
        idUser: 2,
        token:
          's40tpBrGitGdvBsMOzLDBMLBu3E83+aA9sRPlL2gHGhv4C2oqLxX0bbk8waOBoB+AAkZXo3AccDajTYU/RkxbMcLeJ2Nfe8eEan0guNGPMg62lmGpx4RwT5hlYxrHrplXKlhRx8zT4xwzHJ6zLuOg5mEIr5IGFk92enGirfWXOU=',
        expireAt: new Date(Date.now() + 3600 * 1000 * 24),
        revoked: false,
      };
    });
    it('should throw error if refresh token not found', async () => {
      mockRefreshTokenRepository.findOne.mockResolvedValue(null);
      await expect(authService.refreshToken('xxxxxxxxxxxx')).rejects.toThrow(
        new UnauthorizedException(),
      );
    });

    it('should throw error if refresh token expired', async () => {
      mockRefreshToken.expireAt = new Date(
        new Date().getTime() - 24 * 60 * 60 * 1000, //expiration yesterday
      );
      mockRefreshTokenRepository.findOne.mockResolvedValue(
        plainToClass(RefreshTokenEntity, mockRefreshToken),
      );
      await expect(
        authService.refreshToken(mockRefreshToken.token),
      ).rejects.toThrow(new UnauthorizedException());
    });

    it('should throw error if refresh token is revoked', async () => {
      mockRefreshToken.revoked = true;
      mockRefreshTokenRepository.findOne.mockResolvedValue(
        plainToClass(RefreshTokenEntity, mockRefreshToken),
      );
      await expect(
        authService.refreshToken(mockRefreshToken.token),
      ).rejects.toThrow(new UnauthorizedException());
    });

    it('should throw error if user not found', async () => {
      mockRefreshTokenRepository.findOne.mockResolvedValue(
        plainToClass(RefreshTokenEntity, mockRefreshToken),
      );
      findUser.mockResolvedValue(null);
      await expect(
        authService.refreshToken(mockRefreshToken.token),
      ).rejects.toThrow(new UnauthorizedException());
    });

    it('should create new access token from refresh token', async () => {
      const mockUser = {
        id: 2,
        email: 'jonh.doe@test.com',
        gender: GenderEnum.M,
        lastName: 'Doe',
        firstName: 'Jonh',
        company: 'TEST',
      };
      mockRefreshTokenRepository.findOne.mockResolvedValue(
        plainToClass(RefreshTokenEntity, mockRefreshToken),
      );
      const accessTokenSpy = jest.spyOn(authService, 'createAccessToken');
      findUser.mockResolvedValue(mockUser);
      const result = await authService.refreshToken(mockRefreshToken.token);
      expect(accessTokenSpy).toHaveBeenCalledWith(mockUser);
      expect(result).toStrictEqual({
        accessToken: expect.any(String),
        refreshToken: mockRefreshToken.token,
      });
    });
  });
});
