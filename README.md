# PawCare - RFM Customer Segmentation & Automation

Module Phân khúc khách hàng RFM (Recency, Frequency, Monetary) thuộc hệ sinh thái chăm sóc thú cưng **PawCare**. Hệ thống kết hợp phân tích dữ liệu Supabase, giao diện Dashboard trực quan và tự động hóa Email Marketing thông qua n8n.

---

## Tính Năng Cốt Lõi

1. **Phân loại RFM Tự động:** Đánh giá khách hàng để chia thành 5 phân khúc:
   - **VIP** (Mang lại giá trị cao nhất)
   - **Thân Thiết** (Khách hàng trung thành)
   - **Tiềm Năng** (Khách hàng mới/Có tiềm năng)
   - **Nguy Cơ** (Có dấu hiệu rời bỏ)
   - **Ngủ Đông** (Đã mất kết nối)
2. **Dashboard Trực Quan:** Báo cáo tổng quan dạng Doughnut Chart và Bar Chart.
3. **Email Marketing Tự động:** Kích hoạt Webhook n8n để gửi kịch bản Email cá nhân hóa cho từng phân khúc (Tương thích tốt qua Serverless API).
4. **Bảo mật & Tương thích:** Logo và template Email được tối ưu hóa bằng hình ảnh Base64 chống chặn hiển thị.

---

## Cấu Trúc Dự Án

```text
D:\rfm_module\
├── api/                     # Serverless Functions (dành cho Vercel)
│   └── proxy.js             # API Proxy lách CORS để kết nối n8n
├── automations_n8n/         # Workflows tự động hóa n8n (.json)
│   ├── rfm_email_campaign_flow.json
│   └── rfm_routing_flow.json
├── logic/                   # Logic Python xử lý và tạo Mock Data
│   ├── generate_mock_data.py
│   └── ...
├── ui_rfm/                  # Frontend Dashboard (HTML/CSS/JS)
│   ├── index.html
│   ├── app.js
│   └── style.css
├── Bao_Cao_RFM_PawCare.doc  # Tài liệu báo cáo phân tích nghiệp vụ
├── run_dashboard.py         # Script khởi chạy Local Web Server (Môi trường dev)
└── vercel.json              # Cấu hình tự động Deploy lên Vercel
```

---

## Hướng Dẫn Sử Dụng & Triển Khai

### 1. Dữ liệu (Supabase)
Dữ liệu khách hàng đã được đồng bộ và tích hợp sẵn trên **Supabase**. Bảng điều khiển sẽ tự động trích xuất và tính toán thông qua API. 
*(Nếu cần test nội bộ không dùng database, chạy `python generate_mock_data.py` trong thư mục `logic` để tạo dữ liệu giả lập).*

### 2. Môi trường Phát triển (Local)
Chạy lệnh sau tại thư mục gốc để mở Dashboard và kích hoạt Proxy nội bộ:
```bash
python run_dashboard.py
```

### 3. Triển khai Đám mây (Vercel)
Dự án đã được tích hợp sẵn cấu hình Vercel. Bạn có thể deploy trực tiếp bằng cách đẩy code lên GitHub và kết nối với Vercel, hoặc dùng lệnh:
```bash
npx vercel
```
*Lưu ý: API trung gian (Serverless) `/api/proxy` sẽ tự động hoạt động trên Vercel để kết nối Webhook n8n một cách bảo mật.*

### 4. Tích hợp n8n Workflow
- Mở [n8n](https://n8n.io/) và Import các file JSON trong thư mục `automations_n8n/`.
- Thay thế Webhook URL của n8n vào ô cấu hình trên giao diện Dashboard.

---

## Kịch Bản Email Mẫu

- **VIP:** Tri ân Khách hàng VIP - Tặng gói Spa Thư Giãn miễn phí.
- **Thân Thiết:** Ưu đãi giữ chân - Giảm giá 20% gói Grooming.
- **Tiềm Năng:** Giới thiệu thêm dịch vụ bổ trợ.
- **Nguy Cơ:** Tặng Voucher 500k kích cầu quay lại.
- **Ngủ Đông:** Giảm giá sốc 30% kêu gọi tương tác.

---

*Phát triển bởi Đội ngũ PawCare* 🐾
