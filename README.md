# Web Paw Care 🐾

Dự án Hệ thống quản lý và Spa dành cho thú cưng (Paw Care).

Dự án được chia làm 2 phần chính: **Frontend** và **Backend**.

## 🛠 Công nghệ sử dụng

### Frontend
- **Next.js** (Phiên bản 16)
- **React** (Phiên bản 19)
- **Tailwind CSS** (Phiên bản 4)
- **Supabase**
- **Lucide React** (Icon)

### Backend
- **Node.js** & **Express**
- **PostgreSQL** (Sử dụng thư viện `pg`)
- **Nodemon** (Môi trường dev)

---

## 🚀 Hướng dẫn Cài đặt & Chạy dự án

Bạn cần mở 2 terminal (cửa sổ dòng lệnh) riêng biệt để chạy song song Frontend và Backend.

### 1. Chạy Backend (API Server)
Mở terminal 1 và chạy các lệnh sau:
```bash
cd backend
npm install
npm run dev
```
Backend server sẽ chạy bằng `nodemon` (mặc định tại cổng do bạn config, ví dụ: http://localhost:5000).

### 2. Chạy Frontend (Web UI)
Mở terminal 2 và chạy các lệnh sau:
```bash
cd frontend
npm install
npm run dev
```
Truy cập vào [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem trang web.

---

## 🗂 Cấu trúc Dự án

- `frontend/`: Chứa mã nguồn giao diện web (Next.js). Các file môi trường (`.env.local`) cần được cấu hình tại đây để kết nối với Backend hoặc Supabase.
- `backend/`: Chứa mã nguồn server API (Express + PostgreSQL).

## 📦 Deploy
- **Frontend**: Có thể dễ dàng được deploy lên [Vercel](https://vercel.com/) hoặc Netlify.
- **Backend**: Có thể deploy lên các dịch vụ như Render, Railway, Fly.io, hoặc VPS tự quản.
