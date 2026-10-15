import { Controller, Get, Param } from '@nestjs/common';
import { BotsService } from './bots.service';
@Controller()
export class BotsController {
  constructor(private svc: BotsService) {}
  @Get('bots')
  async list(){ return this.svc.listPublic(); }
  @Get('bots/:id/stock')
  async stock(@Param('id') id:string){ const r=await this.svc.stock(id); if(!r) return { error:'NOT_FOUND' }; return r; }
}
