import { UseGuards } from '@nestjs/common';
import { Mutation, Resolver } from '@nestjs/graphql';

import { CurrentUser } from '../../common/auth/currentUser.decorator';
import { GraphqlAuthGuard } from '../../common/auth/graphqlAuth.guard';
import {
  OneTimeTokenService,
  OneTimeTokenTypeEnum,
} from '../../common/oneTimeTokens/oneTimeToken.service';
import { OneTimeTokenOAuthStart } from '../../common/oneTimeTokens/types/oauthStart';
import { User } from '../../database/entities/user/user.entity';

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
