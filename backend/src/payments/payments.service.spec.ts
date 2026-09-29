import { PaymentsService } from './payments.service.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const prismaMock = {
    payment: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    service = new PaymentsService(prismaMock as any);
  });

  it('should return existing payment for duplicate idempotency key', async () => {
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 7,
      orderId: 6,
      idempotencyKey: 'TEST-ORDER6-001',
      amount: 40000,
      method: 'CARD',
      status: 'PAID',
      order: {
        id: 6,
        status: 'PAID',
      },
    });

    const result = await service.create(
      {
        orderId: 6,
        method: 'CARD',
      },
      'TEST-ORDER6-001',
    );

    expect(result).toEqual({
      message: 'Yêu cầu thanh toán đã được xử lý trước đó',
      orderId: 6,
      status: 'PAID',
      paymentId: 7,
      amount: 40000,
      method: 'CARD',
    });

    expect(prismaMock.payment.findUnique).toHaveBeenCalledWith({
      where: {
        idempotencyKey: 'TEST-ORDER6-001',
      },
      include: {
        order: true,
      },
    });

    expect(prismaMock.payment.create).not.toHaveBeenCalled();
  });
});