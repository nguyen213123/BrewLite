# BrewLite ☕

BrewLite là ứng dụng đặt cà phê trực tuyến, hỗ trợ xem menu, chọn sản phẩm, tùy chọn size/topping, quản lý giỏ hàng, đăng nhập, đặt hàng và thanh toán không tiền mặt.

---

## 1. Công nghệ sử dụng

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- Zustand

### Backend
- NestJS
- TypeScript
- Prisma ORM
- JWT Authentication
- bcrypt

### Database
- Microsoft SQL Server

---

## 2. Kiến trúc dự án

```text
BrewLite/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── products/
│   │   ├── prisma/
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── .env
│
├── frontend/
│   ├── app/
│   │   ├── checkout/
│   │   │   ├── page.tsx
│   │   │   └── success/
│   │   │       └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── store/
│       └── cartStore.ts
│
└── README.md
```

---

## 3. Các chức năng chính

### 3.1. Sản phẩm
- Xem danh sách sản phẩm.
- Xem chi tiết sản phẩm.
- Chọn size S/M/L.
- Chọn topping.
- Tự động tính giá theo size và topping.

### 3.2. Giỏ hàng
- Thêm sản phẩm.
- Tăng số lượng.
- Giảm số lượng.
- Xóa sản phẩm.
- Tự động tính tổng tiền.
- Hiển thị số lượng sản phẩm trên biểu tượng giỏ hàng.

### 3.3. Tài khoản
- Đăng ký tài khoản.
- Đăng nhập.
- Mã hóa mật khẩu bằng bcrypt.
- Xác thực bằng JWT.

### 3.4. Đặt hàng
- Tạo đơn hàng từ giỏ hàng.
- Kiểm tra sản phẩm.
- Kiểm tra tồn kho.
- Tính tổng tiền.
- Lưu đơn hàng với trạng thái `PENDING`.

### 3.5. Thanh toán
- Hỗ trợ phương thức `WALLET`.
- Hỗ trợ phương thức `CARD`.
- Mock payment.
- Thanh toán thành công chuyển trạng thái đơn hàng sang `PAID`.
- Thanh toán thất bại chuyển trạng thái sang `PAYMENT_FAILED`.
- Hiển thị màn hình xác nhận sau khi thanh toán.

### 3.6. Lịch sử đơn hàng
- Xem lịch sử đơn hàng của tài khoản hiện tại.
- Hiển thị mã đơn hàng.
- Hiển thị ngày đặt hàng.
- Hiển thị sản phẩm trong đơn.
- Hiển thị size và topping.
- Hiển thị tổng tiền.
- Hiển thị trạng thái đơn hàng.
- Hiển thị phương thức thanh toán.

---

## 4. API chính

### Products

```text
GET /products
GET /products/:id
```

### Authentication

```text
POST /auth/register
POST /auth/login
```

### Orders

```text
POST /orders
GET /orders/me
```

### Payments

```text
POST /payments
```

---

## 5. Database

Database sử dụng Microsoft SQL Server.

```text
Server: localhost
Port: 1433
Database: BrewLite
```

### Các bảng chính

```text
User
Product
Order
OrderItem
Payment
```

---

## 6. Cấu hình Backend

Di chuyển vào thư mục backend:

```bash
cd backend
```

Cài đặt dependencies:

```bash
npm install
```

Tạo file:

```text
backend/.env
```

Cấu hình các biến môi trường:

```env
DATABASE_URL="..."

DB_SERVER="localhost"
DB_PORT="1433"
DB_NAME="BrewLite"
DB_USER="sa"
DB_PASSWORD="your_password"

JWT_SECRET="your_secret"
JWT_EXPIRES_IN="1d"

MOCK_PAYMENT_FAIL="false"
```

> Không đưa mật khẩu SQL Server và JWT secret thật lên GitHub.

---

## 7. Chạy Backend

Mở terminal:

```bash
cd C:\BrewLite\backend
```

Chạy:

```bash
npm run start:dev
```

Backend:

```text
http://localhost:3001
```

---

## 8. Chạy Frontend

Mở terminal khác:

```bash
cd C:\BrewLite\frontend
```

Cài đặt dependencies:

```bash
npm install
```

Chạy:

```bash
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 9. Các trang chính của Frontend

```text
/                       Trang menu
/products/:id           Chi tiết sản phẩm
/cart                   Giỏ hàng
/login                  Đăng nhập
/checkout               Thanh toán
/checkout/success       Xác nhận thanh toán
/orders                 Lịch sử đơn hàng
```

---

## 10. Quy trình sử dụng hệ thống

```text
Trang chủ
   ↓
Chọn sản phẩm
   ↓
Chi tiết sản phẩm
   ↓
Chọn size + topping
   ↓
Thêm vào giỏ hàng
   ↓
Giỏ hàng
   ↓
Thanh toán
   ↓
Đăng nhập
   ↓
Tạo đơn hàng
   ↓
Chọn WALLET / CARD
   ↓
Xác nhận thanh toán
   ↓
