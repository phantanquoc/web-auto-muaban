import { Injectable, BadRequestException, NotFoundException, ForbiddenException, HttpException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
const DEFAULT_RATE=495000;
@Injectable()
export class ExchangeService {
  constructor(private prisma: PrismaService){}
  private effectiveRate(bot:any){ return bot.rateOverride ?? DEFAULT_RATE; }
  async kcToTt(characterName:string, kcAmount:number, botId:string){
    if(!kcAmount || kcAmount<=0) throw new BadRequestException({ code:'INVALID_AMOUNT', message:'Invalid amount' });
    const bot=await this.prisma.bot.findUnique({ where:{ id:botId } });
    if(!bot) throw new NotFoundException({ code:'BOT_NOT_FOUND', message:'Bot not found' });
    if(bot.type!=='EXCHANGE') throw new ForbiddenException({ code:'WRONG_BOT_TYPE', message:'Wrong bot type' });
    const user=await this.prisma.user.findFirst({ where:{ characterName } });
    if(!user) throw new NotFoundException({ code:'CHARACTER_NOT_LINKED', message:'Character not linked' });
    const rate=this.effectiveRate(bot);
    const tt= kcAmount * rate;
    if(bot.dailyLimitTt){
      const start=new Date(); start.setUTCHours(0,0,0,0);
      const agg=await this.prisma.exchangeRecord.aggregate({ where:{ botId, createdAt:{ gte:start }, direction:'KC_TO_TT' }, _sum:{ ttAmount:true } });
      const used=agg._sum.ttAmount||0;
      if(used+tt > bot.dailyLimitTt) throw new HttpException({ code:'DAILY_LIMIT_EXCEEDED', message:'Daily limit exceeded' }, 429);
    }
    const rec=await this.prisma.$transaction(async(tx)=>{
      const r=await tx.exchangeRecord.create({ data:{ userId:user.id, botId, direction:'KC_TO_TT', kcAmount, rate, ttAmount:tt, status:'COMPLETED' } });
      await tx.ledger.create({ data:{ userId:user.id, type:'EXCHANGE_CREDIT', amount:tt, refId:r.id, botId } });
      await tx.user.update({ where:{ id:user.id }, data:{ balanceTt:{ increment: tt } } });
      return r;
    });
    return rec;
  }
  async ttToKc(userId:string, kcAmount:number, botId:string){
    if(!kcAmount||kcAmount<=0) throw new BadRequestException({ code:'INVALID_AMOUNT', message:'Invalid amount' });
    const user=await this.prisma.user.findUnique({ where:{ id:userId } });
    if(!user?.characterName) throw new ForbiddenException({ code:'LINK_REQUIRED', message:'Character not linked' });
    const bot=await this.prisma.bot.findUnique({ where:{ id:botId } });
    if(!bot) throw new NotFoundException({ code:'BOT_NOT_FOUND', message:'Bot not found' });
    if(bot.type!=='EXCHANGE') throw new ForbiddenException({ code:'WRONG_BOT_TYPE', message:'Wrong bot type' });
    const rate=this.effectiveRate(bot);
    const tt=kcAmount*rate;
    // available = balance - frozenOrdersOnly (pending exchanges already decremented from balanceTt)
    const pendingOrders = await this.prisma.order.findMany({ where:{ userId, status:'PENDING' } });
    const frozenTotal = pendingOrders.reduce((s:number,o:any)=>s+o.totalTt,0);
    if(user.balanceTt - frozenTotal < tt) throw new BadRequestException({ code:'INSUFFICIENT_FUNDS', message:'Insufficient funds' });
    // freeze
    const rec=await this.prisma.$transaction(async(tx)=>{
      const r=await tx.exchangeRecord.create({ data:{ userId, botId, direction:'TT_TO_KC', kcAmount, rate, ttAmount:tt, status:'PENDING' } });
      await tx.ledger.create({ data:{ userId, type:'EXCHANGE_DEBIT', amount:tt, refId:r.id, botId } });
      await tx.user.update({ where:{ id:userId }, data:{ balanceTt:{ decrement: tt } } });
      return r;
    });
    return rec;
  }
  async ttToKcFulfilled(exchangeId:string, botId:string){
    const rec=await this.prisma.exchangeRecord.findUnique({ where:{ id:exchangeId } });
    if(!rec) throw new NotFoundException({ code:'EXCHANGE_NOT_FOUND', message:'Not found' });
    if(rec.botId!==botId) throw new ForbiddenException({ code:'WRONG_BOT', message:'Wrong bot' });
    if(rec.status!=='PENDING') throw new BadRequestException({ code:'EXCHANGE_NOT_PENDING', message:'Not pending' });
    return this.prisma.$transaction(async (tx)=>{
      const res = await tx.exchangeRecord.updateMany({ where:{ id:exchangeId, status:'PENDING', botId }, data:{ status:'COMPLETED' } });
      if(res.count===0) throw new BadRequestException({ code:'EXCHANGE_NOT_PENDING', message:'Not pending' });
      return tx.exchangeRecord.findUnique({ where:{ id:exchangeId } });
    });
  }
}
