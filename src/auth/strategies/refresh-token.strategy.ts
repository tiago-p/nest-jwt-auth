import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { TokenDto } from '../dto/token.dto';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refreshToken',
) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<TokenDto> {
    return await this.authService.refreshToken(req.body.refreshToken);
  }
}
