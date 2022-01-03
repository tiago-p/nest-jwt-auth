import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    UsersModule,
    PassportModule.register({
      property: 'auth',
      session: false,
    }),
    JwtModule.register({
      secret: process.env.AUTH_TOKEN_SECRET,
      signOptions: {
        expiresIn: process.env.AUTH_TOKEN_EXPIRE_SEC,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