Thanh toán thành công
   ↓
Trạng thái PAID
   ↓
Checkout Success
   ↓
Lịch sử đơn hàng
```

---

## 11. Trạng thái đơn hàng

Hệ thống hỗ trợ các trạng thái:

```text
PENDING
PAID
PAYMENT_FAILED
PREPARING
READY
COMPLETED
CANCELLED
```

### Ý nghĩa

```text
PENDING
↓
Đơn hàng chờ thanh toán

PAID
↓
Thanh toán thành công

PAYMENT_FAILED
↓
Thanh toán thất bại

PREPARING
↓
Đang chuẩn bị đồ uống

READY
↓
Đơn hàng đã sẵn sàng

COMPLETED
↓
Đơn hàng hoàn thành

CANCELLED
↓
Đơn hàng đã hủy
```

---

## 12. Authentication

Hệ thống sử dụng JWT để xác thực người dùng.

Các API yêu cầu đăng nhập:

```text
POST /orders
GET /orders/me
```

JWT được gửi thông qua:

```text
Authorization: Bearer <access_token>
```

Password người dùng được mã hóa bằng:

```text
bcrypt
```

---

## 13. Kiểm tra TypeScript

### Backend

```bash
cd C:\BrewLite\backend
npx tsc --noEmit
```

### Frontend

```bash
cd C:\BrewLite\frontend
npx tsc --noEmit
```

Nếu không có output lỗi thì TypeScript đã kiểm tra thành công.

---

## 14. Kiểm thử thanh toán

### Thanh toán thành công

Trong file:

```text
backend/.env
```

sử dụng:

```env
MOCK_PAYMENT_FAIL="false"
```

Sau đó khởi động lại Backend.

Kết quả:

```text
PENDING
   ↓
Thanh toán
   ↓
PAID
```

### Thanh toán thất bại

Đổi thành:

```env
MOCK_PAYMENT_FAIL="true"
```

Sau đó khởi động lại Backend.

Kết quả:

```text
PENDING
   ↓
Thanh toán thất bại
   ↓
PAYMENT_FAILED
```

Sau khi kiểm thử xong, có thể đưa lại:

```env
MOCK_PAYMENT_FAIL="false"
```

---

## 15. Lịch sử đơn hàng

API:

```text
GET /orders/me
```

API yêu cầu JWT.

Response trả về các thông tin:

```text
Order
├── id
├── userId
├── status
├── total
├── discount
├── loyaltyEarned
├── createdAt
├── updatedAt
├── items
│   ├── product
│   ├── size
│   ├── qty
│   ├── unitPrice
│   ├── lineTotal
│   └── toppings
└── payments
    ├── method
    ├── amount
    └── status
```

Frontend hiển thị tại:

```text
http://localhost:3000/orders
```

---

## 16. Tài khoản kiểm thử

Có thể tạo tài khoản mới từ trang đăng ký:

```text
http://localhost:3000/login
```

Quy trình kiểm thử:

```text
Đăng ký
   ↓
Đăng nhập
   ↓
Xem menu
   ↓
Chọn sản phẩm
   ↓
Thêm vào giỏ
   ↓
Thanh toán
   ↓
Xem màn hình xác nhận
   ↓
Xem lịch sử đơn hàng
```

---

## 17. Cách kiểm tra toàn bộ hệ thống

### Bước 1 - Khởi động SQL Server

Đảm bảo SQL Server đang chạy và database `BrewLite` tồn tại.

### Bước 2 - Khởi động Backend

```bash
cd C:\BrewLite\backend
npm run start:dev
```

### Bước 3 - Khởi động Frontend

Mở terminal mới:

```bash
cd C:\BrewLite\frontend
npm run dev
```

### Bước 4 - Mở hệ thống

```text
http://localhost:3000
```

### Bước 5 - Kiểm thử

```text
Menu
→ Product Detail
→ Cart
→ Login
→ Checkout
→ Payment
→ Checkout Success
→ Orders
```

---

## 18. Lưu ý bảo mật

Không commit các thông tin bí mật:

```text
DB_PASSWORD
JWT_SECRET
access_token
```

File `.env` nên được thêm vào `.gitignore`.

Ví dụ:

```gitignore
.env
.env.local
node_modules/
.next/
```

---

## 19. Mục tiêu dự án

BrewLite hướng tới một quy trình đặt cà phê trực tuyến hoàn chỉnh:

```text
Xem sản phẩm
→ Chọn sản phẩm
→ Tùy chỉnh
→ Giỏ hàng
→ Đặt hàng
→ Thanh toán
→ Xác nhận
→ Xem lịch sử đơn hàng
```

---

## 20. Thông tin dự án

```text
Project: BrewLite
Mục đích: Software Engineering Project

Frontend:
Next.js + TypeScript + Tailwind CSS + Zustand

Backend:
NestJS + TypeScript + Prisma + JWT + bcrypt

Database:
Microsoft SQL Server

Frontend Port:
3000

Backend Port:
3001
```
