import { Module } from '@nestjs/common';

import { OneTimeTokenCommonModule } from './common/oneTimeToken.common-module';

@Module({
  providers: [OneTimeTokenCommonModule],
  exports: [],
})
export class OneTimeTokenModule {}
