import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
function genToken(){ return crypto.randomBytes(24).toString('hex'); }
function hashToken(t:string){ return crypto.createHash('sha256').update(t).digest('hex'); }
@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService){}
  async list(){
    const bots = await this.prisma.bot.findMany({ orderBy:{ createdAt:'desc' } });
    return bots.map(({ botTokenHash, ...rest }: any) => rest);
  }
  async create(dto:any){
    const token=genToken();
    const bot=await this.prisma.bot.create({ data:{
      name:dto.name, server:dto.server, type:dto.type, mapHint:dto.mapHint, posHint:dto.posHint,
      rateOverride: dto.rateOverride ?? null, dailyLimitTt: dto.dailyLimitTt ?? null,
      enabled: dto.enabled ?? true, botTokenHash: hashToken(token)
    }});
    const { botTokenHash: _h, ...safe } = bot as any;
    return { ...safe, plainToken: token };
  }
  async update(id:string, dto:any){
    const bot=await this.prisma.bot.findUnique({ where:{ id } });
    if(!bot) throw new NotFoundException({ code:'BOT_NOT_FOUND', message:'Not found' });
    if(dto.rateOverride!==undefined && dto.rateOverride!==null && dto.rateOverride<=0) throw new BadRequestException({ code:'INVALID_RATE', message:'Invalid rate' });
    if(dto.dailyLimitTt!==undefined && dto.dailyLimitTt!==null && dto.dailyLimitTt<=0) throw new BadRequestException({ code:'INVALID_LIMIT', message:'Invalid limit' });
    const updated = await this.prisma.bot.update({ where:{ id }, data:{
      name:dto.name, server:dto.server, type:dto.type, mapHint:dto.mapHint, posHint:dto.posHint,
      rateOverride:dto.rateOverride, dailyLimitTt:dto.dailyLimitTt, enabled:dto.enabled
    }});
    const { botTokenHash: _h2, ...safe } = updated as any;
    return safe;
  }
  async remove(id:string){ await this.prisma.bot.delete({ where:{ id } }); return { ok:true }; }
  stock(id:string){ return this.prisma.botStock.findMany({ where:{ botId:id } }); }
  async logs(id:string){
    const orders=await this.prisma.order.findMany({ where:{ botId:id }, orderBy:{ createdAt:'desc' }, take:50 });
    const exchanges=await this.prisma.exchangeRecord.findMany({ where:{ botId:id }, orderBy:{ createdAt:'desc' }, take:50 });
    return { orders, exchanges };
  }
  async rotateToken(id:string){
    const bot=await this.prisma.bot.findUnique({ where:{ id } });
    if(!bot) throw new NotFoundException({ code:'BOT_NOT_FOUND', message:'Not found' });
    const token=genToken();
    await this.prisma.bot.update({ where:{ id }, data:{ botTokenHash: hashToken(token) } });
    return { token };
  }
}
