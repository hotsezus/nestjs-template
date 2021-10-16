import { NotFoundException, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { GraphqlAuthGuard } from '../../../_guards/graphqlAuth.guard';
import { isAdmin } from '../../../_guards/userChecks/isAdmin';
import { UserGuard } from '../../../_guards/userGuard.guard';
import { UserService } from '../../user/database/user.service';
import { UserPasswordsService } from '../../user/database/userPasswords.service';
import { UserTokensService } from '../../userTokens/userTokens.service';
import { AuthService } from '../common/auth.service';
import { AuthResponseType } from './authResponse.type';

@Resolver()
export class AuthMutationResolver {
  constructor(
    private readonly users: UserService,
    private readonly userPasswords: UserPasswordsService,
    private readonly userTokens: UserTokensService,
    private readonly auth: AuthService,
  ) {}

  /**
   * Выполняет аутентификацию с использованием почты и пароля
   */
  @Mutation(() => AuthResponseType, {
    description:
      'Аутентификация пользователя. Может возвращать ошибку авторизации, если при мутации были запрошены поля, недоступные без токена',
  })
  async login(
    @Args('emailOrLogin') email: string,
    @Args('password') password: string,
  ): Promise<AuthResponseType> {
    const user = await this.userPasswords.checkUserCredentials(email, password);
    return await this.auth.generateResponse(user);
  }

  /**
   * Позволяет администратору посмотреть на сайт от имени другого пользователя
   */
  @Mutation(() => AuthResponseType)
  @UseGuards(GraphqlAuthGuard, UserGuard(isAdmin))
  async loginWithId(@Args('id') id: number): Promise<AuthResponseType> {
    const user = await this.users.getById(id);
    if (!user) {
      throw new NotFoundException();
    }
    return await this.auth.generateResponse(user);
  }

  /**
   * Использует рефреш-токен для получения нового access-токена
   */
  @Mutation(() => AuthResponseType)
  async useRefreshToken(
    @Args('token') token: string,
  ): Promise<AuthResponseType> {
    const user = await this.userTokens.useAuthToken(token);
    return await this.auth.generateResponse(user);
  }

  /**
   * Помечает текущий токен пользователя как устаревший
   */
  @Mutation(() => Boolean)
  async logout(@Args('token') token: string): Promise<boolean> {
    const user = await this.userTokens.useAuthToken(token);
    return !!user;
  }
}
