const fs = require('fs');
const path = require('path');

function parseExport(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  const sanitized = content.replace(/export\s+const\s+\w+\s*=\s*/g, 'module.exports = ');
  const tmpPath = filePath + '.tmp.js';
  fs.writeFileSync(tmpPath, sanitized);
  
  // Xử lý các export const nhiều biến
  // Dùng regex bóc tách vì require có thể bị đè nếu gán module.exports nhiều lần
  // Cách dễ hơn là bọc tất cả các export const thành object
  let safeContent = content;
  let matches = [...safeContent.matchAll(/export\s+const\s+(\w+)\s*=\s*(\[[\s\S]*?\]);/g)];
  let result = {};
  
  if (matches.length > 0) {
      let mod = "const data = {};\n";
      for (const m of matches) {
          mod += `data.${m[1]} = ${m[2]};\n`;
      }
      mod += "module.exports = data;";
      fs.writeFileSync(tmpPath, mod);
      result = require(tmpPath);
  }
  
  fs.unlinkSync(tmpPath);
  return result;
}

function escapeStr(str) {
  if (str === null || str === undefined) return 'NULL';
  if (typeof str !== 'string') return "''";
  return "'" + str.replace(/'/g, "''") + "'";
}

function generateSQL() {
  let sql = `-- =========================================
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

-- =========================================
-- 2. DML (DATA MANIPULATION LANGUAGE) - SEED DATA
-- =========================================
`;

  const CATEGORY_MAP = {
    'Thức ăn': 'CAT00001',
    'Đồ chơi': 'CAT00002',
    'Phụ kiện': 'CAT00003',
    'Dinh dưỡng': 'CAT00004',
    'Vệ sinh': 'CAT00005'
  };

  sql += `
INSERT INTO public.category (category_id, name) VALUES
('CAT00001', 'Thức ăn'),
('CAT00002', 'Đồ chơi'),
('CAT00003', 'Phụ kiện'),
('CAT00004', 'Dinh dưỡng'),
('CAT00005', 'Vệ sinh')
ON CONFLICT (category_id) DO NOTHING;
\n`;

  // --- STAFF ---
  const usersData = parseExport(path.join(__dirname, '../data/users.js'));
  if (usersData && usersData.STAFF_USERS) {
    const vals = [];
    for (const s of usersData.STAFF_USERS) {
      vals.push(`(${escapeStr(s.staff_id)}, ${escapeStr(s.last_name||'')}, ${escapeStr(s.first_name||'')}, ${escapeStr(s.full_name||s.last_name+' '+s.first_name)}, ${escapeStr(s.role)}, ${escapeStr(s.phone)}, ${escapeStr(s.email)}, 'hash', NULL, ${escapeStr(s.shift)}, ${escapeStr(s.status)}, ${escapeStr(s.avatar_url)})`);
    }
    if (vals.length) {
      sql += `INSERT INTO public.staff (staff_id, last_name, first_name, full_name, role, phone, email, password_hash, hire_date, shift, status, avatar_url) VALUES\n${vals.join(',\n')} ON CONFLICT (staff_id) DO NOTHING;\n\n`;
    }
  }

  // --- CUSTOMER ---
  if (usersData && usersData.CUSTOMERS) {
    const vals = [];
    for (const c of usersData.CUSTOMERS) {
      vals.push(`(${escapeStr(c.customer_id)}, ${escapeStr(c.last_name)}, ${escapeStr(c.first_name)}, ${escapeStr(c.phone)}, ${escapeStr(c.email)}, 'hash', ${c.is_account_activated}, ${c.total_spent}, ${escapeStr(c.created_at)})`);
    }
    if (vals.length) {
      sql += `INSERT INTO public.customer (customer_id, last_name, first_name, phone, email, password_hash, is_account_activated, total_spent, created_at) VALUES\n${vals.join(',\n')} ON CONFLICT (customer_id) DO NOTHING;\n\n`;
    }
  }

  // --- PET ---
  if (usersData && usersData.PETS) {
    const vals = [];
    for (const p of usersData.PETS) {
      // Handle the duplicate pet_id issue in the mock data (P001 inside PET-001)
      const pId = p.pet_id || p.id || 'PET-' + Date.now(); 
      vals.push(`(${escapeStr(pId)}, ${escapeStr(p.customer_id)}, ${escapeStr(p.pet_name)}, ${escapeStr(p.species)}, ${escapeStr(p.size)}, ${escapeStr(p.breed)}, ${p.weight || 0}, ${escapeStr(p.dob || '2020-01-01')}, ${escapeStr(p.gender)}, ${escapeStr(p.behavior_notes)}, ${escapeStr(p.allergy_notes)}, ${escapeStr(p.special_notes)})`);
    }
    if (vals.length) {
      sql += `INSERT INTO public.pet (pet_id, customer_id, pet_name, species, size, breed, weight, dob, gender, behavior_notes, allergy_notes, special_notes) VALUES\n${vals.join(',\n')} ON CONFLICT (pet_id) DO NOTHING;\n\n`;
    }
  }

  // --- PRODUCT ---
  const productsData = parseExport(path.join(__dirname, '../data/products.js'));
  if (productsData && productsData.PRODUCTS) {
    const pVals = [];
    const vVals = [];
    const iVals = [];
    for (const p of productsData.PRODUCTS) {
      pVals.push(`(${escapeStr(p.id)}, ${escapeStr(CATEGORY_MAP[p.category])}, ${escapeStr(p.brand)}, ${escapeStr(p.name)}, ${escapeStr(p.description)}, true)`);
      if (p.variants && p.variants.length) {
        for (let i = 0; i < p.variants.length; i++) {
          vVals.push(`(${escapeStr(p.id+'-V'+(i+1))}, ${escapeStr(p.id)}, ${escapeStr(p.id+'-'+(i+1))}, ${escapeStr(p.variants[i])}, ${p.price||0}, ${p.stock||0})`);
        }
      } else {
        vVals.push(`(${escapeStr(p.id+'-V1')}, ${escapeStr(p.id)}, ${escapeStr(p.id+'-1')}, 'Mặc định', ${p.price||0}, ${p.stock||0})`);
      }
      if (p.image) {
        iVals.push(`(${escapeStr(p.id+'-IMG')}, ${escapeStr(p.id)}, ${escapeStr(p.image)})`);
      }
    }
    if (pVals.length) sql += `INSERT INTO public.product (product_id, category_id, brand, name, description, is_active) VALUES\n${pVals.join(',\n')} ON CONFLICT (product_id) DO NOTHING;\n\n`;
    if (vVals.length) sql += `INSERT INTO public.product_variant (variant_id, product_id, sku, capacity_label, price, stock_quantity) VALUES\n${vVals.join(',\n')} ON CONFLICT (variant_id) DO NOTHING;\n\n`;
    if (iVals.length) sql += `INSERT INTO public.product_image (image_id, product_id, image_url) VALUES\n${iVals.join(',\n')} ON CONFLICT (image_id) DO NOTHING;\n\n`;
  }

  // --- SERVICE ---
  const servicesData = parseExport(path.join(__dirname, '../data/services.js'));
  if (servicesData && servicesData.SERVICES) {
    const sVals = [];
    for (const s of servicesData.SERVICES) {
      sVals.push(`(${escapeStr(s.id)}, ${escapeStr(s.name)}, ${escapeStr(s.category)}, ${escapeStr(s.description)}, true)`);
    }
    if (sVals.length) {
      sql += `INSERT INTO public.service (service_id, service_name, type, description, is_active) VALUES\n${sVals.join(',\n')} ON CONFLICT (service_id) DO NOTHING;\n\n`;
    }
  }

  // --- BOOKING ---
  const bookingsData = parseExport(path.join(__dirname, '../data/bookings.js'));
  if (bookingsData && bookingsData.BOOKINGS) {
    const bVals = [];
    const bsVals = [];
    let count = 1;
    // Lấy pet_id từ customer (mock data booking không có pet_id)
    // Tạm giả định pet_id là name, hoặc P00x
    for (const b of bookingsData.BOOKINGS) {
      bVals.push(`(${escapeStr(b.booking_id)}, NULL, NULL, NULL, NULL, 'Offline', ${escapeStr(b.service_type)}, ${escapeStr(b.status)}, ${b.total_amount||0}, ${b.deposit_amount||0}, ${escapeStr(b.reception_notes)})`);
      // Lấy danh sách dịch vụ (Mock này chỉ lưu service_id trong parent)
      if (b.service_id) {
        bsVals.push(`(${escapeStr('BS-'+count++)}, ${escapeStr(b.booking_id)}, ${escapeStr(b.service_id)}, NULL, NULL, NULL, NULL, ${b.total_amount||0})`);
      }
    }
    if (bVals.length) sql += `INSERT INTO public.booking (booking_id, customer_id, pet_id, staff_id, voucher_id, channel, booking_type, status, total_bill, deposit_amount, reception_notes) VALUES\n${bVals.join(',\n')} ON CONFLICT (booking_id) DO NOTHING;\n\n`;
    if (bsVals.length) sql += `INSERT INTO public.booking_service (booking_service_id, booking_id, service_id, groomer_id, table_id, slot_start, slot_end, price) VALUES\n${bsVals.join(',\n')} ON CONFLICT (booking_service_id) DO NOTHING;\n\n`;
  }

  sql += `
-- Khôi phục kiểm tra khóa ngoại
SET session_replication_role = 'origin';
`;

  fs.writeFileSync(path.join(__dirname, '../schema_and_seed.sql'), sql);
  console.log('Successfully generated schema_and_seed.sql');
}

generateSQL();
