import { supabase } from './client';

// Lấy danh sách dịch vụ grooming/spa từ DB
export const fetchGroomingServices = async () => {
  const { data, error } = await supabase
    .from('service')
    .select('*')
    .in('service_type', ['grooming', 'spa'])
    .eq('is_active', true)
    .order('service_id');
  if (error) throw error;
  return data || [];
};

// Lấy danh sách bàn grooming đang active từ DB
export const fetchGroomingTables = async () => {
  const { data, error } = await supabase
    .from('grooming_table')
    .select('*')
    .eq('status', 'active')
    .order('table_id');
  if (error) throw error;
  return data || [];
};

// Lấy danh sách phòng đang active từ DB
export const fetchActiveRooms = async () => {
  const { data, error } = await supabase
    .from('room')
    .select('*')
    .eq('status', 'active')
    .order('room_id');
  if (error) throw error;
  return data || [];
};

// Map DB status (lowercase) → UI status (UPPERCASE)
const STATUS_MAP = {
  confirmed: 'CONFIRMED',
  serving: 'PROCESSING',
  completed: 'COMPLETED_SERVICE',
  paid: 'PAID',
  finished: 'DONE',
  no_show: 'NO_SHOW',
  cancelled: 'CANCELLED',
};
const STATUS_MAP_REVERSE = Object.fromEntries(Object.entries(STATUS_MAP).map(([k, v]) => [v, k]));

