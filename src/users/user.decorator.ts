import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * current user decorator
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
