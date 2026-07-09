import { supabase } from '../supabase/client';
import { upsertCustomer, upsertPet } from './customerService';
import { requiresDeposit, calculateDeposit } from '../../utils/hotelRules';

export async function getRoomById(roomId) {
  const { data, error } = await supabase.from('room').select('*').eq('room_id', roomId).single();
  if (error) throw error;
  return data;
}

export async function getRooms({ species, maxWeight } = {}) {
  let query = supabase.from('room').select('*').eq('status', 'active');
  if (maxWeight) query = query.gte('max_weight', 0).lte('max_weight', 999999); // placeholder, lọc kỹ hơn ở dưới
  const { data, error } = await query;
  if (error) throw error;

  // Lọc species + max_weight ở client vì suitable_species có thể là enum đơn ('dog'|'cat')
  // hoặc giá trị đại diện "cả 2" tuỳ quy ước thật trong DB — xác nhận lại enum của bạn.
  return data.filter((room) => {
    const speciesOk = !species || room.suitable_species === species || room.suitable_species === 'both';
    const weightOk = !maxWeight || room.max_weight <= maxWeight || maxWeight === Infinity;
    return speciesOk && weightOk;
  });
}

/**
 * BR chung: 1 phòng chỉ được chọn nếu không trùng khoảng ngày với booking_room khác
 * (trạng thái booking chưa bị hủy). Overlap: check_in_date < otherCheckOut AND
 * check_out_date > otherCheckIn.
 */
export async function isRoomAvailable(roomId, checkIn, checkOut) {
  const { data, error } = await supabase
    .from('booking_room')
    .select('check_in_date, check_out_date, booking:booking_id(status)')
    .eq('room_id', roomId);
  if (error) throw error;

  return !data.some((row) => {
    if (row.booking?.status === 'cancelled') return false;
    return checkIn < row.check_out_date && checkOut > row.check_in_date;
  });
}

/**
 * Tạo booking Pet Hotel hoàn chỉnh: find-or-create customer/pet -> insert booking
 * -> insert booking_room -> (nếu cần cọc) insert booking_payment.
 * Cùng lưu ý về atomicity như groomingService.createGroomingBooking.
 */
export async function createHotelBooking({ booking, room, totalBill, orderId, specialNotesText }) {
  const needsDeposit = requiresDeposit(totalBill);
  const depositAmount = calculateDeposit(totalBill);

  const customer = await upsertCustomer({
    customerId: booking.customer.customerId,
    firstName: booking.customer.firstName,
    lastName: booking.customer.lastName,
    phone: booking.customer.phone,
    email: booking.customer.email,
  });

  const pet = await upsertPet({
    petId: booking.pet.petId,
    customerId: customer.customer_id,
    petName: booking.pet.name,
    species: booking.pet.species,
    breed: booking.pet.breed,
    weight: booking.pet.weight || null,
    genderOrNotes: {
      gender: booking.pet.gender || null,
      behavior_notes: booking.pet.behaviorNotes || null,
      allergy_notes: booking.pet.allergyNotes || null,
      special_notes: specialNotesText || null,
    },
  });

  const { data: bookingRow, error: bookingError } = await supabase
    .from('booking')
    .insert({
      booking_id: orderId,
      customer_id: customer.customer_id,
      pet_id: pet.pet_id,
      channel: 'website',
      booking_type: 'hotel',
      status: 'confirmed',
      total_bill: totalBill,
      deposit_amount: needsDeposit ? depositAmount : 0,
    })
    .select()
    .single();
  if (bookingError) throw bookingError;

  // Fetch next BRM id
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
  const brmId = `BRM${nextRmId.toString().padStart(5, '0')}`;

  const { error: brError } = await supabase.from('booking_room').insert({
    booking_room_id: brmId,
    booking_id: bookingRow.booking_id,
    room_id: room.room_id,
    check_in_date: booking.checkIn,
    check_out_date: booking.checkOut,
    price_per_night: room.price_per_night,
    extra_fee: 0,
  });
  if (brError) throw brError;

  if (needsDeposit) {
    const { error: payError } = await supabase.from('booking_payment').insert({
      booking_id: bookingRow.booking_id,
      amount: depositAmount,
      method: booking.paymentMethod,
      type: 'deposit',
      status: 'success',
      gateway_transaction_code: `TXN-${orderId}`,
      paid_at: new Date().toISOString(),
    });
    if (payError) throw payError;
  }

  return { booking: bookingRow, customer, pet };
}