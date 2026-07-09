// Business rules trích từ qtnv_new.docx (mục 5.1.1 & 5.1.2). Không còn mock data —
// lookupCustomerByPhone thật nằm ở services/customerService.js.

export const DEPOSIT_THRESHOLD = 1000000;
export const DEPOSIT_RATE = 0.3;
export const SLOT_LOCK_SECONDS = 10 * 60;

export function requiresDeposit(totalAmount) {
  return totalAmount >= DEPOSIT_THRESHOLD;
}

export function calculateDeposit(totalAmount) {
  return requiresDeposit(totalAmount) ? Math.round(totalAmount * DEPOSIT_RATE) : 0;
}

export function formatDuration(minutes) {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} giờ ${m} phút` : `${h} giờ`;
}

export function isValidVNPhone(phone) {
  return /^0\d{9}$/.test(phone.trim());
}