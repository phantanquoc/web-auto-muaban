import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { BotTokenGuard } from '../../common/guards/bot-token.guard';
import { CurrentBot } from '../../common/decorators/bot.decorator';
import { BotsService } from './bots.service';
@Controller('bot')
@UseGuards(BotTokenGuard)
export class BotGatewayController {
  constructor(private svc: BotsService) {}
  @Post('heartbeat')
  async hb(@CurrentBot() bot:any){ await this.svc.heartbeat(bot.id); return { ok:true }; }
  @Post('stock')
  async stock(@CurrentBot() bot:any, @Body() body:any){
    await this.svc.upsertStock(bot.id, body.bag||body.bagItems||[], body.chest||body.chestItems||[]);
    return { ok:true };
  }
}
