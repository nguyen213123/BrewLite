import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

      const order = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          total,
          discount: 0,
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
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              decrement: item.qty,
            },
          },
        });
      }

      return {
        message: 'Tạo đơn hàng thành công',
        orderId: order.id,
        status: order.status,
        total: order.total,
        items: order.items,
      };
    });
  }
}