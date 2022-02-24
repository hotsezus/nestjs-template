import { Module } from '@nestjs/common';

import { OneTimeTokenCommonModule } from '../../ott/common/oneTimeToken.common-module';
import { OneTimeTokenMutationResolver } from './oneTimeToken.mutation-resolver';

@Module({
  imports: [OneTimeTokenCommonModule],
  providers: [OneTimeTokenMutationResolver],
})
export class OAuthGraphqlModule {}
