import { supabase } from '../supabase/client';

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

/**
 * Find-or-create customer theo SĐT. Dùng ngay trước khi tạo booking.
 * customer_id là character varying tự sinh phía app (không phải uuid tự tăng của DB)
 * -> cần tự sinh id nếu là khách mới. Điều chỉnh lại prefix/format theo quy ước thật của bạn.
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
export async function upsertPet({ petId, customerId, petName, species, size, breed, weight, genderOrNotes = {} }) {
  const payload = {
    customer_id: customerId,
    pet_name: petName,
    species,
    ...(size ? { size } : {}),
    breed: breed || null,
    weight: weight || null,
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

// TODO: thay bằng cơ chế sinh ID nhất quán với các script trong /scripts (generate-sql.js...)
// nếu team đã có quy ước riêng (ví dụ dùng uuid hoặc sequence trong Postgres).
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