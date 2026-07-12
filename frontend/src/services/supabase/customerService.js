import { supabase } from '../supabase/client';

// ==========================================
// KHACH HANG QUAY LAI / TRA CUU
// ==========================================

/**
 * BR (qtnv_new §5.1.1): hệ thống tự kiểm tra SĐT/email đã tồn tại trong bảng customer
 * chưa để nhận diện khách cũ, kèm toàn bộ pet đã lưu của khách đó.
 * Dùng cho Luồng 2 (khách chưa đăng nhập nhưng đã từng đến).
 */
export async function lookupCustomerByPhone(phone) {
  const { data, error } = await supabase
    .from('customer')
    .select('*, pet(*)')
    .eq('phone', phone)
    .maybeSingle();

  if (error) {
    console.error('[customerService.lookupCustomerByPhone]', error);
    throw error;
  }
  return data; // null nếu chưa tồn tại
}

/**
 * Dùng cho Luồng 1 (khách đã đăng nhập): app không dùng Supabase Auth, mà tự xác thực
 * qua authenticateCustomer() (xem login.jsx) rồi lưu customer_id vào localStorage.
 * Hàm này refetch lại customer + toàn bộ pet mới nhất theo customer_id đó, tránh dùng
 * dữ liệu cũ/đã hết hạn còn nằm trong localStorage.
 */
export async function getCustomerById(customerId) {
  const { data, error } = await supabase
    .from('customer')
    .select('*, pet(*)')
    .eq('customer_id', customerId)
    .maybeSingle();

  if (error) {
    console.error('[customerService.getCustomerById]', error);
    throw error;
  }
  return data; // null nếu customer_id không còn tồn tại (vd bị xoá)
}

// ==========================================
// THEM / CAP NHAT KHI BOOKING
// ==========================================

/**
 * Find-or-create customer theo SĐT. Dùng ngay trước khi tạo booking.
 */
export async function upsertCustomer({ customerId, firstName, lastName, phone, email }) {
  if (customerId) {
    const { data, error } = await supabase
      .from('customer')
      .update({ first_name: firstName, last_name: lastName, email })
      .eq('customer_id', customerId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  // Check if a customer with the same phone already exists
  if (phone) {
    const { data: existing, error: checkError } = await supabase
      .from('customer')
      .select('customer_id')
      .eq('phone', phone)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      throw new Error("Số điện thoại này đã được đăng ký trước đó, vui lòng kiểm tra lại");
    }
  }

  const newId = await generateIdAsync('CUS', 'customer', 'customer_id');
  const { data, error } = await supabase
    .from('customer')
    .insert({ customer_id: newId, first_name: firstName, last_name: lastName, phone, email })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Find-or-create pet cho customer hiện tại.
 */
export async function upsertPet({ petId, customerId, petName, species, size, breed, weight, dob, genderOrNotes = {} }) {
  const payload = {
    customer_id: customerId,
    pet_name: petName,
    species,
    ...(size ? { size } : {}),
    breed: breed || null,
    weight: weight || null,
    dob: dob || null, // Đã giữ lại phần fix ngày sinh của Hotel
    ...genderOrNotes, // gender, behavior_notes, allergy_notes, special_notes...
  };

  if (petId) {
    const { data, error } = await supabase.from('pet').update(payload).eq('pet_id', petId).select().single();
    if (error) throw error;
    return data;
  }

  const newId = await generateIdAsync('PET', 'pet', 'pet_id');
  const { data, error } = await supabase
    .from('pet')
    .insert({ pet_id: newId, ...payload })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ==========================================
// MY PROFILE / DASHBOARD (NEW)
// ==========================================

/**
 * Lấy customer đang đăng nhập (qua Supabase Auth session) kèm địa chỉ đã lưu.
 * Yêu cầu: customer.user_id phải được set = auth.users.id lúc đăng ký/đăng nhập lần đầu.
 * Trả về null nếu chưa đăng nhập hoặc chưa có customer record tương ứng.
 */
export async function getCurrentCustomer() {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) return null;

  const { data, error } = await supabase
    .from('customer')
    .select('*, customer_address(*)')
    .eq('user_id', authData.user.id)
    .maybeSingle();

  if (error) {
    console.error('[customerService.getCurrentCustomer]', error);
    throw error;
  }
  return data ? { ...data, email_verified: Boolean(authData.user.email_confirmed_at) } : null;
}

export async function updateCustomerProfile(customerId, { firstName, lastName, phone, email }) {
  const { data, error } = await supabase
    .from('customer')
    .update({ first_name: firstName, last_name: lastName, phone, email })
    .eq('customer_id', customerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Đổi mật khẩu cho user đang đăng nhập — dùng thẳng Supabase Auth, không qua bảng customer.
 */
export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

/**
 * Hoạt động gần đây nhất của khách: lấy booking mới nhất kèm tên pet.
 * Dùng cho khối "Recent Activity" ở trang My Profile.
 */
export async function getMostRecentBooking(customerId) {
  const { data, error } = await supabase
    .from('booking')
    .select('*, pet:pet_id(pet_name)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// ==========================================
// UTILS
// ==========================================

/**
 * Sinh ID theo định dạng PREFIX + Số thứ tự tự tăng (vd: CUS00001, PET00001)
 */
async function generateIdAsync(prefix, tableName, idField) {
  const { data: lastItem } = await supabase
    .from(tableName)
    .select(idField)
    .not(idField, 'like', '%-%')
    .order(idField, { ascending: false })
    .limit(1);

  let nextId = 1;
  if (lastItem && lastItem.length > 0 && lastItem[0][idField]) {
    const numPart = parseInt(lastItem[0][idField].replace(prefix, ''), 10);
    if (!isNaN(numPart)) nextId = numPart + 1;
  }
  return `${prefix}${nextId.toString().padStart(5, '0')}`;
}