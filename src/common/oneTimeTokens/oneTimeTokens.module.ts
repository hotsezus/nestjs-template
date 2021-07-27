import { Module } from '@nestjs/common';

import { OneTimeTokenService } from './oneTimeToken.service';

@Module({
  providers: [OneTimeTokenService],
  exports: [OneTimeTokenService],
})
export class OneTimeTokensModule {}
