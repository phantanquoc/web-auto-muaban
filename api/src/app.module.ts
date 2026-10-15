import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BotsModule } from './modules/bots/bots.module';
import { ShopModule } from './modules/shop/shop.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    BotsModule,
    ShopModule,
    OrdersModule,
    ExchangeModule,
    AdminModule,
  ],
})
export class AppModule {}
