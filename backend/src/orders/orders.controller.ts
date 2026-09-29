import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyOrders(@Req() req: any) {
    return this.ordersService.findMyOrders(req.user.userId);
  }
  @UseGuards(JwtAuthGuard)
@Patch(':id/status')
updateStatus(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: UpdateOrderStatusDto,
) {
  return this.ordersService.transitionStatus(id, dto.status);
}
}
