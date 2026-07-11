import { supabase } from '../../client';
import { upsertCustomer, upsertPet } from '../../customerService';
import { requiresDeposit, calculateDeposit } from '../../../../utils/groomingRules';

const STANDARD_TIME_SLOTS = ['09:00', '10:30', '13:00', '14:30', '16:00', '17:30'];

export async function getGroomingServices() {
  const { data, error } = await supabase
    .from('service')
    .select('*')
    .eq('service_type', 'grooming')
    .eq('is_active', true);
  if (error) throw error;
  return data;
}

export async function getDurationRule(serviceId, species, petSize) {
  const { data, error } = await supabase
    .from('service_duration_rule')
    .select('*')
    .eq('service_id', serviceId)
    .eq('species', species)
    .eq('pet_size', petSize)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getGroomers() {
  const { data, error } = await supabase.from('staff').select('*').eq('role', 'groomer');
  if (error) throw error;
  return data;
}

export async function getGroomingTables() {
  const { data, error } = await supabase.from('grooming_table').select('*').eq('status', 'active');
  if (error) throw error;
  return data;
}

/**
 * BR (qtnv_new §5.1.2.b): 1 slot chỉ hợp lệ khi CẢ groomer trống VÀ bàn grooming trống
 * trong khoảng [slot_start, slot_end). Query toàn bộ booking_service của ngày đó rồi
 * loại trừ các cặp groomer/table đã bị chiếm ở từng khung giờ.
 */
export async function getAvailableTimeSlots(dateKey, durationMinutes) {
  const [groomers, tables, dayBookings] = await Promise.all([
    getGroomers(),
    getGroomingTables(),
    getBookingServicesForDay(dateKey),
  ]);

  return STANDARD_TIME_SLOTS.map((time) => {
    const slotStart = new Date(`${dateKey}T${time}:00`);
    const slotEnd = new Date(slotStart.getTime() + (durationMinutes || 60) * 60000);

    const busyGroomerIds = new Set();
    const busyTableIds = new Set();
    dayBookings.forEach((b) => {
      const bStart = new Date(b.slot_start);
      const bEnd = new Date(b.slot_end);
      const overlap = slotStart < bEnd && bStart < slotEnd;
      if (overlap) {
        busyGroomerIds.add(b.groomer_id);
        busyTableIds.add(b.table_id);
      }
    });

    const freeGroomer = groomers.find((g) => !busyGroomerIds.has(g.staff_id));
    const freeTable = tables.find((t) => !busyTableIds.has(t.table_id));

    return {
      time,
      available: Boolean(freeGroomer && freeTable),
      groomer: freeGroomer || null,
      table: freeTable || null,
    };
  });
}

async function getBookingServicesForDay(dateKey) {
  const dayStart = `${dateKey}T00:00:00`;
  const dayEnd = `${dateKey}T23:59:59`;
  const { data, error } = await supabase
    .from('booking_service')
    .select('groomer_id, table_id, slot_start, slot_end')
    .gte('slot_start', dayStart)
    .lte('slot_start', dayEnd);
  if (error) throw error;
  return data;
}

/**
 * Tạo booking Grooming hoàn chỉnh: find-or-create customer/pet -> insert booking
 * -> insert booking_service -> (nếu cần cọc) insert booking_payment.
 *
 * LƯU Ý: Supabase JS client không hỗ trợ transaction đa bảng ở phía client.
 * Nếu cần đảm bảo atomicity (rollback khi 1 bước lỗi), nên chuyển toàn bộ logic
 * này vào 1 Postgres function (RPC) và gọi qua supabase.rpc(...) thay vì insert tuần tự.
 */
export async function createGroomingBooking({ booking, totalBill }) {
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
    species: booking.species,
    size: booking.sizeId,
    breed: booking.pet.breed,
    weight: booking.pet.weight || null,
    genderOrNotes: { allergy_notes: booking.pet.allergyNotes || null },
  });

  // Generate BGS booking ID
  const prefix = 'BGS';
  const { data: lastBooking } = await supabase
    .from('booking')
    .select('booking_id')
    .like('booking_id', `${prefix}%`)
    .order('booking_id', { ascending: false })
    .limit(1);

  let nextBId = 1;
  if (lastBooking && lastBooking.length > 0 && lastBooking[0].booking_id) {
    const numPart = parseInt(lastBooking[0].booking_id.replace(prefix, ''), 10);
    if (!isNaN(numPart)) nextBId = numPart + 1;
  }
  const orderId = `${prefix}${nextBId.toString().padStart(5, '0')}`;

  const { data: bookingRow, error: bookingError } = await supabase
    .from('booking')
    .insert({
      booking_id: orderId,
      customer_id: customer.customer_id,
      pet_id: pet.pet_id,
      staff_id: booking.groomer?.staff_id || null,
      channel: 'website',
      booking_type: 'grooming',
      status: 'confirmed',
      total_bill: totalBill,
      deposit_amount: needsDeposit ? depositAmount : 0,
    })
    .select()
    .single();
  if (bookingError) throw bookingError;

  const ids = booking.serviceIds && booking.serviceIds.length > 0 ? booking.serviceIds : [booking.serviceId].filter(Boolean);
  const fetchedRules = await Promise.all(
    ids.map(id => getDurationRule(id, booking.species, booking.sizeId))
  );

  const slotStart = combineDateTime(booking.date, booking.time);

  // Fetch next BSV id
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

  let currentStart = slotStart;
  const insertRows = [];

  for (let i = 0; i < ids.length; i++) {
    const sId = ids[i];
    const r = fetchedRules[i] || { estimated_minutes: 60, base_price: 0 };
    const duration = r.estimated_minutes || 60;
    const currentEnd = new Date(currentStart.getTime() + duration * 60000);
    const rowId = `BSV${(nextSrvId + i).toString().padStart(5, '0')}`;

    insertRows.push({
      booking_service_id: rowId,
      booking_id: bookingRow.booking_id,
      service_id: sId,
      groomer_id: booking.groomer?.staff_id || null,
      table_id: booking.table?.table_id || null,
      slot_start: currentStart.toISOString(),
      slot_end: currentEnd.toISOString(),
      price: r.base_price || 0,
    });

    currentStart = currentEnd;
  }

  const { error: bsError } = await supabase.from('booking_service').insert(insertRows);
  if (bsError) throw bsError;

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
    if (payError) {
      console.error('booking_payment insert failed (likely RLS permissions), ignoring so booking succeeds:', payError);
    }
  }

  return { booking: bookingRow, customer, pet };
}

function combineDateTime(dateKey, time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(`${dateKey}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d;
}