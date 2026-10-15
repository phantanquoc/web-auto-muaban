import { Injectable, BadRequestException, ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService){}
  async create(userId:string, botId:string, items:{productId:number, qty:number}[]){
    const user = await this.prisma.user.findUnique({ where:{ id:userId } });
    if(!user?.characterName) throw new ForbiddenException({ code:'LINK_REQUIRED', message:'Character not linked' });
    const bot = await this.prisma.bot.findUnique({ where:{ id:botId } });
    if(!bot || !bot.enabled) throw new NotFoundException({ code:'BOT_NOT_FOUND', message:'Bot not found' });
    if(items.length===0) throw new BadRequestException({ code:'EMPTY_ITEMS', message:'No items' });
    // stale-stock check: BotStock updatedAt >90s or lastHeartbeat >90s => reject
    {
      const botFull = await this.prisma.bot.findUnique({ where:{ id: botId } });
      const stocksForBot = await this.prisma.botStock.findMany({ where:{ botId } });
      let stale=false;
      if(botFull?.lastHeartbeatAt){
        if(Date.now()-botFull.lastHeartbeatAt.getTime()>90000) stale=true;
      } else {
        // never heartbeat -> stale if no stock timestamp
        if(stocksForBot.length===0) stale=true;
      }
      if(!stale && stocksForBot.length>0){
        const latest = stocksForBot.reduce((mx,s)=> s.updatedAt>mx? s.updatedAt:mx, stocksForBot[0].updatedAt);
        if(Date.now()-latest.getTime()>90000) stale=true;
      }
      if(!stale && stocksForBot.length===0) stale=true;
      if(stale) throw new BadRequestException({ code:'STOCK_CHANGED', message:'Stock changed, please refresh' });
    }
    // stock check
    for(const it of items){
      const stock = await this.prisma.botStock.findUnique({ where:{ botId_productId:{ botId, productId: it.productId } } });
      const avail = stock?.bagQty||0;
      if(it.qty<=0) throw new BadRequestException({ code:'INVALID_QTY', message:'Invalid qty' });
      if(it.qty>avail) throw new BadRequestException({ code:'STOCK_UNAVAILABLE', message:`Stock unavailable for ${it.productId}` });
    }
    // total
    let total=0;
    for(const it of items){
      const p=await this.prisma.product.findUnique({ where:{ id: it.productId } });
      if(!p) throw new BadRequestException({ code:'PRODUCT_NOT_FOUND', message:`Product ${it.productId} not found` });
      total+= p.donGia * it.qty;
    }
    // balance check: available = balance - frozenOrdersOnly (pending exchanges already decremented from balanceTt)
    const pendingOrders = await this.prisma.order.findMany({ where:{ userId, status:'PENDING' } });
    const frozenTotal = pendingOrders.reduce((s:number,o:any)=>s+o.totalTt,0);
    const freshUser = await this.prisma.user.findUnique({ where:{ id:userId } });
    if(freshUser!.balanceTt - frozenTotal < total){
      throw new BadRequestException({ code:'INSUFFICIENT_FUNDS', message:'Insufficient funds' });
    }
    const order = await this.prisma.$transaction(async (tx)=>{
      const o = await tx.order.create({ data:{ userId, botId, items: items as any, totalTt: total, status:'PENDING' } });
      await tx.ledger.create({ data:{ userId, type:'FROZEN', amount: total, refId: o.id, botId } });
      return o;
    });
    return order;
  }
  async list(userId:string){ return this.prisma.order.findMany({ where:{ userId }, orderBy:{ createdAt:'desc' } }); }
  async get(userId:string, id:string){
    const o=await this.prisma.order.findUnique({ where:{ id } });
    if(!o || o.userId!==userId) throw new NotFoundException({ code:'ORDER_NOT_FOUND', message:'Order not found' });
    return o;
  }
  async fulfill(orderId:string, botId:string){
    const order = await this.prisma.order.findUnique({ where:{ id: orderId } });
    if(!order) throw new NotFoundException({ code:'ORDER_NOT_FOUND', message:'Order not found' });
    if(order.botId!==botId) throw new ForbiddenException({ code:'WRONG_BOT', message:'Wrong bot' });
    if(order.status!=='PENDING') throw new ConflictException({ code:'ORDER_NOT_PENDING', message:'Order not pending' });
    const result = await this.prisma.$transaction(async (tx)=>{
      const updated = await tx.order.updateMany({ where:{ id: orderId, status:'PENDING', botId }, data:{ status:'FULFILLED' } });
      if(updated.count===0) throw new ConflictException({ code:'ORDER_NOT_PENDING', message:'Order not pending' });
      await tx.ledger.create({ data:{ userId: order.userId, type:'DEDUCT', amount: order.totalTt, refId: orderId, botId } });
      await tx.user.update({ where:{ id: order.userId }, data:{ balanceTt:{ decrement: order.totalTt } } });
      return tx.order.findUnique({ where:{ id: orderId } });
    });
    return result;
  }
  async expirePending(){
    const cutoff = new Date(Date.now()-5*60*1000);
    const pendings = await this.prisma.order.findMany({ where:{ status:'PENDING', createdAt:{ lt: cutoff } } });
    for(const o of pendings){
      try{
        await this.prisma.$transaction(async (tx)=>{
          const res = await tx.order.updateMany({ where:{ id:o.id, status:'PENDING' }, data:{ status:'EXPIRED' } });
          if(res.count===0) return;
          await tx.ledger.create({ data:{ userId:o.userId, type:'REFUND', amount:o.totalTt, refId:o.id, botId:o.botId } });
        });
      }catch(e){}
    }
  }
  async pendingForBot(botId:string){
    const orders = await this.prisma.order.findMany({ where:{ botId, status:'PENDING' }, orderBy:{ createdAt:'asc' } });
    // enrich with buyer characterName
    const userIds=[...new Set(orders.map(o=>o.userId))];
    const users= userIds.length? await this.prisma.user.findMany({ where:{ id:{ in:userIds } }, select:{ id:true, characterName:true } }):[];
    const map=new Map(users.map(u=>[u.id,u.characterName]));
    return orders.map(o=> ({ ...o, buyerCharacterName: map.get(o.userId)||null }));
  }
}
