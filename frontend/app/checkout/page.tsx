'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [method, setMethod] = useState<'WALLET' | 'CARD'>(
    'WALLET',
  );

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    try {
      setIsPaying(true);
      setError('');

      const accessToken =
        localStorage.getItem('accessToken');

      if (!accessToken) {
        router.push('/login');
        return;
      }

      // BƯỚC 1: TẠO ORDER
      const orderResponse = await fetch(
        'http://localhost:3001/orders',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              productId: item.productId,
              size: item.size,
              quantity: item.quantity,
              toppings: item.toppings,
            })),
          }),
        },
      );

      const orderData = await orderResponse.json();

      if (orderResponse.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      if (!orderResponse.ok) {
        throw new Error(
          Array.isArray(orderData.message)
            ? orderData.message.join(', ')
            : orderData.message ||
                'Không thể tạo đơn hàng',
        );
      }

      // BƯỚC 2: TẠO IDEMPOTENCY KEY
      // Key gắn với chính order để nếu request bị gửi lại
      // thì backend nhận diện được cùng một yêu cầu thanh toán.
      const idempotencyKey =
        `BREWLITE-ORDER-${orderData.orderId}`;

      // BƯỚC 3: THANH TOÁN
      const paymentResponse = await fetch(
        'http://localhost:3001/payments',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            orderId: orderData.orderId,
            method,
          }),
        },
      );

      const paymentData =
        await paymentResponse.json();

      // Thanh toán thất bại
      if (!paymentResponse.ok) {
        throw new Error(
          Array.isArray(paymentData.message)
            ? paymentData.message.join(', ')
            : paymentData.message ||
                'Thanh toán thất bại',
        );
      }

      if (paymentData.status !== 'PAID') {
        throw new Error('Thanh toán chưa thành công');
      }

      // Chỉ xóa giỏ sau khi PAID
      clearCart();

      // Lưu thông tin đơn để trang xác nhận dùng
      sessionStorage.setItem(
        'lastOrder',
        JSON.stringify({
          orderId: paymentData.orderId,
          status: paymentData.status,
          amount: paymentData.amount,
          method: paymentData.method,
          loyaltyEarned: paymentData.loyaltyEarned,
        }),
      );

      router.push('/checkout/success');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Thanh toán thất bại',
      );
    } finally {
      setIsPaying(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-800">
            Giỏ hàng đang trống
          </h1>

          <Link
            href="/"
            className="mt-5 inline-block rounded-lg bg-amber-700 px-5 py-3 text-white"
          >
            Về menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/cart"
          className="text-amber-700 hover:underline"
        >
          ← Quay lại giỏ hàng
        </Link>

        <div className="mt-6 rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-bold text-amber-900">
            Thanh toán
          </h1>

          <div className="mt-6">
            <h2 className="text-lg font-semibold">
              Tổng tiền
            </h2>

            <p className="mt-2 text-3xl font-bold text-amber-700">
              {formatPrice(totalPrice)}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">
              Phương thức thanh toán
            </h2>

            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="WALLET"
                  checked={method === 'WALLET'}
                  onChange={() => setMethod('WALLET')}
                />

                <span>Ví điện tử</span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border p-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={method === 'CARD'}
                  onChange={() => setMethod('CARD')}
                />

                <span>Thẻ ngân hàng</span>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePayment}
            disabled={isPaying}
            className="mt-8 w-full rounded-xl bg-amber-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isPaying
              ? 'Đang xử lý thanh toán...'
              : 'Xác nhận thanh toán'}
          </button>

          {error && (
            <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}