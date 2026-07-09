-- =========================================
-- PAW CARE SEED DATA
-- =========================================

-- Tạm thời vô hiệu hóa kiểm tra khóa ngoại
SET session_replication_role = 'replica';

INSERT INTO public.category (category_id, name) VALUES
('CAT00001', 'Thức ăn'),
('CAT00002', 'Đồ chơi'),
('CAT00003', 'Phụ kiện'),
('CAT00004', 'Dinh dưỡng'),
('CAT00005', 'Vệ sinh')
ON CONFLICT (category_id) DO NOTHING;

INSERT INTO public.staff (staff_id, last_name, first_name, full_name, role, phone, email, password_hash, hire_date, shift, status, avatar_url) VALUES
('STAFF-001', '', '', 'Yến Ngân', 'Admin Master', '0901234567', 'yenngan.admin@pawcare.com', 'hash', NULL, 'Toàn thời gian', 'Đang hoạt động', NULL),
('STAFF-002', '', '', 'Nguyễn Văn A', 'Pet Sitter', '0987654321', 'nva@pawcare.com', 'hash', NULL, 'Ca Sáng (08:00 - 16:00)', 'Đang hoạt động', NULL) ON CONFLICT (staff_id) DO NOTHING;

INSERT INTO public.customer (customer_id, last_name, first_name, phone, email, password_hash, total_spent, created_at) VALUES
('CUST-001', 'Nguyễn', 'Yến Ngân', '0901234567', 'yenngan@example.com', 'hash', 3500000, '2025-10-15'),
('CUST-002', 'Lê Đức', 'Tuấn', '0912345678', 'tuanle@example.com', 'hash', 850000, '2026-01-20'),
('CUST-003', 'Trần Ngọc', 'Mai', '0923456789', 'ngocmai@example.com', 'hash', 4200000, '2026-03-05'),
('CUST-004', 'Phạm', 'Hùng', '0933333333', '', 'hash', 200000, '2026-06-25'),
('CUST-005', 'Lê Hoàng', 'Vinh', '0911111111', 'hoangvinh@example.com', 'hash', 900000, '2026-06-20') ON CONFLICT (customer_id) DO NOTHING;

INSERT INTO public.pet (pet_id, customer_id, pet_name, species, size, breed, weight, dob, gender, behavior_notes, allergy_notes, special_notes) VALUES
('P001', 'CUST-001', 'Bông', 'Chó', 'Small', 'Poodle', 3.2, '2023-05-10', 'Cái', 'Tăng động, quấn chủ', 'Dị ứng thịt gà', 'Hay sủa khi gặp người lạ'),
('P002', 'CUST-002', 'Miu Miu', 'Mèo', 'Small', 'Anh Lông Dài', 4.5, '2022-11-20', 'Cái', 'Hiền, nhát người', 'Không', 'Đang bị rụng lông mùa thay lông'),
('P003', 'CUST-003', 'Buddy', 'Chó', 'Large', 'Golden Retriever', 28, '2021-08-05', 'Đực', 'Rất hoạt bát, cần kiểm soát tốt', 'Không', 'Khách mang theo thức ăn riêng Royal Canin'),
('P004', 'CUST-003', 'Luna', 'Mèo', 'Small', 'Scottish Fold', 3.8, '2024-01-15', 'Cái', 'Thích ngủ, dễ ẵm', 'Không', 'Tai cụp cần vệ sinh thường xuyên'),
('P005', 'CUST-004', 'Milu', 'Chó', 'Medium', 'Corgi', 12, '2023-02-28', 'Đực', 'Thân thiện, hay cắn gót giày', 'Không', 'Có dấu hiệu thừa cân, hạn chế treats'),
('P006', 'CUST-005', 'Leo', 'Chó', 'Large', 'Husky', 22, '2022-09-12', 'Đực', 'Tăng động, ồn ào', 'Dị ứng hải sản', 'Cẩn thận khi sấy lông, bé rất sợ tiếng ồn lớn') ON CONFLICT (pet_id) DO NOTHING;

