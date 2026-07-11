import { supabase } from '../../client';

export async function getPetsByCustomer(customerId, { search, species } = {}) {
  let query = supabase.from('pet').select('*').eq('customer_id', customerId);
  if (species) query = query.eq('species', species);
  if (search) query = query.ilike('pet_name', `%${search}%`);
  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getUpcomingCareForPet(petId) {
  const nowIso = new Date().toISOString();
  const todayKey = nowIso.slice(0, 10);

  const { data: bookings, error } = await supabase
    .from('booking')
    .select('booking_id, booking_type')
    .eq('pet_id', petId)
    .eq('status', 'confirmed');
  if (error) throw error;

  const groomingIds = bookings.filter((b) => b.booking_type === 'grooming').map((b) => b.booking_id);
  const hotelIds = bookings.filter((b) => b.booking_type === 'hotel').map((b) => b.booking_id); // Đã sửa thành 'hotel'

  let nextGrooming = null;
  let nextHotel = null;

  if (groomingIds.length) {
    const { data } = await supabase
      .from('booking_service')
      .select('slot_start, service:service_id(service_name)')
      .in('booking_id', groomingIds)
      .gte('slot_start', nowIso)
      .order('slot_start', { ascending: true })
      .limit(1)
      .maybeSingle();
    nextGrooming = data;
  }

  if (hotelIds.length) {
    const { data } = await supabase
      .from('booking_room')
      .select('check_in_date')
      .in('booking_id', hotelIds)
      .gte('check_in_date', todayKey)
      .order('check_in_date', { ascending: true })
      .limit(1)
      .maybeSingle();
    nextHotel = data;
  }

  if (nextGrooming && nextHotel) {
    const groomingDate = new Date(nextGrooming.slot_start);
    const hotelDate = new Date(`${nextHotel.check_in_date}T00:00:00`);
    return groomingDate < hotelDate
      ? { type: 'grooming', label: nextGrooming.service?.service_name || 'Grooming', date: nextGrooming.slot_start }
      : { type: 'hotel', label: 'Pet Hotel', date: nextHotel.check_in_date };
  }
  if (nextGrooming) return { type: 'grooming', label: nextGrooming.service?.service_name || 'Grooming', date: nextGrooming.slot_start };
  if (nextHotel) return { type: 'hotel', label: 'Pet Hotel', date: nextHotel.check_in_date };
  return null;
}

export async function getPetById(petId) {
  const { data, error } = await supabase
    .from('pet')
    .select('*, customer:customer_id(first_name, last_name)')
    .eq('pet_id', petId)
    .single();
  if (error) throw error;
  return data;
}

export async function getPetHealthRecords(petId) {
  const { data, error } = await supabase
    .from('pet_health_record')
    .select('*')
    .eq('pet_id', petId)
    .order('recorded_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getPetGroomingBookings(petId) {
  const { data, error } = await supabase
    .from('booking')
    .select(
      `booking_id, status, total_bill, created_at,
       booking_service(slot_start, slot_end, service:service_id(service_name), groomer:groomer_id(first_name, last_name))`
    )
    .eq('pet_id', petId)
    .eq('booking_type', 'grooming')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPetHotelBookings(petId) {
  const { data, error } = await supabase
    .from('booking')
    .select(
      `booking_id, status, total_bill, created_at,
       booking_room(check_in_date, check_out_date, actual_check_out, price_per_night, room:room_id(room_id, price_per_night))`
    )
    .eq('pet_id', petId)
    .eq('booking_type', 'hotel') // Đã sửa thành 'hotel'
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updatePet(petId, patch) {
  const { data, error } = await supabase.from('pet').update(patch).eq('pet_id', petId).select().single();
  if (error) throw error;
  return data;
}

export async function createPet(payload) {
  const newId = `PET-${Date.now().toString(36).toUpperCase()}`;
  const { data, error } = await supabase.from('pet').insert({ pet_id: newId, ...payload }).select().single();
  if (error) throw error;
  return data;
}