-- =========================================
-- TẬP LỆNH KHỞI TẠO CƠ SỞ DỮ LIỆU PAW CARE
-- Dành cho Supabase
-- =========================================

-- Tạm thời vô hiệu hóa kiểm tra khóa ngoại để tránh lỗi thứ tự DROP/CREATE
SET session_replication_role = 'replica';

-- =========================================
-- 1. DDL (DATA DEFINITION LANGUAGE) - CREATE TABLES
-- =========================================

CREATE TABLE IF NOT EXISTS public.customer (
    customer_id VARCHAR(20) PRIMARY KEY,
    last_name VARCHAR(255),
    first_name VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(255),
    password_hash VARCHAR(255),
    is_account_activated BOOLEAN DEFAULT true,
    total_spent DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.pet (
    pet_id VARCHAR(20) PRIMARY KEY,
    customer_id VARCHAR(20) REFERENCES public.customer(customer_id),
    pet_name VARCHAR(255),
    species TEXT,
    size TEXT,
    breed VARCHAR(255),
    weight DECIMAL(4,2),
    dob DATE,
    gender TEXT,
    behavior_notes TEXT,
    allergy_notes TEXT,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.staff (
    staff_id VARCHAR(20) PRIMARY KEY,
    last_name VARCHAR(255),
    first_name VARCHAR(255),
    full_name VARCHAR(255),
    role TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    hire_date DATE,
    shift TEXT,
    status TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.category (
    category_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS public.product (
    product_id VARCHAR(20) PRIMARY KEY,
    category_id VARCHAR(20) REFERENCES public.category(category_id),
    brand VARCHAR(255),
    name VARCHAR(255),
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.product_variant (
    variant_id VARCHAR(20) PRIMARY KEY,
    product_id VARCHAR(20) REFERENCES public.product(product_id),
    sku VARCHAR(100) UNIQUE,
    capacity_label VARCHAR(100),
    price DECIMAL(10,2),
    stock_quantity INT
);

CREATE TABLE IF NOT EXISTS public.product_image (
    image_id VARCHAR(20) PRIMARY KEY,
    product_id VARCHAR(20) REFERENCES public.product(product_id),
    image_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS public.service (
    service_id VARCHAR(20) PRIMARY KEY,
    service_name VARCHAR(255),
    type TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.room (
    room_id VARCHAR(20) PRIMARY KEY,
    price_per_night DECIMAL(10,2),
    suitable_species TEXT,
    max_weight DECIMAL(4,2),
    status TEXT
);

CREATE TABLE IF NOT EXISTS public.grooming_table (
    table_id VARCHAR(20) PRIMARY KEY,
    table_code VARCHAR(50),
    status TEXT
);

CREATE TABLE IF NOT EXISTS public.booking (
    booking_id VARCHAR(20) PRIMARY KEY,
    customer_id VARCHAR(20) REFERENCES public.customer(customer_id),
    pet_id VARCHAR(20) REFERENCES public.pet(pet_id),
    staff_id VARCHAR(20) REFERENCES public.staff(staff_id),
    voucher_id VARCHAR(20),
    channel TEXT,
    booking_type TEXT,
    status TEXT,
    total_bill DECIMAL(10,2),
    deposit_amount DECIMAL(10,2),
    cancelled_at TIMESTAMP,
    cancel_reason TEXT,
    refund_amount DECIMAL(10,2),
    refund_percentage INT,
    reception_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.booking_service (
    booking_service_id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(20) REFERENCES public.booking(booking_id),
    service_id VARCHAR(20) REFERENCES public.service(service_id),
    groomer_id VARCHAR(20) REFERENCES public.staff(staff_id),
    table_id VARCHAR(20) REFERENCES public.grooming_table(table_id),
    slot_start TIMESTAMP,
    slot_end TIMESTAMP,
    price DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS public.booking_room (
    booking_room_id VARCHAR(50) PRIMARY KEY,
    booking_id VARCHAR(20) REFERENCES public.booking(booking_id),
    room_id VARCHAR(20) REFERENCES public.room(room_id),
    check_in_date DATE,
    check_out_date DATE,
    actual_check_out TIMESTAMP,
    price_per_night DECIMAL(10,2),
    extra_fee DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS public.pet_health_record (
    record_id VARCHAR(50) PRIMARY KEY,
    pet_id VARCHAR(20) REFERENCES public.pet(pet_id),
    staff_id VARCHAR(20) REFERENCES public.staff(staff_id),
    booking_id VARCHAR(20) REFERENCES public.booking(booking_id),
    behavior_observed TEXT,
    weight DECIMAL(4,2),
    skin_condition VARCHAR(500),
    ear_condition VARCHAR(500),
    coat_condition VARCHAR(500),
    eye_condition VARCHAR(500),
    nail_condition VARCHAR(500),
    wound_description TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Khôi phục kiểm tra khóa ngoại
SET session_replication_role = 'origin';