INSERT INTO public.product (product_id, category_id, brand, name, description, is_active) VALUES
('P001', 'CAT00001', 'Royal Canin', 'Hạt Royal Canin Mini Adult', NULL, true),
('P002', 'CAT00001', 'Whiskas', 'Pate Whiskas Vị Cá Ngừ', NULL, true),
('P003', 'CAT00005', 'Cature', 'Cát Đậu Nành Cature', NULL, true),
('P004', 'CAT00005', 'SOS', 'Sữa Tắm SOS Mượt Lông', NULL, true),
('P005', 'CAT00002', 'OEM', 'Đồ Chơi Cần Câu Mèo Gắn Lông Vũ', NULL, true),
('P006', 'CAT00001', 'Jerhigh', 'Bánh Thưởng Jerhigh Bò', NULL, true),
('P007', 'CAT00003', 'OEM', 'Vòng Cổ Chuông Da', NULL, true),
('P008', 'CAT00003', 'OEM', 'Balo Phi Hành Gia Vận Chuyển', NULL, true) ON CONFLICT (product_id) DO NOTHING;

INSERT INTO public.product_variant (variant_id, product_id, sku, capacity_label, price, stock_quantity) VALUES
('P001-V1', 'P001', 'P001-1', '1.5kg', 350000, 25),
('P001-V2', 'P001', 'P001-2', '3kg', 350000, 25),
('P002-V1', 'P002', 'P002-1', '85g', 15000, 120),
('P003-V1', 'P003', 'P003-1', '7L', 185000, 50),
('P003-V2', 'P003', 'P003-2', '14L', 185000, 50),
('P004-V1', 'P004', 'P004-1', '530ml', 120000, 30),
('P005-V1', 'P005', 'P005-1', 'Tiêu chuẩn', 45000, 80),
('P006-V1', 'P006', 'P006-1', '70g', 45000, 65),
('P007-V1', 'P007', 'P007-1', 'S', 35000, 40),
('P007-V2', 'P007', 'P007-2', 'M', 35000, 40),
('P007-V3', 'P007', 'P007-3', 'L', 35000, 40),
('P008-V1', 'P008', 'P008-1', 'Xanh', 290000, 15),
('P008-V2', 'P008', 'P008-2', 'Hồng', 290000, 15),
('P008-V3', 'P008', 'P008-3', 'Vàng', 290000, 15) ON CONFLICT (variant_id) DO NOTHING;

