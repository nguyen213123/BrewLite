import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePaymentDto } from './dto/create-payment.dto.js';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
  createPaymentDto: CreatePaymentDto,
  idempotencyKey: string | undefined,
) {
  if (!idempotencyKey) {
  throw new BadRequestException(
    'Thiếu Idempotency-Key',
  );
}
const existingPayment = await this.prisma.payment.findUnique({
  where: {
    idempotencyKey,
  },
  include: {
    order: true,
  },
});

if (existingPayment) {
  if (existingPayment.orderId !== createPaymentDto.orderId) {
    throw new BadRequestException(
      'Idempotency-Key đã được sử dụng cho đơn hàng khác',
    );
  }

  if (existingPayment.method !== createPaymentDto.method) {
    throw new BadRequestException(
      'Idempotency-Key đã được sử dụng với phương thức thanh toán khác',
    );
  }

  return {
    message: 'Yêu cầu thanh toán đã được xử lý trước đó',
    orderId: existingPayment.orderId,
    status: existingPayment.order.status,
    paymentId: existingPayment.id,
    amount: existingPayment.amount,
    method: existingPayment.method,
  };
}
    const order = await this.prisma.order.findUnique({
      where: {
        id: createPaymentDto.orderId,
      },
    });

    if (!order) {
      throw new NotFoundException(
        'Không tìm thấy đơn hàng',
      );
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Đơn hàng hiện ở trạng thái ${order.status} và không thể thanh toán`,
      );
    }

    const paymentAmount = order.total;

    const paymentSuccess =
        process.env.MOCK_PAYMENT_FAIL !== 'true'

    if (!paymentSuccess) {
      await this.prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'PAYMENT_FAILED',
        },
      });

      return {
        message: 'Thanh toán thất bại',
        status: 'PAYMENT_FAILED',
        orderId: order.id,
      };
    }

    const loyaltyEarned = Math.floor(paymentAmount / 10000);

const result = await this.prisma.$transaction(async (tx) => {
  const payment = await tx.payment.create({
    data: {
      orderId: order.id,
      idempotencyKey,
      amount: paymentAmount,
      method: createPaymentDto.method,
      status: 'PAID',
    },
  });

  const updatedOrder = await tx.order.update({
    where: {
      id: order.id,
    },
    data: {
      status: 'PAID',
      loyaltyEarned,
    },
  });

  await tx.user.update({
    where: {
      id: order.userId,
    },
    data: {
      loyaltyPoints: {
        increment: loyaltyEarned,
      },
    },
  });

  return {
    payment,
    updatedOrder,
  };
});
   return {
  message: 'Thanh toán thành công',
  orderId: result.updatedOrder.id,
  status: result.updatedOrder.status,
  paymentId: result.payment.id,
  amount: result.payment.amount,
  method: result.payment.method,
  loyaltyEarned,
};
  }
}