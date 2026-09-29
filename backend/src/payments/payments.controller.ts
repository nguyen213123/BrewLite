import {
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';

import { PaymentsService } from './payments.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Headers('Idempotency-Key') idempotencyKey: string | undefined,
  ) {
    return this.paymentsService.create(
      createPaymentDto,
      idempotencyKey,
    );
  }
}