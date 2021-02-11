import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    const graphqlExecutionContext = GqlExecutionContext.create(context);
    const request = graphqlExecutionContext.getContext().req;
    return request.user;
  },
);
