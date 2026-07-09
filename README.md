# PawCare - Hệ Thống Phân Khúc Khách Hàng RFM & Tự Động Hóa

Dự án này là module **Phân khúc khách hàng RFM (Recency, Frequency, Monetary)** dành cho hệ sinh thái chăm sóc thú cưng **PawCare**. 
Hệ thống kết hợp phân tích dữ liệu khách hàng, giao diện quản trị (Dashboard) trực quan và tự động hóa các chiến dịch Email Marketing thông qua n8n.

---

## Tính Năng Cốt Lõi

1. **Phân loại RFM Tự động:** Đánh giá khách hàng dựa trên 3 chỉ số Độ mới (R), Tần suất (F), và Doanh thu (M) để chia thành 5 phân khúc chuyên nghiệp:
   - **VIP**
   - **Thân Thiết**
   - **Tiềm Năng**
   - **Nguy Cơ**
   - **Ngủ Đông**
2. **Dashboard Trực Quan:** Báo cáo tổng quan dạng Doughnut Chart và Bar Chart.
3. **Gửi Email Hàng Loạt (Bulk Emailing):** Kích hoạt webhook gửi kịch bản Email cá nhân hóa (khuyến mãi, tri ân) cho từng phân khúc thông qua n8n.
4. **Bảo mật & Tương thích:** Logo và email template được tối ưu hóa bằng hình ảnh Base64 chống chặn hiển thị trên các ứng dụng đọc mail.

---

## Cấu Trúc Thư Mục

```text
D:\rfm_module\
├── automations_n8n/         # Các workflows tự động hóa của n8n (.json)
│   ├── rfm_email_campaign_flow.json
│   └── rfm_routing_flow.json
├── logic/                   # Logic xử lý và tạo dữ liệu giả lập (Python)
│   ├── generate_mock_data.py
│   ├── simulate_email_demo.py
│   └── simulate_webhook.py

├── ui_rfm/                  # Giao diện Frontend Dashboard
│   ├── index.html
│   ├── app.js
│   └── style.css
├── run_dashboard.py         # Script khởi chạy Local Web Server & CORS Proxy
└── Bao_Cao_RFM_PawCare.doc  # Tài liệu báo cáo phân tích nghiệp vụ
```

---

## Hướng Dẫn Sử Dụng & Khởi Chạy

### 1. Chuẩn bị Dữ liệu
Dữ liệu tập khách hàng hiện tại đã được đồng bộ và tích hợp sẵn trên cơ sở dữ liệu **Supabase**. Hệ thống sẽ trực tiếp sử dụng tập dataset thực tế này.
*(Tùy chọn: Nếu bạn cần tạo thêm dữ liệu giả lập để test nội bộ độc lập, bạn vẫn có thể chạy `python generate_mock_data.py` trong thư mục `logic`)*

### 2. Khởi chạy Giao diện Dashboard
Hệ thống đi kèm một HTTP Server Python tích hợp sẵn proxy để xử lý CORS khi gọi Webhook n8n.
```bash
python run_dashboard.py
```

### 3. Tích hợp n8n Workflow
- Mở [n8n](https://n8n.io/) của bạn.
- Nhập (Import) các file JSON trong thư mục `automations_n8n/` vào hệ thống n8n.
- Đảm bảo Webhook URL trong n8n khớp với cấu hình được trỏ tới ở file `app.js` (hoặc thông qua Proxy từ `run_dashboard.py`).

---

## Các Kịch Bản Email Marketing (Mẫu)

- **VIP:** Tri ân Khách hàng VIP - Tặng phần quà đặc biệt (Miễn phí 100% gói Spa Thư Giãn).
- **Thân Thiết:** Ưu đãi giảm giá 20% gói Grooming & Spa toàn diện.
- **Tiềm Năng:** Giới thiệu thêm các dịch vụ bổ trợ.
- **Nguy Cơ:** Tặng Voucher 500.000đ áp dụng cho mọi dịch vụ để kích cầu quay lại.
- **Ngủ Đông:** Giảm giá sốc 30% tất cả dịch vụ, kêu gọi tương tác.

---

*Phát triển bởi Đội ngũ PawCare* 🐾
