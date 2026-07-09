// Constant UI thuần — KHÔNG phải data từ DB (services/hotelService.js mới là nguồn thật cho room).

export const SPECIES_FILTER = [
  { id: 'dog', label: 'Dog' },
  { id: 'cat', label: 'Cat' },
];

export const WEIGHT_BRACKETS = [
  { id: 'under10', label: 'Under 10kg', max: 10 },
  { id: 'under15', label: 'Under 15kg', max: 15 },
  { id: 'under30', label: 'Under 30kg', max: 30 },
  { id: 'any', label: 'Bất kỳ', max: Infinity },
];