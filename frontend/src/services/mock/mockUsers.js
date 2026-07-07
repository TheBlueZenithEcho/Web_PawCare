/**
 * ==========================================
 * ⚠️ FILE GIẢ LẬP DỮ LIỆU (MOCK DATA) ⚠️
 * Tác dụng: Cung cấp dữ liệu cứng để test giao diện.
 * KHÔNG DÙNG FILE NÀY KHI ĐÃ CÓ KẾT NỐI SUPABASE.
 * ==========================================
 */

export const CUSTOMERS = [
  {
    customer_id: "CUST-001",
    last_name: "Nguyễn",
    first_name: "Yến Ngân",
    phone: "0901234567",
    email: "yenngan@example.com",
    is_account_activated: true,
    total_spent: 3500000,
    created_at: "2025-10-15"
  },
  {
    customer_id: "CUST-002",
    last_name: "Lê Đức",
    first_name: "Tuấn",
    phone: "0912345678",
    email: "tuanle@example.com",
    is_account_activated: true,
    total_spent: 850000,
    created_at: "2026-01-20"
  },
  {
    customer_id: "CUST-003",
    last_name: "Trần Ngọc",
    first_name: "Mai",
    phone: "0923456789",
    email: "ngocmai@example.com",
    is_account_activated: false,
    total_spent: 4200000,
    created_at: "2026-03-05"
  },
  {
    customer_id: "CUST-004",
    last_name: "Phạm",
    first_name: "Hùng",
    phone: "0933333333",
    email: "",
    is_account_activated: false,
    total_spent: 200000,
    created_at: "2026-06-25"
  },
  {
    customer_id: "CUST-005",
    last_name: "Lê Hoàng",
    first_name: "Vinh",
    phone: "0911111111",
    email: "hoangvinh@example.com",
    is_account_activated: true,
    total_spent: 900000,
    created_at: "2026-06-20"
  }
];

