import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class BotsService {
  constructor(private prisma: PrismaService) {}
  async listPublic() {
    const bots = await this.prisma.bot.findMany({ where: { enabled: true } });
    return bots.map(b => ({ ...b, botTokenHash: undefined, online: b.lastHeartbeatAt ? (Date.now() - b.lastHeartbeatAt.getTime() < 90000) : false }));
  }
  async stock(botId: string) {
    const stocks = await this.prisma.botStock.findMany({ where: { botId } });
    const bot = await this.prisma.bot.findUnique({ where: { id: botId } });
    if (!bot) return null;
    const updatedAt = stocks.length ? stocks.reduce((mx,s)=> s.updatedAt > mx ? s.updatedAt : mx, stocks[0].updatedAt) : null;
    const stale = updatedAt ? (Date.now() - updatedAt.getTime() > 90000) : true;
    return { botId, updatedAt, stale, bag: stocks.map(s=>({ productId: s.productId, qty: s.bagQty })), chest: stocks.map(s=>({ productId: s.productId, qty: s.chestQty })), raw: stocks };
  }
  async heartbeat(botId: string) {
    await this.prisma.bot.update({ where: { id: botId }, data: { lastHeartbeatAt: new Date() } });
  }
  async upsertStock(botId: string, bag: {productId:number, qty:number}[], chest: {productId:number, qty:number}[]) {
    const map = new Map<number,{bag:number,chest:number}>();
    for(const b of bag||[]) map.set(b.productId, { bag: b.qty, chest: map.get(b.productId)?.chest||0 });
    for(const c of chest||[]) { const e=map.get(c.productId)||{bag:0,chest:0}; e.chest=c.qty; map.set(c.productId,e); }
    for(const [pid, v] of map) {
      await this.prisma.botStock.upsert({ where: { botId_productId: { botId, productId: pid } }, create: { botId, productId: pid, bagQty: v.bag, chestQty: v.chest }, update: { bagQty: v.bag, chestQty: v.chest, updatedAt: new Date() } });
    }
    await this.prisma.bot.update({ where: { id: botId }, data: { lastHeartbeatAt: new Date() } });
  }
}
