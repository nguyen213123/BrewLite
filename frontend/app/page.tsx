'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cartItems = useCartStore((state) => state.items);

const cartItemCount = cartItems.reduce(
  (total, item) => total + item.quantity,
  0,
);

  useEffect(() => {
    fetch('http://localhost:3001/products')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Không thể tải danh sách sản phẩm');
        }

        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-start justify-between gap-4">
  <div>
    <h1 className="text-4xl font-bold text-amber-900">
      BrewLite
    </h1>

    <p className="mt-2 text-gray-600">
      Cà phê ngon - Đặt nhanh - Thanh toán không tiền mặt
    </p>
  </div>

  <Link
    href="/cart"
    className="relative rounded-xl bg-amber-700 px-5 py-3 font-semibold text-white shadow hover:bg-amber-800"
  >
    🛒 Giỏ hàng

    {cartItemCount > 0 && (
      <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
        {cartItemCount}
      </span>
    )}
  </Link>
</div>

        {loading && (
          <div className="py-10 text-center text-gray-500">
            Đang tải sản phẩm...
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center text-gray-500">
            Chưa có sản phẩm nào.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-2xl bg-white shadow-md"
              >
                <div className="flex h-48 items-center justify-center bg-amber-100">
                  <span className="text-6xl">☕</span>
                </div>

                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {product.name}
                  </h2>

                  <p className="mt-2 min-h-12 text-sm text-gray-500">
                    {product.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-amber-700">
                      {formatPrice(product.price)}
                    </span>

                    <Link
                      href={`/products/${product.id}`}
                      className="rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white"
                    >
                      Chọn
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}