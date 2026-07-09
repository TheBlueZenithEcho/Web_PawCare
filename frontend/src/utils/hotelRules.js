// Business rules cho luồng Pet Hotel. isValidVNPhone/lookupCustomerByPhone thật
// nằm ở utils/groomingRules.js (validate) và services/customerService.js (query DB).
export { isValidVNPhone } from './groomingRules';

export const DEPOSIT_THRESHOLD = 1000000;
export const DEPOSIT_RATE = 0.3;

// "Taxes & Fees" trong mockup — HIỆN CHƯA có cột phí dịch vụ/thuế trong bảng
// booking hay booking_room. Tạm tính ở FE, khi lưu DB có thể cộng vào
// booking.total_bill hoặc booking_room.extra_fee tuỳ quy ước của bạn.
export const SERVICE_TAX_RATE = 0.08;

export function requiresDeposit(totalBill) {
  return totalBill >= DEPOSIT_THRESHOLD;
}

export function calculateDeposit(totalBill) {
  return requiresDeposit(totalBill) ? Math.round(totalBill * DEPOSIT_RATE) : 0;
}

// booking_room.check_in_date / check_out_date -> số đêm lưu trú
export function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function calculateSubtotal(pricePerNight, nights) {
  return pricePerNight * Math.max(nights, 0);
}

export function calculateTax(subtotal) {
  return Math.round(subtotal * SERVICE_TAX_RATE);
}

export function calculateAge(dobString) {
  if (!dobString) return null;
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
}