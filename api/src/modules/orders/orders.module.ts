import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { BotOrdersController } from './bot-orders.controller';
import { OrdersCron } from './orders.cron';
@Module({ controllers:[OrdersController, BotOrdersController], providers:[OrdersService, OrdersCron] })
export class OrdersModule {}