// Lấy toàn bộ bookings từ DB (có join customer, pet, booking_service, booking_room, care_log)
export const fetchBookings = async () => {
  const { data, error } = await supabase
    .from('booking')
    .select(`
      *,
      customer:customer_id (customer_id, first_name, last_name, phone, email, cus_ava),
      pet:pet_id (pet_id, pet_name, species, breed, weight, dob, gender, pet_ava, behavior_notes, allergy_notes, special_notes),
      booking_service (booking_service_id, service_id, groomer_id, table_id, slot_start, slot_end, price, service:service_id(service_name)),
      booking_room (booking_room_id, room_id, check_in_date, check_out_date, price_per_night),
      care_log (care_log_id, food_amount, playtime_minutes, status, note, issues_note, recorded_at, staff_id, staff:staff_id(first_name, last_name))
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(b => {
    const diaries = (b.care_log || []).sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at)).map(log => ({
      date: new Date(log.recorded_at).toLocaleDateString('vi-VN'),
      food: log.food_amount,
      playtime: log.playtime_minutes,
      status: log.status,
      notes: log.note,
      issues: log.issues_note,
      staff: log.staff ? `${log.staff.last_name || ''} ${log.staff.first_name || ''}`.trim() : 'Nhân viên'
    }));

    const pet = b.pet || {};
    const customer = b.customer || {};
    
    let pet_age = 'N/A';
    if (pet.dob) {
      const diffMs = Date.now() - new Date(pet.dob).getTime();
      const ageDt = new Date(diffMs); 
      const years = Math.abs(ageDt.getUTCFullYear() - 1970);
      const months = ageDt.getUTCMonth();
      if (years > 0) pet_age = `${years} tuổi`;
      else if (months > 0) pet_age = `${months} tháng`;
      else pet_age = 'Dưới 1 tháng';
    }

    const genderMap = { male: 'Đực', female: 'Cái' };
    const pet_gender = genderMap[pet.gender] || pet.gender || 'N/A';

    return {
      ...b,
      pet_name: pet.pet_name,
      pet_type: pet.species === 'cat' ? 'Mèo' : pet.species === 'dog' ? 'Chó' : pet.species,
      pet_breed: pet.breed,
      pet_weight: pet.weight,
      pet_gender,
      pet_age,
      customer_name: `${customer.last_name || ''} ${customer.first_name || ''}`.trim(),
      customer_phone: customer.phone,
      status: STATUS_MAP[b.status] || b.status?.toUpperCase() || 'CONFIRMED',
      booking_type: b.booking_type === 'grooming' ? 'Grooming' : b.booking_type === 'hotel' ? 'Hotel' : b.booking_type,
      diaries
    };
  });
};
// Cập nhật trạng thái booking
export const updateBookingStatus = async (bookingId, uiStatus) => {
  const dbStatus = STATUS_MAP_REVERSE[uiStatus] || uiStatus.toLowerCase();
  const { error } = await supabase
    .from('booking')
    .update({ status: dbStatus })
    .eq('booking_id', bookingId);
  if (error) throw error;
};

// Thanh toán booking và cập nhật tổng chi tiêu
export const checkoutBookingPayment = async (bookingId, checkoutData) => {
  const { data: booking, error: bError } = await supabase
    .from('booking')
    .select('status, total_bill, customer_id')
    .eq('booking_id', bookingId)
    .single();

  if (bError) throw bError;
  if (booking.status === 'paid' || booking.status === 'finished') return;

  const newTotalBill = checkoutData?.new_total_bill || booking.total_bill;

  const { error: updError } = await supabase
    .from('booking')
    .update({ status: 'paid', total_bill: newTotalBill })
    .eq('booking_id', bookingId);
  if (updError) throw updError;

  if (checkoutData && checkoutData.total_paid > 0) {
    const paymentId = `PAY${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    let method = 'cash';
    if (checkoutData.payment_method === 'Tiền mặt') method = 'cash';
    else if (checkoutData.payment_method === 'Chuyển khoản' || checkoutData.payment_method === 'bank_transfer') method = 'bank_transfer';
    else method = checkoutData.payment_method.toLowerCase();

    const { error: payError } = await supabase.from('booking_payment').insert({
      payment_id: paymentId,
      booking_id: bookingId,
      amount: checkoutData.total_paid,
      method: method,
      type: 'final',
      status: 'success',
      gateway_transaction_code: `TXN-${bookingId}-FINAL`,
      paid_at: new Date().toISOString(),
    });
    if (payError) {
      console.error('booking_payment insert failed:', payError);
    }
  }

  if (booking.customer_id && newTotalBill) {
    const { data: customer, error: cError } = await supabase
      .from('customer')
      .select('total_spent')
      .eq('customer_id', booking.customer_id)
      .single();

    if (cError) throw cError;

    const newTotal = (customer.total_spent || 0) + newTotalBill;
    await supabase
      .from('customer')
      .update({ total_spent: newTotal })
      .eq('customer_id', booking.customer_id);
  }
};

// Bàn giao thú cưng (chỉ cập nhật trạng thái)
export const completeBookingHandover = async (bookingId) => {
  const { error: updError } = await supabase
    .from('booking')
    .update({ status: 'finished' })
    .eq('booking_id', bookingId);
  if (updError) throw updError;
};

export const checkInBooking = async (booking, checkInData) => {
  // 1. Cập nhật booking (status = serving, total_bill)
  const { error: bError } = await supabase
    .from('booking')
    .update({
      status: 'serving',
      total_bill: checkInData.total_bill
    })
    .eq('booking_id', booking.booking_id);
  if (bError) throw bError;

  // 2. Cập nhật cân nặng thú cưng (nếu có)
  if (checkInData.weight) {
    await supabase.from('pet').update({ weight: checkInData.weight }).eq('pet_id', booking.pet_id);
  }

  // 3. Thêm các dịch vụ phát sinh vào booking_service
  if (checkInData.addons && checkInData.addons.length > 0) {
    const { data: lastSrv } = await supabase
      .from('booking_service')
      .select('booking_service_id')
      .not('booking_service_id', 'like', '%-%')
      .order('booking_service_id', { ascending: false })
      .limit(1);

    let nextSrvId = 1;
    if (lastSrv && lastSrv.length > 0 && lastSrv[0].booking_service_id) {
      const numPart = parseInt(lastSrv[0].booking_service_id.replace('BSV', ''), 10);
      if (!isNaN(numPart)) nextSrvId = numPart + 1;
    }

    // Lấy slot thời gian và nhân viên từ dịch vụ chính (nếu có)
    const mainSrv = booking.booking_service?.[0];
    const groomer_id = mainSrv?.groomer_id || null;
    const table_id = mainSrv?.table_id || null;

    // Nếu không có mainSrv (vd Hotel), dùng tạm thời gian hiện tại
    const now = new Date();
    const slot_start = mainSrv?.slot_start || now.toISOString();
    const slot_end = mainSrv?.slot_end || new Date(now.getTime() + 90 * 60000).toISOString();

    const servicesToInsert = checkInData.addons.map((addon, index) => ({
      booking_service_id: `BSV${(nextSrvId + index).toString().padStart(5, '0')}`,
      booking_id: booking.booking_id,
      service_id: addon.service_id,
      price: addon.price,
      groomer_id,
      table_id,
      slot_start,
      slot_end
    }));

    const { error: srvError } = await supabase
      .from('booking_service')
      .insert(servicesToInsert);

    if (srvError) throw srvError;
  }
};

// Báo cáo sự cố
export const reportIncident = async (bookingId, description) => {
  console.log('reportIncident:', bookingId, description);
  // TODO: insert vào bảng incident khi sẵn sàng
};

export const extendHotelStay = async (bookingId, { newCheckoutDate, newRoomId, extraFee }) => {
  // Cập nhật ngày checkout (và đổi phòng nếu có)
  const updateData = { check_out_date: new Date(newCheckoutDate).toISOString() };
  if (newRoomId) updateData.room_id = newRoomId;

  const { error: roomErr } = await supabase
    .from('booking_room')
    .update(updateData)
    .eq('booking_id', bookingId);
  
  if (roomErr) throw roomErr;

  // Cộng thêm phụ phí vào tổng tiền
  if (extraFee > 0) {
    const { data: bData } = await supabase.from('booking').select('total_bill').eq('booking_id', bookingId).single();
    if (bData) {
      await supabase
        .from('booking')
        .update({ total_bill: (bData.total_bill || 0) + extraFee })
        .eq('booking_id', bookingId);
    }
  }
};

// Hoàn thành grooming → chuyển sang COMPLETED_SERVICE
export const completeGrooming = async (bookingId, groomerData) => {
  await updateBookingStatus(bookingId, 'COMPLETED_SERVICE');
};

// Ghi nhật ký chăm sóc (care_log)
export const addDiaryEntry = async (bookingId, entryData) => {
  // Sinh mã care_log_id tự động
  const { data: lastLog } = await supabase
    .from('care_log')
    .select('care_log_id')
    .like('care_log_id', 'CAR%')
    .order('care_log_id', { ascending: false })
    .limit(1);

  let nextId = 1;
  if (lastLog && lastLog.length > 0 && lastLog[0].care_log_id) {
    const numPart = parseInt(lastLog[0].care_log_id.replace('CAR', ''), 10);
    if (!isNaN(numPart)) nextId = numPart + 1;
  }
  const care_log_id = `CAR${nextId.toString().padStart(5, '0')}`;

  const { error } = await supabase
    .from('care_log')
    .insert([{
      care_log_id,
      booking_id: bookingId,
      staff_id: 'STF00002', // Tạm thời dùng staff cứng vì chưa có context auth
      food_amount: entryData.food,
      playtime_minutes: entryData.playtime,
      status: entryData.status,
      note: entryData.notes,
      issues_note: entryData.issues,
      photos: entryData.photos,
    }]);

  if (error) throw error;
};

export const searchCustomerWithPetsByPhone = async (phone) => {
  if (!phone) return null;

  try {
    // Tìm khách hàng theo SĐT
    const { data: customerData, error: customerError } = await supabase
      .from('customer')
      .select('*')
      .eq('phone', phone)
      .single();

    if (customerError) {
      if (customerError.code === 'PGRST116') {
        // Không tìm thấy
        return null;
      }
      throw customerError;
    }

    if (customerData) {
      // Lấy danh sách thú cưng của khách hàng này
      const { data: petData, error: petError } = await supabase
        .from('pet')
        .select('*')
        .eq('customer_id', customerData.customer_id);

      if (petError) throw petError;

      return {
        ...customerData,
        pets: petData || []
      };
    }

    return null;
  } catch (error) {
    console.error('Error searching customer by phone:', error);
    throw error;
  }
};

export const createRealBooking = async ({ customerData, petData, bookingDetails, bookingType, staffId }) => {
  try {
    let finalCustomerId = customerData.customer_id;
    let finalPetId = petData.pet_id;

    // 1. Tạo Khách hàng mới (nếu chưa có)
    if (!finalCustomerId) {
      if (customerData.phone) {
        const { data: existing, error: checkError } = await supabase
          .from('customer')
          .select('customer_id')
          .eq('phone', customerData.phone)
          .maybeSingle();

        if (checkError) throw checkError;

        if (existing) {
          throw new Error("Số điện thoại này đã được đăng ký trước đó, vui lòng kiểm tra lại");
        }
      }

      const { data: lastCustomer, error: idError } = await supabase
        .from('customer')
        .select('customer_id')
        .not('customer_id', 'like', '%-%')
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
      finalCustomerId = `CUS${nextIdNumber.toString().padStart(5, '0')}`;

      const { error: insertCusError } = await supabase
        .from('customer')
        .insert([{
          customer_id: finalCustomerId,
          first_name: customerData.first_name,
          last_name: customerData.last_name,
          phone: customerData.phone
        }]);

      if (insertCusError) throw insertCusError;
    }

    // 2. Tạo Thú cưng mới (nếu chưa có)
    if (!finalPetId) {
      const { data: lastPet, error: pIdError } = await supabase
        .from('pet')
        .select('pet_id')
        .not('pet_id', 'like', '%-%')
        .order('pet_id', { ascending: false })
        .limit(1);

      if (pIdError) throw pIdError;

      let nextPId = 1;
      if (lastPet && lastPet.length > 0 && lastPet[0].pet_id) {
        const lastPIdStr = lastPet[0].pet_id;
        const numPart = parseInt(lastPIdStr.replace('PET', ''), 10);
        if (!isNaN(numPart)) {
          nextPId = numPart + 1;
        }
      }
      finalPetId = `PET${nextPId.toString().padStart(5, '0')}`;

      const { error: insertPetError } = await supabase
        .from('pet')
        .insert([{
          pet_id: finalPetId,
          customer_id: finalCustomerId,
          pet_name: petData.pet_name,
          species: petData.species,
          breed: petData.breed,
          weight: petData.weight
        }]);

      if (insertPetError) throw insertPetError;
    }

    // 3. Tạo Booking
    const prefix = bookingType === 'Hotel' ? 'BHO' : 'BGS';

    const { data: lastBooking, error: bIdError } = await supabase
      .from('booking')
      .select('booking_id')
      .like('booking_id', `${prefix}%`)
      .not('booking_id', 'like', '%-%')
      .order('booking_id', { ascending: false })
      .limit(1);

    if (bIdError) throw bIdError;

    let nextBId = 1;
    if (lastBooking && lastBooking.length > 0 && lastBooking[0].booking_id) {
      const lastBIdStr = lastBooking[0].booking_id;
      const numPart = parseInt(lastBIdStr.replace(prefix, ''), 10);
      if (!isNaN(numPart)) {
        nextBId = numPart + 1;
      }
    }
    const booking_id = `${prefix}${nextBId.toString().padStart(5, '0')}`;

    const newBookingData = {
      booking_id,
      customer_id: finalCustomerId,
      pet_id: finalPetId,
      staff_id: staffId,
      booking_type: bookingType.toLowerCase(),
      status: 'confirmed',
      total_bill: bookingDetails.total_bill,
      deposit_amount: bookingDetails.deposit_amount,
      channel: 'walk_in', // Walk-in / Phone
    };

    const { error: bookingError } = await supabase
      .from('booking')
      .insert([newBookingData]);

    if (bookingError) throw bookingError;

    // 4. Thêm chi tiết dịch vụ/phòng
    if (bookingType === 'Grooming' && bookingDetails.booking_service) {
      // Lấy booking_service_id tiếp theo
      const { data: lastSrv } = await supabase
        .from('booking_service')
        .select('booking_service_id')
        .not('booking_service_id', 'like', '%-%')
        .order('booking_service_id', { ascending: false })
        .limit(1);

      let nextSrvId = 1;
      if (lastSrv && lastSrv.length > 0 && lastSrv[0].booking_service_id) {
        const numPart = parseInt(lastSrv[0].booking_service_id.replace('BSV', ''), 10);
        if (!isNaN(numPart)) nextSrvId = numPart + 1;
      }


      const servicesToInsert = bookingDetails.booking_service.map((srv, index) => ({
        booking_service_id: `BSV${(nextSrvId + index).toString().padStart(5, '0')}`,
        booking_id,
        service_id: srv.service_id,
        groomer_id: staffId,
        table_id: srv.table_id,
        slot_start: srv.slot_start,
        slot_end: (() => {
          // Tính slot_end = slot_start + 90 phút, giữ nguyên format không qua Date (tránh lệch UTC+7)
          const [datePart, timePart] = srv.slot_start.split('T');
          const [h, m] = timePart.split(':');
          const totalMins = parseInt(h) * 60 + parseInt(m) + 90;
          const newH = String(Math.floor(totalMins / 60) % 24).padStart(2, '0');
          const newM = String(totalMins % 60).padStart(2, '0');
          return `${datePart}T${newH}:${newM}:00`;
        })(),
        price: srv.price
      }));

      const { error: srvError } = await supabase
        .from('booking_service')
        .insert(servicesToInsert);

      if (srvError) throw srvError;
    } else if (bookingType === 'Hotel' && bookingDetails.booking_room) {
      // Lấy booking_room_id tiếp theo
      const { data: lastRm } = await supabase
        .from('booking_room')
        .select('booking_room_id')
        .not('booking_room_id', 'like', '%-%')
        .order('booking_room_id', { ascending: false })
        .limit(1);

      let nextRmId = 1;
      if (lastRm && lastRm.length > 0 && lastRm[0].booking_room_id) {
        const numPart = parseInt(lastRm[0].booking_room_id.replace('BRM', ''), 10);
        if (!isNaN(numPart)) nextRmId = numPart + 1;
      }

      const roomToInsert = bookingDetails.booking_room.map((rm, index) => ({
        booking_room_id: `BRM${(nextRmId + index).toString().padStart(5, '0')}`,
        booking_id,
        room_id: rm.room_id,
        check_in_date: rm.check_in_date,
        check_out_date: rm.check_out_date,
        price_per_night: rm.price_per_night
      }));

      const { error: rmError } = await supabase
        .from('booking_room')
        .insert(roomToInsert);

      if (rmError) throw rmError;
    }

    return booking_id;
  } catch (error) {
    console.error('Error creating real booking:', error);
    throw error;
  }
};
