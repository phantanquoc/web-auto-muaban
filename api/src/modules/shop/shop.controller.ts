import { Controller, Get } from '@nestjs/common';
import { ShopService } from './shop.service';
@Controller('shop')
export class ShopController {
  constructor(private svc: ShopService){}
  @Get('products') async list(){ return this.svc.products(); }
}
