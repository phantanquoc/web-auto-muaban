import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [ctx.getHandler(), ctx.getClass()]);
    if (!roles) return true;
    const user = ctx.switchToHttp().getRequest().user;
    if (!user || !roles.includes(user.role)) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Forbidden' });
    return true;
  }
}
export const Roles = (...roles: string[]) => {
  const { SetMetadata } = require('@nestjs/common');
  return SetMetadata('roles', roles);
};
