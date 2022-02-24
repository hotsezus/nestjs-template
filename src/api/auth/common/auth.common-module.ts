import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { jwtExpiration, jwtSecretKey } from '../../../config/jwt';
import { UserDatabaseModule } from '../../user/database/user.database-module';
import { UserTokensModule } from '../../userTokens/userTokens.module';
import { AuthService } from './auth.service';
import { JwtStrategy, STRATEGY_JWT } from './jwtStrategy.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: STRATEGY_JWT }),
    JwtModule.register({
      secret: jwtSecretKey,
      signOptions: {
        expiresIn: jwtExpiration,
      },
    }),
    UserDatabaseModule,
    UserTokensModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy],
})
export class AuthCommonModule {}
