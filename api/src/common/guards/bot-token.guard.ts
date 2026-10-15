import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
function hashToken(t: string){ return crypto.createHash('sha256').update(t).digest('hex'); }
@Injectable()
export class BotTokenGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.headers['x-bot-token'] as string;
    if (!token) throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Missing x-bot-token' });
    const h = hashToken(token);
    const bot = await this.prisma.bot.findFirst({ where: { botTokenHash: h } });
    if (!bot) throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Invalid bot token' });
    req.bot = bot;
    return true;
  }
}
