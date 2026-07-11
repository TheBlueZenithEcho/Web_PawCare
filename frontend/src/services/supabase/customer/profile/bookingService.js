import { supabase } from '../../client';

/**
 * Lấy toàn bộ booking (cả Grooming và Pet Hotel) của 1 khách, kèm thông tin cần hiển thị
 * ở trang Booking History: dịch vụ/phòng, ngày giờ, nhân viên, số tiền đã thanh toán.
 */
export async function getBookingsByCustomer(customerId) {
  const { data, error } = await supabase
    .from('booking')
    .select(
      `booking_id, booking_type, status, total_bill, deposit_amount, cancel_reason, cancelled_at, created_at,
       pet:pet_id(pet_name),
       booking_service(slot_start, slot_end, service:service_id(service_name), groomer:groomer_id(first_name, last_name)),
       booking_room(check_in_date, check_out_date, room:room_id(room_id, price_per_night)),
       booking_payment(amount, method, status, paid_at)`
    )
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(normalizeBooking);
}

function normalizeBooking(b) {
  const bs = b.booking_service?.[0];
  const br = b.booking_room?.[0];
  const payment = b.booking_payment?.[0];

  let title = b.booking_type;
  let dateLabel = '';
  let timeLabel = '';
  let staffLabel = null;
  let referenceDate = new Date(b.created_at);

  if (b.booking_type === 'grooming' && bs) {
    title = bs.service?.service_name || 'Grooming/Spa';
    const start = new Date(bs.slot_start);
    dateLabel = start.toLocaleDateString('vi-VN');
    timeLabel = start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    staffLabel = bs.groomer ? `${bs.groomer.first_name} ${bs.groomer.last_name}` : null;
    referenceDate = new Date(bs.slot_end || bs.slot_start);
  } else if (b.booking_type === 'hotel' && br) { // Đã sửa 'pet_hotel' thành 'hotel' cho khớp schema enum
    title = `Lưu trú ${br.room?.room_id || ''}`.trim();
    dateLabel = `${new Date(br.check_in_date).toLocaleDateString('vi-VN')} - ${new Date(br.check_out_date).toLocaleDateString('vi-VN')}`;
    referenceDate = new Date(br.check_out_date);
  }

  return {
    booking_id: b.booking_id,
    booking_type: b.booking_type,
    status: b.status,
    total_bill: b.total_bill,
    cancel_reason: b.cancel_reason,
    created_at: b.created_at,
    petName: b.pet?.pet_name,
    title,
    dateLabel,
    timeLabel,
    staffLabel,
    amountPaid: payment?.amount ?? b.total_bill,
    paymentMethod: payment?.method,
    referenceDate,
  };
}