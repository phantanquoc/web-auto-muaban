import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrdersService } from './orders.service';
@Injectable()
export class OrdersCron {
  constructor(private svc: OrdersService){}
  @Cron('*/60 * * * * *')
  async handle(){ await this.svc.expirePending(); }
}
