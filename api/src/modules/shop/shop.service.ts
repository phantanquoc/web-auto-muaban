import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService){}
  async products(){
    const products = await this.prisma.product.findMany({ orderBy:{ id:'asc' } });
    const stocks = await this.prisma.botStock.findMany();
    // aggregate hint: sum bag
    const agg = new Map<number,number>();
    for(const s of stocks) agg.set(s.productId, (agg.get(s.productId)||0)+s.bagQty);
    return products.map(p=>({ ...p, totalBag: agg.get(p.id)||0 }));
  }
}
