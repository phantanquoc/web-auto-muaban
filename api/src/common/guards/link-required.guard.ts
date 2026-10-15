import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
@Injectable()
export class LinkRequiredGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user = ctx.switchToHttp().getRequest().user;
    if (!user?.characterName) throw new ForbiddenException({ code: 'LINK_REQUIRED', message: 'Character not linked' });
    return true;
  }
}
