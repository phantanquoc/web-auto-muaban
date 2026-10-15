import { Module } from '@nestjs/common';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { BotGatewayController } from './bot-gateway.controller';
@Module({ controllers: [BotsController, BotGatewayController], providers: [BotsService] })
export class BotsModule {}
