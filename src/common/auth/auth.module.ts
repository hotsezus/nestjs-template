import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { jwtExpiration, jwtSecretKey } from '../../config/jwt';
import { UserModule } from '../../database/entities/user/user.module';
import { UserTokensModule } from '../../database/entities/userTokens/userTokens.module';
import { AuthService } from './auth.service';
import { JwtStrategy, STRATEGY_JWT } from './jwtStrategy.service';

/**
 * Модуль аутентификации
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: STRATEGY_JWT }),
    JwtModule.register({
      secret: jwtSecretKey,
      signOptions: {
        expiresIn: jwtExpiration,
      },
    }),
    UserModule,
    UserTokensModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
