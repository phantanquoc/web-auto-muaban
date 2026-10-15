import { Controller, Post, Get, Param, UseGuards } from '@nestjs/common';
import { BotTokenGuard } from '../../common/guards/bot-token.guard';
import { CurrentBot } from '../../common/decorators/bot.decorator';
import { OrdersService } from './orders.service';
@Controller('bot/orders')
@UseGuards(BotTokenGuard)
export class BotOrdersController {
  constructor(private svc: OrdersService){}
  @Get('pending')
  async pending(@CurrentBot() bot:any){ return this.svc.pendingForBot(bot.id); }
  @Post(':id/fulfilled')
  async fulfilled(@Param('id') id:string, @CurrentBot() bot:any){ return this.svc.fulfill(id, bot.id); }
}
