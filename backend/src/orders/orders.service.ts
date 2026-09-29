import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ORDER_STATUS,
  canTransition,
} from './order-status.js';

import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';


@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
  createOrderDto: CreateOrderDto,
  userId: number,
) {
    if (createOrderDto.items.length === 0) {
      throw new BadRequestException(
        'Giỏ hàng không được để trống',
      );
    }

    // Tạm thời dùng user demo.
    // Task 7 sẽ thay bằng userId lấy từ JWT.
    

    return this.prisma.$transaction(async (tx) => {
      let total = 0;

      const orderItems: {
        productId: number;
        size: string;
        qty: number;
        unitPrice: number;
        lineTotal: number;
        toppings: string | null;
      }[] = [];

      for (const item of createOrderDto.items) {
        const product = await tx.product.findUnique({
          where: {
            id: item.productId,
          },
        });

        if (!product) {
          throw new NotFoundException(
            `Không tìm thấy sản phẩm ID ${item.productId}`,
          );
        }

        if (!product.isActive) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" hiện không hoạt động`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" không đủ tồn kho`,
          );
        }

        const sizeExtra: Record<string, number> = {
          S: 0,
          M: 5000,
          L: 10000,
        };

        const toppingPrice = item.toppings.reduce(
          (sum, topping) => sum + 5000,
          0,
        );

        const unitPrice =
          product.price +
          (sizeExtra[item.size] ?? 0) +
          toppingPrice;

        const lineTotal =
          unitPrice * item.quantity;

        total += lineTotal;

        orderItems.push({
          productId: product.id,
          size: item.size,
          qty: item.quantity,
          unitPrice,
          lineTotal,
          toppings:
            item.toppings.length > 0
              ? JSON.stringify(item.toppings)
              : null,
        });
      }
            const promoCode = createOrderDto.promoCode
        ?.trim()
        .toUpperCase();

      let discount = 0;

      if (promoCode) {
        if (promoCode !== 'BREW10') {
          throw new BadRequestException(
            'Mã khuyến mãi không hợp lệ',
          );
        }

        discount = Math.min(
          Math.floor(total * 0.1),
          20000,
        );
      }

      const finalTotal = total - discount;

      const order = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          total: finalTotal,
          discount,
          loyaltyEarned: 0,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
        },
      });

      for (const item of orderItems) {
  const result = await tx.product.updateMany({
    where: {
      id: item.productId,
      isActive: true,
      stock: {
        gte: item.qty,
      },
    },
    data: {
      stock: {
        decrement: item.qty,
      },
    },
  });

  if (result.count === 0) {
    throw new BadRequestException(
      `Sản phẩm ID ${item.productId} không đủ tồn kho`,
    );
  }
}

      return {
  message: 'Tạo đơn hàng thành công',
  orderId: order.id,
  status: order.status,
  subtotal: total,
  discount: order.discount,
  total: order.total,
  promoCode: promoCode ?? null,
  items: order.items,
};
    });
  }
  async findMyOrders(userId: number) {
  return this.prisma.order.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payments: true,
    },
  });
}
async transitionStatus(orderId: number, newStatus: string) {
  const order = await this.prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new NotFoundException('Không tìm thấy đơn hàng');
  }

  if (!canTransition(order.status, newStatus)) {
    throw new BadRequestException(
      `Không thể chuyển trạng thái từ ${order.status} sang ${newStatus}`,
    );
  }

  return this.prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: newStatus,
    },
  });
}
}