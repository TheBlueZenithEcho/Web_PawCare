import { supabase } from './client';

// ==========================================
// CUSTOMER API
// ==========================================

export const fetchCustomers = async () => {
  const { data, error } = await supabase
    .from('customer')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
  return data || [];
};

export const createCustomer = async (customerData) => {
  try {
    // Lấy customer_id cao nhất hiện tại
    const { data: lastCustomer, error: idError } = await supabase
      .from('customer')
      .select('customer_id')
      .order('customer_id', { ascending: false })
      .limit(1);

    if (idError) throw idError;

    let nextIdNumber = 1;
    if (lastCustomer && lastCustomer.length > 0 && lastCustomer[0].customer_id) {
      const lastIdStr = lastCustomer[0].customer_id;
      const numPart = parseInt(lastIdStr.replace('CUS', ''), 10);
      if (!isNaN(numPart)) {
        nextIdNumber = numPart + 1;
      }
    }
    const customer_id = `CUS${nextIdNumber.toString().padStart(5, '0')}`;

    let user_id = null;

    const email = customerData.email ? customerData.email.trim() : null;
    const phone = customerData.phone ? customerData.phone.trim() : null;

    // Nếu chọn cấp tài khoản thì tạo qua Supabase Auth
    if (customerData.create_account && email) {
      const password = Math.random().toString(36).slice(-8); // Random password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        throw new Error('Lỗi tạo tài khoản đăng nhập: ' + authError.message);
      }

      if (authData?.user?.id) {
        user_id = authData.user.id;
        // Có thể lưu password này ở đâu đó để báo cho khách nếu cần, nhưng tạm thời Supabase sẽ gửi email xác nhận.
      }
    }

    const { data, error } = await supabase
      .from('customer')
      .insert([
        {
          customer_id,
          user_id,
          last_name: customerData.last_name,
          first_name: customerData.first_name,
          phone: phone,
          email: email
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error in createCustomer:', error);
    throw error;
  }
};

export const fetchBookingsForUsers = async () => {
  const { data, error } = await supabase
    .from('booking')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
  return data || [];
};

export const updateCustomer = async (customer_id, customerData) => {
  const { data, error } = await supabase
    .from('customer')
    .update({
      last_name: customerData.last_name,
      first_name: customerData.first_name,
      phone: customerData.phone,
      email: customerData.email,
      cus_ava: customerData.cus_ava
    })
    .eq('customer_id', customer_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
  return data;
};

export const deleteCustomer = async (customer_id) => {
  // 1. Tìm tất cả các booking của khách hàng
  const { data: bookings } = await supabase.from('booking').select('booking_id').eq('customer_id', customer_id);
  
  if (bookings && bookings.length > 0) {
    const bookingIds = bookings.map(b => b.booking_id);
    // Xoá chi tiết dịch vụ và phòng
    await supabase.from('booking_service').delete().in('booking_id', bookingIds);
    await supabase.from('booking_room').delete().in('booking_id', bookingIds);
    // Xoá booking
    await supabase.from('booking').delete().in('booking_id', bookingIds);
  }

  // 2. Xoá tất cả thú cưng của khách hàng
  await supabase.from('pet').delete().eq('customer_id', customer_id);

  // 3. Xoá khách hàng
  const { error } = await supabase
    .from('customer')
    .delete()
    .eq('customer_id', customer_id);

  if (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
  return true;
};

export const uploadCustomerAvatar = async (customer_id, file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `customers/${customer_id}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);

  if (uploadError) {
    console.error('Error uploading customer avatar:', uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

// ==========================================
// PET API
// ==========================================

export const fetchPets = async () => {
  const { data, error } = await supabase
    .from('pet')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
  return data || [];
};

export const createPet = async (petData) => {
  let pet_id = petData.pet_id;
  
  if (!pet_id) {
    // Lấy pet_id cao nhất hiện tại
    const { data: lastPet, error: idError } = await supabase
      .from('pet')
      .select('pet_id')
      // Lọc bỏ những mã bị sai format có dấu '-' để tìm đúng mã lớn nhất
      .not('pet_id', 'like', '%-%')
      .order('pet_id', { ascending: false })
      .limit(1);

    if (idError) throw idError;

    let nextIdNumber = 1;
    if (lastPet && lastPet.length > 0 && lastPet[0].pet_id) {
      const lastIdStr = lastPet[0].pet_id;
      const numPart = parseInt(lastIdStr.replace('PET', ''), 10);
      if (!isNaN(numPart)) {
        nextIdNumber = numPart + 1;
      }
    }
    pet_id = `PET${nextIdNumber.toString().padStart(5, '0')}`;
  }

  const speciesMap = { 'Chó': 'dog', 'Mèo': 'cat' };
  const sizeMap = { 'Nhỏ (Dưới 5kg)': 'S', 'Vừa (5-15kg)': 'M', 'Lớn (Trên 15kg)': 'L' };
  
  // Xác định gender tạm (hoặc nếu trên UI không có thì gán mặc định)
  // Vì hiện tại UI chưa có chọn Giới tính, tạm thời mình set 'male' hoặc để rỗng tuỳ DB
  // nhưng database yêu cầu Enum gender_enum có thể không cho null
  
  const { data, error } = await supabase
    .from('pet')
    .insert([
      {
        pet_id,
        customer_id: petData.customer_id,
        pet_name: petData.pet_name,
        species: speciesMap[petData.species] || 'dog',
        size: sizeMap[petData.size] || 'S',
        breed: petData.breed,
        weight: petData.weight || 0,
        dob: petData.dob || '2020-01-01',
        gender: petData.gender || 'male',
        behavior_notes: petData.behavior_notes,
        allergy_notes: petData.allergy_notes,
        special_notes: petData.special_notes
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
  return data;
};

export const updatePet = async (pet_id, petData) => {
  const { data, error } = await supabase
    .from('pet')
    .update({
      pet_name: petData.pet_name,
      species: petData.species,
      size: petData.size,
      breed: petData.breed,
      weight: petData.weight,
      dob: petData.dob,
      gender: petData.gender,
      behavior_notes: petData.behavior_notes,
      allergy_notes: petData.allergy_notes,
      special_notes: petData.special_notes,
      pet_ava: petData.pet_ava
    })
    .eq('pet_id', pet_id)
    .select()
    .single();

  if (error) {
    console.error('Error updating pet:', error);
    throw error;
  }
  return data;
};

export const uploadPetAvatar = async (pet_id, file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${pet_id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `pets/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading pet avatar:', uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

export const deletePet = async (pet_id) => {
  const { error } = await supabase
    .from('pet')
    .delete()
    .eq('pet_id', pet_id);

  if (error) {
    console.error('Error deleting pet:', error);
    throw error;
  }
  return true;
};

// ==========================================
// STAFF API
// ==========================================

export const getStaffById = async (staffId) => {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('staff_id', staffId)
    .single();

  if (error) {
    console.error('Error fetching staff:', error);
    return null;
  }
  return data;
};
