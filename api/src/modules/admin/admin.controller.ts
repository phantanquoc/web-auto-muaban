import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { AdminService } from './admin.service';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
class CreateBotDto {
  @IsString() name!: string;
  @IsOptional() @IsString() server?: string;
  @IsEnum(['SELL','EXCHANGE']) type!: string;
  @IsOptional() @IsString() mapHint?: string;
  @IsOptional() @IsString() posHint?: string;
  @IsOptional() @IsInt() @Min(1) rateOverride?: number;
  @IsOptional() @IsInt() @Min(1) dailyLimitTt?: number;
  @IsOptional() @IsBoolean() enabled?: boolean;
}
@Controller('admin/bots')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private svc: AdminService){}
  @Get() list(){ return this.svc.list(); }
  @Post() create(@Body() dto:CreateBotDto){ return this.svc.create(dto); }
  @Patch(':id') update(@Param('id') id:string, @Body() dto:any){ return this.svc.update(id,dto); }
  @Delete(':id') remove(@Param('id') id:string){ return this.svc.remove(id); }
  @Get(':id/stock') stock(@Param('id') id:string){ return this.svc.stock(id); }
  @Get(':id/logs') logs(@Param('id') id:string){ return this.svc.logs(id); }
  @Post(':id/rotate-token') rotate(@Param('id') id:string){ return this.svc.rotateToken(id); }
}
