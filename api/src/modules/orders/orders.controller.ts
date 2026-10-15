import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LinkRequiredGuard } from '../../common/guards/link-required.guard';
import { OrdersService } from './orders.service';
import { IsString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
class OrderItemDto { @IsInt() productId!: number; @IsInt() @Min(1) qty!: number; }
class CreateOrderDto { @IsString() botId!: string; @IsArray() @ValidateNested({ each:true }) @Type(()=>OrderItemDto) items!: OrderItemDto[]; }

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private svc: OrdersService){}
  @Post()
  @UseGuards(LinkRequiredGuard)
  async create(@Req() req:any, @Body() dto: CreateOrderDto){ return this.svc.create(req.user.id, dto.botId, dto.items); }
  @Get()
  async list(@Req() req:any){ return this.svc.list(req.user.id); }
  @Get(':id')
  async get(@Req() req:any, @Param('id') id:string){ return this.svc.get(req.user.id, id); }
}
