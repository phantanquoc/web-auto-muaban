import { Module } from '@nestjs/common';
import { ExchangeController } from './exchange.controller';
import { BotExchangeController } from './bot-exchange.controller';
import { ExchangeService } from './exchange.service';
@Module({ controllers:[ExchangeController, BotExchangeController], providers:[ExchangeService] })
export class ExchangeModule {}
