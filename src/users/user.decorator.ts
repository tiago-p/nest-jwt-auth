import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * retrieve the current user with a decorator
 * example of a controller method:
 * @Post()
 * someMethod(@Usr() user: User) {
 *   // do something with the user
 * }
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    // console.log('----------------------');
    // console.log(req);
    // console.log(req.user);
    console.log(req.auth);
    // console.log('----------------------');
    return req.user;
  },
);
