import { supabase } from '../../client';
import { upsertCustomer, upsertPet } from '../../customerService';
import { requiresDeposit, calculateDeposit } from '../../../../utils/hotelRules';

export async function getRoomById(roomId) {
  const { data, error } = await supabase.from('room').select('*').eq('room_id', roomId).single();
  if (error) throw error;
  return data;
}

export async function getRooms({ species, maxWeight } = {}) {
  let query = supabase.from('room').select('*').eq('status', 'active');
  if (maxWeight) query = query.gte('max_weight', 0).lte('max_weight', 999999); 
  const { data, error } = await query;
  if (error) throw error;

  return data.filter((room) => {
    const speciesOk = !species || room.suitable_species === species || room.suitable_species === 'both';
    const weightOk = !maxWeight || room.max_weight <= maxWeight || maxWeight === Infinity;
    return speciesOk && weightOk;
  });
}

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

export async function createHotelBooking({ booking, room, totalBill, taxAmount, orderId, specialNotesText }) {
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
    dob: booking.pet.dob || null, // Truyền dob xuống
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
    extra_fee: taxAmount || 0, // Nhận tiền thuế làm extra_fee
  });
  if (brError) throw brError;

  if (needsDeposit) {
    // Sinh mã payment_id để tránh lỗi constraint
    const paymentId = `PAY${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;
    
    const { error: payError } = await supabase.from('booking_payment').insert({
      payment_id: paymentId,
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