export const PETS = [
  {
    pet_id: "PET-001",
    customer_id: "CUST-001",
    pet_name: "Miu Miu",
    species: "Mèo",
    breed: "Anh lông ngắn",
    size: "medium",
    weight: 4.5,
    gender: "Cái",
    dob: "2024-05-10",
    behavior_notes: "Ngoan, ít kêu",
    allergy_notes: "Không",
    special_notes: "Sợ tiếng ồn lớn",
    pet_id: "P001",
    customer_id: "CUST-001",
    pet_name: "Bông",
    species: "Chó",
    breed: "Poodle",
    weight: 3.2,
    gender: "Cái",
    size: "Small",
    dob: "2023-05-10",
    behavior_notes: "Tăng động, quấn chủ",
    allergy_notes: "Dị ứng thịt gà",
    special_notes: "Hay sủa khi gặp người lạ",
    created_at: "2026-01-10",
    health_record: {
      recorded_at: "2026-06-25",
      skin_condition: "Bình thường",
      ear_condition: "Bình thường",
      coat_condition: "Hơi rối phần đuôi",
      eye_condition: "Chảy nước mắt nhiều",
      nail_condition: "Bình thường",
      wound_description: "Không có vết thương"
    }
  },
  {
    pet_id: "P002",
    customer_id: "CUST-002",
    pet_name: "Miu Miu",
    species: "Mèo",
    breed: "Anh Lông Dài",
    weight: 4.5,
    gender: "Cái",
    size: "Small",
    dob: "2022-11-20",
    behavior_notes: "Hiền, nhát người",
    allergy_notes: "Không",
    special_notes: "Đang bị rụng lông mùa thay lông",
    created_at: "2026-02-15",
    health_record: {
      recorded_at: "2026-06-26",
      skin_condition: "Có nấm nhẹ ở tai",
      ear_condition: "Cần vệ sinh kỹ",
      coat_condition: "Rụng nhiều, đang thay lông",
      eye_condition: "Bình thường",
      nail_condition: "Dài, nhọn",
      wound_description: "Vết xước nhỏ ở đùi do gãi"
    }
  },
  {
    pet_id: "P003",
    customer_id: "CUST-003",
    pet_name: "Buddy",
    species: "Chó",
    breed: "Golden Retriever",
    weight: 28,
    gender: "Đực",
    size: "Large",
    dob: "2021-08-05",
    behavior_notes: "Rất hoạt bát, cần kiểm soát tốt",
    allergy_notes: "Không",
    special_notes: "Khách mang theo thức ăn riêng Royal Canin",
    created_at: "2026-03-05",
    health_record: {
      recorded_at: "2026-06-20",
      skin_condition: "Bình thường",
      ear_condition: "Bình thường",
      coat_condition: "Dày, mượt",
      eye_condition: "Bình thường",
      nail_condition: "Bình thường",
      wound_description: "Không"
    }
  },
  {
    pet_id: "P004",
    customer_id: "CUST-003",
    pet_name: "Luna",
    species: "Mèo",
    breed: "Scottish Fold",
    weight: 3.8,
    gender: "Cái",
    size: "Small",
    dob: "2024-01-15",
    behavior_notes: "Thích ngủ, dễ ẵm",
    allergy_notes: "Không",
    special_notes: "Tai cụp cần vệ sinh thường xuyên",
    created_at: "2026-03-05",
    health_record: {
      recorded_at: "2026-06-25",
      skin_condition: "Bình thường",
      ear_condition: "Khá dơ, cần vệ sinh",
      coat_condition: "Bình thường",
      eye_condition: "Bình thường",
      nail_condition: "Móng cong, cần tỉa gập",
      wound_description: "Không"
    }
  },
  {
    pet_id: "P005",
    customer_id: "CUST-004",
    pet_name: "Milu",
    species: "Chó",
    breed: "Corgi",
    weight: 12,
    gender: "Đực",
    size: "Medium",
    dob: "2023-02-28",
    behavior_notes: "Thân thiện, hay cắn gót giày",
    allergy_notes: "Không",
    special_notes: "Có dấu hiệu thừa cân, hạn chế treats",
    created_at: "2026-04-10",
    health_record: {
      recorded_at: "2026-06-27",
      skin_condition: "Viêm nhẹ dưới bụng",
      ear_condition: "Bình thường",
      coat_condition: "Bình thường",
      eye_condition: "Bình thường",
      nail_condition: "Bình thường",
      wound_description: "Không"
    }
  },
  {
    pet_id: "P006",
    customer_id: "CUST-005",
    pet_name: "Leo",
    species: "Chó",
    breed: "Husky",
    weight: 22,
    gender: "Đực",
    size: "Large",
    dob: "2022-09-12",
    behavior_notes: "Tăng động, ồn ào",
    allergy_notes: "Dị ứng hải sản",
    special_notes: "Cẩn thận khi sấy lông, bé rất sợ tiếng ồn lớn",
    created_at: "2026-05-20",
    health_record: {
      recorded_at: "2026-06-28",
      skin_condition: "Bình thường",
      ear_condition: "Bình thường",
      coat_condition: "Đang rụng lông",
      eye_condition: "Bình thường",
      nail_condition: "Hơi dài",
      wound_description: "Không"
    }
  }
];

export const STAFF_USERS = [
  {
    staff_id: "STAFF-001",
    full_name: "Yến Ngân",
    email: "yenngan.admin@pawcare.com",
    phone: "0901234567",
    role: "Admin Master",
    shift: "Toàn thời gian",
    status: "Đang hoạt động",
    avatar_url: null, // Sử dụng chữ cái đầu tiên
    created_at: "2025-01-01"
  },
  {
    staff_id: "STAFF-002",
    full_name: "Nguyễn Văn A",
    email: "nva@pawcare.com",
    phone: "0987654321",
    role: "Pet Sitter",
    shift: "Ca Sáng (08:00 - 16:00)",
    status: "Đang hoạt động",
    avatar_url: null,
    created_at: "2025-05-10"
  }
];
