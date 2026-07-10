import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getGroomingServices, getDurationRule } from '../../services/supabase/customer/booking/groomingService';
import { calculateDeposit, requiresDeposit, formatDuration } from '../../utils/groomingRules';
import BookingSummaryCard from '../../components/booking/BookingSummaryCard';
import CustomerIdentityCard from '../../components/booking/CustomerIdentityCard';

export default function Step2_CustomerDetails({ booking, setBooking, onNext, onBack, lock }) {
  const [errors, setErrors] = useState({});
  const [service, setService] = useState(null);
  const [rule, setRule] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);

  // Chốt lại giá/thời gian ngay khi vào Bước 2 (revalidate, tránh giá lệch nếu DB đổi giữa chừng)
  useEffect(() => {
    Promise.all([
      getGroomingServices().then((list) => list.find((s) => s.service_id === booking.serviceId)),
      getDurationRule(booking.serviceId, booking.species, booking.sizeId),
    ])
      .then(([svc, r]) => {
        setService(svc || null);
        setRule(r || null);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingPrice(false));
  }, [booking.serviceId, booking.species, booking.sizeId]);

  const total = rule ? rule.base_price : 0;
  const deposit = calculateDeposit(total);

  const updatePet = (patch) => setBooking((prev) => ({ ...prev, pet: { ...prev.pet, ...patch } }));

  const validate = () => {
    const next = {};
    if (!booking.customer.firstName.trim()) next.firstName = 'Vui lòng nhập tên';
    if (!booking.customer.lastName.trim()) next.lastName = 'Vui lòng nhập họ';
    if (!booking.customer.phone.trim()) next.phone = 'Vui lòng nhập số điện thoại';
    if (!booking.pet.name.trim()) next.petName = 'Vui lòng nhập tên thú cưng';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    if (validate()) onNext();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold text-wood-bark mb-2">Booking Information</h2>
          <p className="text-wood-bark/60 max-w-xl">
            Vui lòng cung cấp thông tin để chúng tôi chuẩn bị dịch vụ chăm sóc tốt nhất cho thú cưng của bạn.
          </p>
        </div>

        {/* Xác định khách hàng: đã đăng nhập / đã từng đến / khách mới */}
        <CustomerIdentityCard booking={booking} setBooking={setBooking} errors={errors} />

        <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
          <h3 className="font-bold text-wood-bark flex items-center gap-2">
            🐾 Pet Profile {booking.pet.petId ? '(cập nhật thông tin mới nếu có)' : '(thú cưng mới)'}
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Pet Name" value={booking.pet.name} onChange={(v) => updatePet({ name: v })} error={errors.petName} />
            <Field label="Breed" value={booking.pet.breed} onChange={(v) => updatePet({ breed: v })} />
            <Field label="Weight (kg)" type="number" value={booking.pet.weight} onChange={(v) => updatePet({ weight: v })} />
          </div>
          <div>
            <label className="text-sm font-semibold text-wood-bark/80 mb-1.5 block">Special Instructions or Allergies</label>
            <textarea
              rows={3}
              value={booking.pet.allergyNotes}
              onChange={(e) => updatePet({ allergyNotes: e.target.value })}
              placeholder="Dị ứng, bệnh nền, tính cách cần lưu ý..."
              className="w-full rounded-2xl bg-fresh-grown/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-understory/40"
            />
          </div>
        </div>

        <button onClick={onBack} className="self-start text-sm font-semibold text-wood-bark/70 hover:text-understory">
          ← Back to Selection
        </button>
      </div>

      <div className="w-full lg:w-[360px]">
        {loadingPrice ? (
          <div className="bg-white rounded-3xl shadow-sm p-6 text-sm text-wood-bark/50 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Đang chốt giá...
          </div>
        ) : (
          <BookingSummaryCard
            packageInfo={service ? { name: service.service_name, description: service.description } : null}
            petLabel={booking.pet.name ? `${booking.pet.name} (${booking.sizeId})` : ''}
            timeLabel={booking.time}
            durationLabel={rule ? formatDuration(rule.estimated_minutes) : undefined}
            breakdown={[{ label: service?.service_name || 'Dịch vụ', amount: total }]}
            total={total}
            deposit={deposit}
            note={requiresDeposit(total) ? 'Đơn có giá trị ≥ 1.000.000đ nên cần đặt cọc 30% để giữ lịch.' : 'Đơn dưới 1.000.000đ nên không cần đặt cọc.'}
            ctaLabel="Continue to Payment →"
            onCtaClick={handleContinue}
            lock={lock}
          />
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, onBlur, placeholder, error, hint, type = 'text' }) {
  return (
    <div>
      <label className="text-sm font-semibold text-wood-bark/80 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`w-full rounded-2xl px-4 py-3 text-sm outline-none bg-fresh-grown/20 focus:ring-2 focus:ring-understory/40 ${error ? 'ring-2 ring-red-300' : ''}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {!error && hint && <p className="text-xs text-wood-bark/50 mt-1">{hint}</p>}
    </div>
  );
}