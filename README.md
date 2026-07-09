# Web Paw Care 🐾

Dự án Hệ thống quản lý và Spa dành cho thú cưng (Paw Care).

## 🚀 Hướng dẫn Cài đặt & Chạy dự án

1. **Cài đặt thư viện:**
   ```bash
   npm install
   ```
2. **Chạy dự án ở chế độ phát triển (development):**
   ```bash
   npm run dev
   ```
3. Truy cập vào [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## 🗂 Cấu trúc Dữ liệu (Lưu ý cho người kế tiếp)

- Hiện tại, toàn bộ hệ thống đang sử dụng **Mock Data** (dữ liệu giả lập) để phục vụ cho giao diện Frontend.
- Dữ liệu giả lập này nằm tại thư mục `data/` (ví dụ: `ordersApi.js`, `bookings.js`, `customersApi.js`, v.v.).
- Các hàm gọi API (như fetch, create, update) hiện đang giả lập bằng cách sửa đổi trực tiếp vào biến lưu trong bộ nhớ (in-memory) và dùng `setTimeout` để mô phỏng độ trễ của mạng.
- **Để đưa dự án vào thực tế (Production):** Bạn sẽ cần xây dựng Backend API thực sự (NodeJS/Python/PHP...) và kết nối CSDL, sau đó thay thế logic trong các file ở thư mục `data/` thành các lệnh `fetch` hoặc `axios` thực tế gọi đến API Backend đó.

## 🛠 Công nghệ sử dụng

- **Next.js** (Pages Router)
- **React**
- **Tailwind CSS** (cho việc style giao diện - *nếu có*)
- Và các thư viện UI khác.

## 📦 Deploy

Dự án có thể dễ dàng được deploy lên [Vercel](https://vercel.com/) hoặc bất kỳ nền tảng nào hỗ trợ Node.js/Next.js.
