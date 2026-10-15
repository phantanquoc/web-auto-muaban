import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentBot = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().bot;
});
