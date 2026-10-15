import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BotTokenGuard } from '../../common/guards/bot-token.guard';
import { CurrentBot } from '../../common/decorators/bot.decorator';
import { ExchangeService } from './exchange.service';
import { IsString, IsInt, Min } from 'class-validator';
class KcToTtDto { @IsString() characterName!: string; @IsInt() @Min(1) kcAmount!: number; }
@Controller('bot/exchange')
@UseGuards(BotTokenGuard)
export class BotExchangeController {
  constructor(private svc: ExchangeService){}
  @Post('kc-to-tt')
  async kcToTt(@CurrentBot() bot:any, @Body() dto:KcToTtDto){
    return this.svc.kcToTt(dto.characterName, dto.kcAmount, bot.id);
  }
  @Post('tt-to-kc/fulfilled')
  async fulfilled(@CurrentBot() bot:any, @Body() body:any){
    return this.svc.ttToKcFulfilled(body.exchangeId||body.id, bot.id);
  }
  @Post('tt-to-kc/:id/fulfilled')
  async fulfilled2(@Param('id') id:string, @CurrentBot() bot:any){
    return this.svc.ttToKcFulfilled(id, bot.id);
  }
}
