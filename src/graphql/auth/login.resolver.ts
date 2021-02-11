import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthService } from '../../common/auth/auth.service';
import { isAdmin } from '../../common/auth/checks/isAdmin';
import { GraphqlAuthGuard } from '../../common/auth/graphqlAuth.guard';
import { UserGuard } from '../../common/auth/userGuard.guard';
import { UserService } from '../../database/entities/user/user.service';
import { AuthResponseType } from './authResponse.type';

@Resolver()
export class LoginResolver {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
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
    const user = await this.userService.checkUserCredentials(email, password);
    return await this.authService.generateResponse(user);
  }

  @Mutation(() => AuthResponseType)
  @UseGuards(GraphqlAuthGuard, UserGuard(isAdmin))
  async loginWithId(@Args('id') id: number): Promise<AuthResponseType> {
    const user = await this.userService.getById(id);
    return await this.authService.generateResponse(user);
  }

  @Mutation(() => AuthResponseType)
  async useRefreshToken(
    @Args('token') token: string,
  ): Promise<AuthResponseType> {
    const user = await this.userService.useAuthToken(token);
    return await this.authService.generateResponse(user);
  }

  @Mutation(() => Boolean)
  async logout(@Args('token') token: string): Promise<boolean> {
    const user = await this.userService.useAuthToken(token);
    return !!user;
  }
}
