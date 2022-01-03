import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserPayloadDto } from '../dto/user-payload.dto';
import { UserDto } from '../../users/dto/user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_TOKEN_SECRET,
    });
  }

  async validate(payload: UserPayloadDto): Promise<UserDto> {
    const user = await this.authService.validateUserByPayload(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
