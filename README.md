<div align="center">
  <h1>🐾 Web Paw Care 🐾</h1>
  <p><strong>PawCare – Nền tảng Quản lý Cửa hàng Dịch vụ Thú cưng</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](#)
</div>

---

## 🌟 Giới thiệu (About the Project)

**Paw Care** là một giải pháp chuyển đổi số toàn diện dành cho các cửa hàng chăm sóc, kinh doanh vật dụng và dịch vụ thú cưng (Pet Spa / Pet Hotel). Dự án mang đến trải nghiệm mượt mà từ phía Khách hàng (đặt lịch, mua sắm, theo dõi hồ sơ thú cưng) cho đến Hệ thống Quản trị nội bộ dành cho Nhân viên (Staff Dashboard).

Với giao diện hiện đại, tối ưu UX/UI và sử dụng sức mạnh của kiến trúc Serverless với Supabase (BaaS), **Paw Care** không chỉ giúp việc đặt lịch grooming/lưu trú trở nên dễ dàng mà còn tối ưu hóa quy trình quản lý, tăng năng suất cho doanh nghiệp thú cưng.

---

## ✨ Tính năng Nổi bật (Key Features)

### 👩‍💻 Dành cho Khách hàng (Customer Experience)
- 📅 **Đặt lịch Grooming & Hotel**: Đặt lịch chăm sóc spa hoặc phòng lưu trú cho thú cưng với giao diện thân thiện.
- 🐶 **Quản lý Hồ sơ Thú cưng (Pet Profile)**: Tạo và lưu trữ thông tin chi tiết, tiểu sử, bệnh án của từng bé thú cưng.
- 🛍️ **Cửa hàng (Shop)**: Xem danh sách sản phẩm, thêm vào giỏ hàng và thanh toán tiện lợi.
- 🔔 **Nhắc nhở & Lịch sử**: Xem lịch sử dịch vụ, kiểm tra trạng thái booking (Chờ check-in, Đang lưu trú, Đã hoàn thành).

### 👨‍💼 Dành cho Nhân viên (Staff Management)
- 📊 **Dashboard Quản lý**: Giao diện trực quan để quản lý lịch hẹn trong ngày.
- 🏨 **Tiếp nhận & Check-in/Check-out**: Xử lý trạng thái dịch vụ, cập nhật trạng thái hóa đơn thanh toán trực tiếp.
- 🏥 **Hồ sơ Sức khỏe (Health Record)**: Ghi chú tình trạng da, lông, mắt, tai trước và trong quá trình dịch vụ.
- 📝 **Nhật ký Chăm sóc (Sitter Diary)**: Theo dõi hoạt động, ăn uống, vệ sinh hàng ngày cho thú cưng lưu trú.

---

## 🛠 Kiến trúc & Công nghệ (Tech Stack)

Dự án được xây dựng dựa trên kiến trúc **Serverless** với các công nghệ tiên tiến nhất:

| Phần | Công nghệ sử dụng | Chức năng |
| :--- | :--- | :--- |
| **Frontend** | `Next.js 16`, `React 19`, `Tailwind CSS 4`, `Lucide React` | Xây dựng giao diện UI/UX tương tác nhanh, mượt mà và tối ưu hóa SEO. |
| **Backend & Database (BaaS)** | `Supabase` (PostgreSQL) | Lưu trữ dữ liệu quan hệ mạnh mẽ, cung cấp API trực tiếp, hỗ trợ Realtime và Auth. |

---

## 🚀 Hướng dẫn Cài đặt & Khởi chạy (Getting Started)

Để chạy dự án trên môi trường Local, bạn chỉ cần cấu hình file môi trường và khởi chạy Frontend.

### 1️⃣ Khởi chạy Dự án (Web UI)
Mở cửa sổ terminal và chạy các lệnh sau:
```bash
cd frontend
npm install
npm run dev
```
> **Lưu ý:** Giao diện web sẽ khởi chạy tại [http://localhost:3000](http://localhost:3000). Đừng quên cập nhật các key của `Supabase` (`NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`) trong file `frontend/.env.local`.

---

## 🗂 Cấu trúc Thư mục (Project Structure)

```text
📦 Web_PawCare
 ┗ 📂 frontend/       # Chứa mã nguồn UI Next.js
    ┣ 📂 src/
    ┃ ┣ 📂 components/  # Các UI components tái sử dụng (Layout, Modals, Buttons...)
    ┃ ┣ 📂 features/    # Chứa logic nghiệp vụ theo từng domain (grooming, hotel, profile...)
    ┃ ┣ 📂 pages/       # Cấu hình routing của Next.js (App pages)
    ┃ ┗ 📂 services/    # Kết nối trực tiếp API qua Supabase Clients
    ┗ 📜 .env.local     # File biến môi trường Frontend chứa Supabase Keys
```


<div align="center">
  <i>Được phát triển với ❤️ dành riêng cho những người yêu thú cưng!</i>
</div>
