import { Controller, Post, Body, Req, UnauthorizedException, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyLinkDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
function hashToken(t:string){ return crypto.createHash('sha256').update(t).digest('hex'); }
const verifyLinkHits = new Map<string, number[]>();
function rateLimit(key:string){
  const now=Date.now(); const arr=(verifyLinkHits.get(key)||[]).filter(t=> now-t < 60000);
  if(arr.length>=10) throw new HttpException({ code:'RATE_LIMITED', message:'Too many requests' }, 429);
  arr.push(now); verifyLinkHits.set(key,arr);
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private jwt: JwtService, private prisma: PrismaService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const r = await this.auth.register(dto.email, dto.password);
    return r;
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('link-code')
  async linkCode(@Req() req: any) {
    // manual JWT guard (was UseGuards JwtAuthGuard)
    const hdr = req.headers['authorization'] as string;
    if(!hdr?.startsWith('Bearer ')) throw new UnauthorizedException({ code:'UNAUTHORIZED', message:'Missing token' });
    let payload:any; try{ payload=this.jwt.verify(hdr.slice(7)); }catch{ throw new UnauthorizedException({ code:'UNAUTHORIZED', message:'Invalid token' }); }
    const user = await this.prisma.user.findUnique({ where:{ id: payload.sub } });
    if(!user) throw new UnauthorizedException({ code:'UNAUTHORIZED', message:'Invalid token' });
    req.user=user;
    return this.auth.createLinkCode(req.user.id);
  }

  @Post('verify-link')
  async verifyLinkDual(@Body() dto: VerifyLinkDto, @Req() req: any) {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    rateLimit(String(ip));
    const token = req.headers['x-bot-token'] as string;
    let authed=false;
    if (token) {
      const h=hashToken(token);
      const bot=await this.prisma.bot.findFirst({ where:{ botTokenHash: h } });
      if(!bot) throw new UnauthorizedException({ code:'UNAUTHORIZED', message:'Invalid bot token' });
      req.bot=bot; authed=true;
    } else {
      const hdr=req.headers['authorization'] as string;
      if(hdr?.startsWith('Bearer ')){
        try{
          const payload=this.jwt.verify(hdr.slice(7));
          const user=await this.prisma.user.findUnique({ where:{ id: payload.sub } });
          if(user){ req.user=user; authed=true; }
        }catch{}
      }
    }
    if(!authed) throw new UnauthorizedException({ code:'UNAUTHORIZED', message:'Missing authentication (x-bot-token or Bearer)' });
    return this.auth.verifyLink(dto.characterName, dto.code);
  }
}
