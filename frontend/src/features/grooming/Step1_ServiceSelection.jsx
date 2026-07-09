import { useMemo, useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { SPECIES, PET_SIZES, getUpcomingDays } from '../../../src/constants/grooming';
import {
  getGroomingServices,
  getDurationRule,
  getAvailableTimeSlots,
} from '../../../src/services/supabase/groomingService';
import { formatDuration } from '../../../src/utils/groomingRules';
import { formatVND } from '../../../src/utils/format';
import BookingSummaryCard from '../../../src/components/booking/BookingSummaryCard';

const PawIcon = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 14c-1.8 0-3.2 1.4-3.2 3.2 0 1.8 1.4 3.2 3.2 3.2s3.2-1.4 3.2-3.2c0-1.8-1.4-3.2-3.2-3.2z" />
    <circle cx="6" cy="11.5" r="1.8" />
    <circle cx="9.5" cy="7.5" r="1.8" />
    <circle cx="14.5" cy="7.5" r="1.8" />
    <circle cx="18" cy="11.5" r="1.8" />
  </svg>
);

export default function Step1_ServiceSelection({ booking, setBooking, onNext, lock }) {
  const days = useMemo(() => getUpcomingDays(7), []);
  const selectedDayKey = booking.date || days[0].key;

  const [services, setServices] = useState([]);
  const [rules, setRules] = useState({}); // key: `${serviceId}_${species}_${size}` -> rule
  const [timeSlots, setTimeSlots] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

  // Load danh sách service 1 lần
  useEffect(() => {
    getGroomingServices()
      .then(setServices)
      .catch((e) => {
        console.error(e);
        setError('Không tải được danh sách dịch vụ. Kiểm tra kết nối Supabase.');
      })
      .finally(() => setLoadingServices(false));
  }, []);

  const durationRule = booking.serviceId && booking.species && booking.sizeId
    ? rules[`${booking.serviceId}_${booking.species}_${booking.sizeId}`]
    : null;

  // Load duration rule mỗi khi service/species/size thay đổi
  useEffect(() => {
    if (!booking.serviceId || !booking.species || !booking.sizeId) return;
    const key = `${booking.serviceId}_${booking.species}_${booking.sizeId}`;
    if (rules[key] !== undefined) return;
    getDurationRule(booking.serviceId, booking.species, booking.sizeId)
      .then((rule) => setRules((prev) => ({ ...prev, [key]: rule || null })))
      .catch((e) => console.error(e));
  }, [booking.serviceId, booking.species, booking.sizeId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load slot trống mỗi khi đổi ngày (cần biết duration để check overlap chính xác)
  useEffect(() => {
    setLoadingSlots(true);
    getAvailableTimeSlots(selectedDayKey, durationRule?.estimated_minutes || 60)
      .then(setTimeSlots)
      .catch((e) => {
        console.error(e);
        setError('Không tải được lịch trống. Thử lại sau.');
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDayKey, durationRule?.estimated_minutes]);

  const selectedDay = days.find((d) => d.key === selectedDayKey);
  const total = durationRule ? durationRule.base_price : 0;
  const canContinue = Boolean(
    booking.species && booking.sizeId && booking.serviceId && durationRule &&
      booking.date && booking.time && booking.pet.name.trim()
  );

  const update = (patch) => setBooking((prev) => ({ ...prev, ...patch }));
  const updatePet = (patch) => setBooking((prev) => ({ ...prev, pet: { ...prev.pet, ...patch } }));

  const handleSpeciesChange = (species) => update({ species });

  const handlePickDay = (dayKey) => update({ date: dayKey, time: '', groomer: null, table: null });

  const handlePickTime = (slot) => {
    update({ time: slot.time, groomer: slot.groomer, table: slot.table });
    lock.reset();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-10">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {/* 1. Pet Information */}
        <section>
          <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
            <h2 className="text-2xl font-bold text-wood-bark">1. Pet Information</h2>
            <div className="inline-flex rounded-full bg-white shadow-sm p-1">
              {SPECIES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSpeciesChange(s.id)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    booking.species === s.id ? 'bg-understory text-white shadow' : 'text-wood-bark/60 hover:text-wood-bark'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-wood-bark/80 mb-2 block">Pet Name</label>
              <input
                type="text"
                value={booking.pet.name}
                onChange={(e) => updatePet({ name: e.target.value })}
                placeholder="Bino"
                className="w-full bg-white rounded-2xl px-4 py-3 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-understory/40"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-wood-bark/80 mb-2 block">
                Breed <span className="text-wood-bark/40 font-normal">(tùy chọn)</span>
              </label>
              <input
                type="text"
                value={booking.pet.breed}
                onChange={(e) => updatePet({ breed: e.target.value })}
                placeholder="Golden Retriever"
                className="w-full bg-white rounded-2xl px-4 py-3 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-understory/40"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-semibold text-wood-bark/80 mb-3 block">Select Pet Size</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PET_SIZES.map((size) => {
                const isSelected = booking.sizeId === size.id;
                return (
                  <button
                    key={size.id}
                    onClick={() => update({ sizeId: size.id })}
                    className={`flex flex-col items-center gap-1 rounded-2xl py-5 shadow-sm transition-all ${
                      isSelected ? 'bg-understory text-white shadow-md scale-[1.02]' : 'bg-white text-wood-bark hover:shadow-md'
                    }`}
                  >
                    <PawIcon className={isSelected ? 'text-white w-5 h-5' : 'text-understory w-5 h-5'} />
                    <span className="font-bold">{size.label}</span>
                    <span className="text-xs opacity-70">{size.range}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. Select Grooming Service */}
        <section>
          <h2 className="text-2xl font-bold text-wood-bark mb-2">2. Select Grooming Service</h2>
          {loadingServices ? (
            <p className="text-sm text-wood-bark/50 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Đang tải dịch vụ...
            </p>
          ) : (
            <div className="grid sm:grid-cols-3 gap-5">
              {services.map((service) => {
                const isSelected = booking.serviceId === service.service_id;
                const key = `${service.service_id}_${booking.species}_${booking.sizeId}`;
                const rule = rules[key];
                return (
                  <button
                    key={service.service_id}
                    onClick={() => update({ serviceId: service.service_id })}
                    className={`text-left rounded-3xl overflow-hidden shadow-sm transition-all ${
                      isSelected ? 'ring-2 ring-fresh-grown shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="h-24 bg-fresh-grown/30 flex items-center justify-center">
                      <PawIcon className="w-9 h-9 text-understory/60" />
                    </div>
                    <div className={`p-4 ${isSelected ? 'bg-understory text-white' : 'bg-white text-wood-bark'}`}>
                      <p className="font-bold">{service.service_name}</p>
                      <p className={`text-xs mt-1 line-clamp-2 ${isSelected ? 'text-white/80' : 'text-wood-bark/60'}`}>
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="font-bold block">{rule ? formatVND(rule.base_price) : '—'}</span>
                          {rule && (
                            <span className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-wood-bark/50'}`}>
                              {formatDuration(rule.estimated_minutes)}
                            </span>
                          )}
                        </div>
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isSelected ? 'bg-fresh-grown text-understory' : 'bg-fresh-grown/40 text-understory'}`}>
                          <Check size={14} />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="w-full lg:w-[360px] flex flex-col gap-6">
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <h3 className="font-bold text-wood-bark mb-4">📅 Available Slots</h3>
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((d) => {
              const isSelected = d.key === selectedDayKey;
              return (
                <button key={d.key} onClick={() => handlePickDay(d.key)} className="flex flex-col items-center gap-1 py-1">
                  <span className="text-[10px] text-wood-bark/50">{d.dayLabel}</span>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${isSelected ? 'bg-understory text-white' : 'text-wood-bark hover:bg-fresh-grown/30'}`}>
                    {d.date}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-5">
          <h3 className="font-bold text-wood-bark mb-4">🕐 Select Time</h3>
          {loadingSlots ? (
            <p className="text-sm text-wood-bark/50 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Đang kiểm tra lịch trống...
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {timeSlots.map((slot) => {
                const isSelected = booking.time === slot.time;
                return (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => handlePickTime(slot)}
                    className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                      !slot.available ? 'bg-wood-bark/5 text-wood-bark/30 cursor-not-allowed' : isSelected ? 'bg-understory text-white' : 'border border-wood-bark/15 text-wood-bark hover:border-understory'
                    }`}
                  >
                    {slot.time}
                  </button>
                );
              })}
            </div>
          )}
          {booking.groomer && (
            <p className="text-xs text-wood-bark/50 mt-3">
              Groomer: {booking.groomer.first_name} {booking.groomer.last_name} · {booking.table.table_code}
            </p>
          )}
        </div>

        <BookingSummaryCard
          packageInfo={(() => {
            const s = services.find((sv) => sv.service_id === booking.serviceId);
            return s ? { name: s.service_name, description: s.description } : null;
          })()}
          petLabel={booking.pet.name ? `${booking.pet.name} (${booking.sizeId || '—'})` : ''}
          dateLabel={selectedDay ? selectedDay.full.toLocaleDateString('vi-VN') : undefined}
          timeLabel={booking.time || undefined}
          durationLabel={durationRule ? formatDuration(durationRule.estimated_minutes) : undefined}
          total={total}
          ctaLabel="Continue to Info →"
          ctaDisabled={!canContinue}
          onCtaClick={onNext}
          lock={booking.time ? lock : null}
        />
      </div>
    </div>
  );
}