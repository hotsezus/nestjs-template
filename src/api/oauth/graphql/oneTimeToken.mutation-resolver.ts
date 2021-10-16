import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../auth/_decorators/currentUser.decorator';
import { GraphqlAuthGuard } from '../../auth/_guards/graphqlAuth.guard';
import {
  OneTimeTokenService,
  OneTimeTokenTypeEnum,
} from '../../ott/common/oneTimeToken.service';
import { User } from '../../user/database/user.entity';
import { OneTimeTokenOAuthStart } from '../rest/oauthStart';

@Resolver()
export class OneTimeTokenMutationResolver {
  constructor(private readonly oneTimeTokenService: OneTimeTokenService) {}

  @Mutation(() => String)
  @UseGuards(GraphqlAuthGuard)
  async createOAuthOneTimeToken(@CurrentUser() user: User) {
    return this.oneTimeTokenService.generate<OneTimeTokenOAuthStart>({
      type: OneTimeTokenTypeEnum.OAUTH_START,
      userId: user.id,
    });
  }
}
