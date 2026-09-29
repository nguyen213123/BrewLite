import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { OrdersService } from './orders.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('OrdersService - Concurrent Stock', () => {
  let prisma: PrismaService;
  let service: OrdersService;

  const productId = 3;
  const userId = 4;

  let originalStock: number;
  const createdOrderIds: number[] = [];

  beforeAll(async () => {
    prisma = new PrismaService();
    await prisma.$connect();

    service = new OrdersService(prisma);

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new Error(`Không tìm thấy Product ${productId}`);
    }

    originalStock = product.stock;

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: 1,
      },
    });
  });

  afterAll(async () => {
    for (const orderId of createdOrderIds) {
      await prisma.orderItem.deleteMany({
        where: {
          orderId,
        },
      });

      await prisma.order.delete({
        where: {
          id: orderId,
        },
      });
    }

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: originalStock,
      },
    });

    await prisma.$disconnect();
  });

  it('should allow only one concurrent order when stock is 1', async () => {
    const createOrderDto = {
      items: [
        {
          productId,
          size: 'S',
          quantity: 1,
          toppings: [],
        },
      ],
    };

    const results = await Promise.allSettled([
      service.create(createOrderDto, userId),
      service.create(createOrderDto, userId),
    ]);

    const fulfilled = results.filter(
      (result) => result.status === 'fulfilled',
    );

    const rejected = results.filter(
      (result) => result.status === 'rejected',
    );

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);

    if (fulfilled[0]?.status === 'fulfilled') {
      createdOrderIds.push(fulfilled[0].value.orderId);
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    expect(product?.stock).toBe(0);
  });
});