INSERT INTO public.product_image (image_id, product_id, image_url) VALUES
('P001-IMG', 'P001', 'https://upload.wikimedia.org/wikipedia/commons/7/71/Dog_food_in_a_bowl.jpg'),
('P002-IMG', 'P002', 'https://upload.wikimedia.org/wikipedia/commons/3/39/Gastrointestinal_Haiball_cat_dry_food_%28Royal_Canin%29.jpg'),
('P003-IMG', 'P003', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/CatLitterBox.jpg/500px-CatLitterBox.jpg'),
('P004-IMG', 'P004', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Shampoo_bottle.jpg/400px-Shampoo_bottle.jpg'),
('P005-IMG', 'P005', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Cat_playing_with_a_toy.jpg/500px-Cat_playing_with_a_toy.jpg'),
('P006-IMG', 'P006', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Dog_biscuit.jpg/500px-Dog_biscuit.jpg'),
('P007-IMG', 'P007', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Cat_wearing_a_collar.jpg/500px-Cat_wearing_a_collar.jpg'),
('P008-IMG', 'P008', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cat_in_soft_side_cat_carrier.jpg/500px-Cat_in_soft_side_cat_carrier.jpg') ON CONFLICT (image_id) DO NOTHING;

INSERT INTO public.service (service_id, service_name, type, description, is_active) VALUES
('SV01', 'Cắt tỉa lông toàn thân + Tắm gội', 'Grooming', NULL, true),
('SV02', 'Tắm gội + Vệ sinh tai', 'Grooming', NULL, true),
('SV03', 'Cắt tỉa lông + Cắt móng', 'Grooming', NULL, true),
('SV04', 'Vắt tuyến hôi', 'Grooming', NULL, true),
('SV05', 'Nhuộm highlight', 'Grooming', NULL, true),
('SV06', 'Đánh răng thú cưng', 'Grooming', NULL, true),
('HT01', 'Lưu chuồng Standard', 'Hotel', NULL, true),
('HT02', 'Phòng VIP', 'Hotel', NULL, true) ON CONFLICT (service_id) DO NOTHING;

INSERT INTO public.booking (booking_id, customer_id, pet_id, staff_id, voucher_id, channel, booking_type, status, total_bill, deposit_amount, reception_notes) VALUES
('GS-00001', NULL, NULL, NULL, NULL, 'Offline', 'Grooming', 'CONFIRMED', 350000, 0, 'Khách dặn làm kỹ vùng lông chân'),
('GS-00002', NULL, NULL, NULL, NULL, 'Offline', 'Grooming', 'PROCESSING', 350000, 0, NULL),
('HT-00001', NULL, NULL, NULL, NULL, 'Offline', 'Hotel', 'COMPLETED_SERVICE', 200000, 0, NULL),
('GS-00003', NULL, NULL, NULL, NULL, 'Offline', 'Grooming', 'DONE', 200000, 0, NULL),
('HT-00002', NULL, NULL, NULL, NULL, 'Offline', 'Hotel', 'PROCESSING', 1200000, 360000, 'Thú cưng cần chế độ ăn riêng, có mang theo thức ăn hạt Royal Canin. Lưu ý: Rất hoạt bát, cần kiểm soát tốt.'),
('HT-00003', NULL, NULL, NULL, NULL, 'Offline', 'Hotel', 'PROCESSING', 500000, 0, 'Bé nhát người lạ, cần nhẹ nhàng. Lưu ý: Dễ bị stress ngày đầu.'),
('HT-00004', NULL, NULL, NULL, NULL, 'Offline', 'Hotel', 'CONFIRMED', 300000, 0, 'Khách sẽ mang theo đồ chơi của bé.'),
('HT-00005', NULL, NULL, NULL, NULL, 'Offline', 'Hotel', 'COMPLETED_SERVICE', 1500000, 450000, NULL),
('GS-00004', NULL, NULL, NULL, NULL, 'Offline', 'Spa VIP', 'PROCESSING', 500000, 0, NULL),
('GS-00005', NULL, NULL, NULL, NULL, 'Offline', 'Grooming', 'DONE', 250000, 0, NULL),
('GS-00006', NULL, NULL, NULL, NULL, 'Offline', 'Grooming Chó Lớn', 'PROCESSING', 800000, 0, NULL),
('GS-00007', NULL, NULL, NULL, NULL, 'Offline', 'Grooming', 'PAID', 350000, 0, NULL) ON CONFLICT (booking_id) DO NOTHING;

INSERT INTO public.booking_service (booking_service_id, booking_id, service_id, groomer_id, table_id, slot_start, slot_end, price) VALUES
('BS-1', 'GS-00001', 'SV01', NULL, NULL, NULL, NULL, 350000),
('BS-2', 'GS-00002', 'SV02', NULL, NULL, NULL, NULL, 350000),
('BS-3', 'HT-00001', 'HT01', NULL, NULL, NULL, NULL, 200000),
('BS-4', 'GS-00003', 'SV03', NULL, NULL, NULL, NULL, 200000),
('BS-5', 'HT-00002', 'HT01', NULL, NULL, NULL, NULL, 1200000),
('BS-6', 'HT-00003', 'HT02', NULL, NULL, NULL, NULL, 500000),
('BS-7', 'HT-00004', 'HT01', NULL, NULL, NULL, NULL, 300000),
('BS-8', 'HT-00005', 'HT01', NULL, NULL, NULL, NULL, 1500000),
('BS-9', 'GS-00004', 'SV03', NULL, NULL, NULL, NULL, 500000),
('BS-10', 'GS-00005', 'SV01', NULL, NULL, NULL, NULL, 250000),
('BS-11', 'GS-00006', 'SV04', NULL, NULL, NULL, NULL, 800000),
('BS-12', 'GS-00007', 'SV01', NULL, NULL, NULL, NULL, 350000) ON CONFLICT (booking_service_id) DO NOTHING;

-- Khôi phục kiểm tra khóa ngoại
SET session_replication_role = 'origin';
