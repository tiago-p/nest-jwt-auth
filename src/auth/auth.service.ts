import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserPayloadDto } from './dto/user-payload.dto';
import { TokenDto } from './dto/token.dto';
import { UserDto } from '../users/dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { comparePasswords } from '../shared/password.helper';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  createRefreshToken(userId: number): RefreshTokenEntity {
    const currDate = new Date();
    currDate.setDate(
      currDate.getDate() + parseInt(process.env.AUTH_REFRESH_TOKEN_EXPIRE_DAYS),
    );
    const refreshToken = new RefreshTokenEntity();
    refreshToken.token = crypto.randomBytes(128).toString('base64');
    refreshToken.idUser = userId;
    refreshToken.expireAt = currDate;
    refreshToken.revoked = false;
    return refreshToken;
  }

  createAccessToken({ email, id }: UserPayloadDto): string {
    return this.jwtService.sign(
      { email, id },
      {
        secret: process.env.AUTH_TOKEN_SECRET,
        expiresIn: parseInt(process.env.AUTH_TOKEN_EXPIRE_SEC),
      },
    );
  }

  async login(email: string, password: string): Promise<TokenDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (!(await comparePasswords(user.password, password))) {
      throw new UnauthorizedException();
    }
    const accessToken = this.createAccessToken({
      email: user.email,
      id: user.id,
    });
    const refreshTokenModel = this.createRefreshToken(user.id);
    await this.refreshTokenRepository.save(refreshTokenModel);
    return {
      accessToken,
      refreshToken: refreshTokenModel.token,
    };
  }

  async validateUserByPayload(payload: UserPayloadDto): Promise<UserDto> {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return UserDto.toView(user);
  }

  async refreshToken(token: string): Promise<TokenDto> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token },
    });
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    if (
      new Date().getTime() > refreshToken.expireAt.getTime() ||
      refreshToken.revoked === true
    ) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findOneById(refreshToken.idUser);
    if (!user) {
      throw new UnauthorizedException();
    }
    const newAccessToken = this.createAccessToken(user);
    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    };
  }
}
