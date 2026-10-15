import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LinkRequiredGuard } from '../../common/guards/link-required.guard';
import { ExchangeService } from './exchange.service';
import { IsString, IsInt, Min } from 'class-validator';
class TtToKcDto { @IsInt() @Min(1) kcAmount!: number; @IsString() botId!: string; }
@Controller('exchange')
@UseGuards(JwtAuthGuard)
export class ExchangeController {
  constructor(private svc: ExchangeService){}
  @Post('tt-to-kc')
  @UseGuards(LinkRequiredGuard)
  async ttToKc(@Req() req:any, @Body() dto:TtToKcDto){ return this.svc.ttToKc(req.user.id, dto.kcAmount, dto.botId); }
}
