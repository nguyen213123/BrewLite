'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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

const sizeExtra: Record<string, number> = {
  S: 0,
  M: 5000,
  L: 10000,
};

const toppingExtra: Record<string, number> = {
  'Trân châu': 5000,
  Kem: 5000,
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [size, setSize] = useState('M');
  const [toppings, setToppings] = useState<string[]>([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3001/products/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Không tìm thấy sản phẩm');
        }

        return res.json();
      })
      .then((data: Product) => {
        setProduct(data);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const toggleTopping = (topping: string) => {
    setToppings((current) => {
      if (current.includes(topping)) {
        return current.filter((item) => item !== topping);
      }

      return [...current, topping];
    });
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: totalPrice,
      size,
      toppings,
      quantity: 1,
    };

    addItem(cartItem);

    console.log('Đã thêm vào giỏ:', cartItem);

    alert(
      `Đã thêm vào giỏ hàng!\n\n` +
        `Tên: ${product.name}\n` +
        `Size: ${size}\n` +
        `Topping: ${
          toppings.length > 0
            ? toppings.join(', ')
            : 'Không có'
        }\n` +
        `Giá: ${formatPrice(totalPrice)}`,
    );
  };

  const totalPrice = product
    ? product.price +
      sizeExtra[size] +
      toppings.reduce(
        (total, topping) =>
          total + (toppingExtra[topping] ?? 0),
        0,
      )
    : 0;

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          Đang tải sản phẩm...
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-6 inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            ← Quay về trang chủ
          </Link>

          <div className="rounded-2xl bg-white p-8 text-center shadow">
            <p className="text-red-600">
              {error || 'Không tìm thấy sản phẩm'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/"
          className="mb-6 inline-block rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          ← Quay về trang chủ
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-md">
          <div className="flex h-64 items-center justify-center rounded-xl bg-amber-100">
            <span className="text-8xl">☕</span>
          </div>

          <h1 className="mt-6 text-3xl font-bold text-amber-900">
            {product.name}
          </h1>

          <p className="mt-3 text-gray-600">
            {product.description}
          </p>

          <p className="mt-4 text-2xl font-bold text-amber-700">
            {formatPrice(totalPrice)}
          </p>

          <div className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-gray-800">
              Size
            </h2>

            <div className="flex gap-3">
              {['S', 'M', 'L'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSize(item)}
                  className={`rounded-lg border px-6 py-3 font-medium ${
                    size === item
                      ? 'border-amber-700 bg-amber-700 text-white'
                      : 'border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  {item}

                  {sizeExtra[item] > 0 && (
                    <span className="ml-1 text-sm">
                      (+{formatPrice(sizeExtra[item])})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-800">
                Topping
              </h2>

              <div className="space-y-3">
                {Object.keys(toppingExtra).map((topping) => (
                  <label
                    key={topping}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={toppings.includes(topping)}
                      onChange={() => toggleTopping(topping)}
                      className="h-4 w-4"
                    />

                    <span className="text-gray-700">
                      {topping}
                    </span>

                    <span className="ml-auto text-sm text-gray-500">
                      +{formatPrice(toppingExtra[topping])}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product || product.stock <= 0}
              className="mt-6 w-full rounded-xl bg-amber-700 px-6 py-4 text-lg font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {!product
                ? 'Đang tải...'
                : product.stock <= 0
                  ? 'Hết hàng'
                  : 'Thêm vào giỏ hàng'}
            </button>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Còn lại: {product.stock}
          </p>
        </div>
      </div>
    </main>
  );
}