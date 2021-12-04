import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';

import { TypeormDataLoaders } from './TypeormDataLoader';

/**
 * Интерцептор, добавляющий переменную dataLoaders в GraphQL-контекст
 */
@Injectable()
export class TypeormDataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  public intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const ctx = GqlExecutionContext.create(context).getContext();
    if (ctx && !ctx.typeormDataLoaders) {
      ctx.typeormDataLoaders = new TypeormDataLoaders(this.moduleRef);
    }
    return next.handle();
  }
}
