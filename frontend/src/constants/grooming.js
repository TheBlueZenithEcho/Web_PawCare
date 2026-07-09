// Constant UI thuần — KHÔNG phải data từ DB (services/groomingService.js mới là nguồn thật
// cho service/duration/groomer/table/slot).

export const SPECIES = [
  { id: 'dog', label: 'Dog' },
  { id: 'cat', label: 'Cat' },
];

// public.pet.size enum values
export const PET_SIZES = [
  { id: 'S', label: 'S', range: '0 - 5kg' },
  { id: 'M', label: 'M', range: '5 - 15kg' },
  { id: 'L', label: 'L', range: '15 - 30kg' },
  { id: 'XL', label: 'XL', range: '30kg+' },
];

// Sinh 7 ngày kế tiếp cho dải "Available Slots" — thuần tính toán ngày, không cần DB.
export function getUpcomingDays(count = 7) {
  const days = [];
  const dayLetters = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      date: d.getDate(),
      dayLabel: dayLetters[d.getDay()],
      full: d,
    });
  }
  return days;
}