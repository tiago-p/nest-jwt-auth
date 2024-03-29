import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    description: 'Invalid username/password',
  })
  public async login(@Body() { email, password }: LoginDto): Promise<TokenDto> {
    return await this.authService.login(email, password);
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiUnauthorizedResponse({
    description: 'Refresh token error',
  })
  @ApiBody({
    schema: {
      properties: { refreshToken: { type: 'string' } },
      required: ['refreshToken'],
    },
  })
  @UseGuards(AuthGuard('refreshToken'))
  public async refreshToken(@Req() req: Request): Promise<TokenDto> {
    return req['auth'];
  }
}
