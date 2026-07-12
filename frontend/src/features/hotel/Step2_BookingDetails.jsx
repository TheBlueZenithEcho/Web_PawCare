import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { getRoomById } from '../../services/supabase/customer/booking/hotelService';
import {
  calculateNights,
  calculateSubtotal,
  calculateTax,
  calculateDeposit,
  requiresDeposit,
} from '../../utils/hotelRules';
import BookingSummaryCard from '../../components/booking/BookingSummaryCard';
import CustomerIdentityCard from '../../components/booking/CustomerIdentityCard';

const SPECIES_OPTIONS = ['dog', 'cat'];
const GENDER_OPTIONS = ['male', 'female'];

export default function Step2_GuestDetails({ booking, setBooking, onNext, onBack, lock }) {
  const [errors, setErrors] = useState({});
  const [room, setRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(true);

  useEffect(() => {
    getRoomById(booking.roomId)
      .then(setRoom)
      .catch((e) => console.error(e))
      .finally(() => setLoadingRoom(false));
  }, [booking.roomId]);

  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const subtotal = calculateSubtotal(room?.price_per_night || 0, nights);
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;
  const deposit = calculateDeposit(total);

  const updatePet = (patch) => setBooking((prev) => ({ ...prev, pet: { ...prev.pet, ...patch } }));
  const updateExtra = (patch) => setBooking((prev) => ({ ...prev, extra: { ...prev.extra, ...patch } }));

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
          <h2 className="text-3xl font-bold text-wood-bark mb-2">Chi tiết Đặt phòng & Thông tin khách hàng</h2>
          <p className="text-wood-bark/60 max-w-xl">
            Cho chúng tôi biết thêm về người bạn nhỏ để chuyến lưu trú được chăm sóc chu đáo nhất.
          </p>
        </div>

        {/* Xác định khách hàng: đã đăng nhập / đã từng đến / khách mới */}
        <CustomerIdentityCard booking={booking} setBooking={setBooking} errors={errors} />

        <Card title="🏠 Địa chỉ">
          <Field
            label="Địa chỉ nhà"
            value={booking.extra.homeAddress}
            onChange={(v) => updateExtra({ homeAddress: v })}
            placeholder="123 Serenity Way, Green Valley"
            hint="Gợi ý: lưu vào bảng customer_address thay vì text tự do nếu cần tái sử dụng."
          />
        </Card>

        <Card title={`🐾 Hồ sơ thú cưng ${booking.pet.petId ? '(cập nhật thông tin mới nếu có)' : '(thú cưng mới)'}`}>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Tên thú cưng" value={booking.pet.name} onChange={(v) => updatePet({ name: v })} error={errors.petName} />
            <div>
              <label className="text-sm font-semibold text-wood-bark/80 mb-1.5 block">Loài</label>
              <select value={booking.pet.species} onChange={(e) => updatePet({ species: e.target.value })} className="w-full rounded-2xl bg-fresh-grown/20 px-4 py-3 text-sm outline-none">
                {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s === 'dog' ? 'Chó' : 'Mèo'}</option>)}
              </select>
            </div>
            <Field label="Giống loài" value={booking.pet.breed} onChange={(v) => updatePet({ breed: v })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Tuổi (năm)" type="number" value={booking.pet.ageYears} onChange={(v) => updatePet({ ageYears: v })} hint="Sẽ quy đổi sang pet.dob khi lưu." />
            <Field label="Cân nặng (kg)" type="number" value={booking.pet.weight} onChange={(v) => updatePet({ weight: v })} />
            <div>
              <label className="text-sm font-semibold text-wood-bark/80 mb-1.5 block">Giới tính</label>
              <select value={booking.pet.gender} onChange={(e) => updatePet({ gender: e.target.value })} className="w-full rounded-2xl bg-fresh-grown/20 px-4 py-3 text-sm outline-none">
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g === 'male' ? 'Đực' : 'Cái'}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <ToggleField label="Trạng thái tiêm vắc-xin (Đã tiêm đầy đủ)" checked={booking.extra.vaccinationUpToDate} onChange={(v) => updateExtra({ vaccinationUpToDate: v })} />
            <Field label="Tình trạng sức khỏe/Bệnh lý" value={booking.extra.medicalConditions} onChange={(v) => updateExtra({ medicalConditions: v })} placeholder="Không có" hint="Chưa có cột riêng — gộp vào pet.special_notes." />
          </div>
          <Field label="Dị ứng" value={booking.pet.allergyNotes} onChange={(v) => updatePet({ allergyNotes: v })} placeholder="Dị ứng ngũ cốc, thịt bò..." />
        </Card>

        <Card title="😊 Hành vi & Chăm sóc">
          <TextAreaField label="Lưu ý về hành vi" value={booking.pet.behaviorNotes} onChange={(v) => updatePet({ behaviorNotes: v })} placeholder="Thân thiện với chó khác, nhút nhát khi có tiếng động lớn..." />
          <div className="grid sm:grid-cols-2 gap-4">
            <ToggleField label="Tự mang thức ăn riêng" checked={booking.extra.bringOwnFood} onChange={(v) => updateExtra({ bringOwnFood: v })} />
            <Field label="Lịch trình ăn uống" value={booking.extra.feedingSchedule} onChange={(v) => updateExtra({ feedingSchedule: v })} placeholder="8:00 sáng, 6:00 tối" />
          </div>
          <MultiChoice label="Vật dụng cá nhân mang theo" options={['Chăn/Mền', 'Đồ chơi', 'Nệm nằm']} selected={booking.extra.personalBelongings} onChange={(v) => updateExtra({ personalBelongings: v })} />
        </Card>

        <Card title="⭐ Sở thích lưu trú">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Sở thích đi dạo" value={booking.extra.walkingPreference} onChange={(v) => updateExtra({ walkingPreference: v })} placeholder="Đi dạo cùng đàn" />
            <Field label="Lịch trình uống thuốc" value={booking.extra.medicationSchedule} onChange={(v) => updateExtra({ medicationSchedule: v })} placeholder="Ví dụ: 1 viên sau ăn tối" />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <ToggleField label="Dịch vụ Grooming kèm theo" checked={booking.extra.addonGrooming} onChange={(v) => updateExtra({ addonGrooming: v })} />
            <ToggleField label="Gửi ảnh hàng ngày" checked={booking.extra.addonDailyPhotos} onChange={(v) => updateExtra({ addonDailyPhotos: v })} />
            <ToggleField label="Xem webcam trực tiếp" checked={booking.extra.addonWebcam} onChange={(v) => updateExtra({ addonWebcam: v })} />
          </div>
        </Card>

        <Card title="✳️ Liên hệ khẩn cấp">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Tên người liên hệ" value={booking.extra.emergencyName} onChange={(v) => updateExtra({ emergencyName: v })} />
            <Field label="Mối quan hệ" value={booking.extra.emergencyRelationship} onChange={(v) => updateExtra({ emergencyRelationship: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Số điện thoại" value={booking.extra.emergencyPhone} onChange={(v) => updateExtra({ emergencyPhone: v })} />
            <Field label="Số điện thoại phụ" value={booking.extra.emergencyAltPhone} onChange={(v) => updateExtra({ emergencyAltPhone: v })} />
          </div>
        </Card>

        <Card title="📝 Yêu cầu đặc biệt & Bác sĩ thú y">
          <TextAreaField label="Ghi chú thêm" value={booking.pet.specialNotes} onChange={(v) => updatePet({ specialNotes: v })} placeholder="Thông tin bác sĩ thú y và các yêu cầu đặc biệt khác..." />
        </Card>

        <button onClick={onBack} className="self-start text-sm font-semibold text-wood-bark/70 hover:text-understory">
          ← Quay lại chọn phòng
        </button>
      </div>

      <div className="w-full lg:w-[360px]">
        {loadingRoom ? (
          <div className="bg-white rounded-3xl shadow-sm p-6 text-sm text-wood-bark/50 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Đang tải thông tin phòng...
          </div>
        ) : (
          <BookingSummaryCard
            packageInfo={room ? { name: `Phòng ${room.room_id}`, description: `${nights} đêm` } : null}
            petLabel={booking.pet.name}
            dateLabel={`${booking.checkIn} → ${booking.checkOut} (${nights} đêm)`}
            breakdown={[
              { label: 'Giá mỗi đêm', amount: room?.price_per_night || 0 },
              { label: `Tạm tính (${nights} đêm)`, amount: subtotal },
              { label: 'Thuế & Phí', amount: tax },
            ]}
            total={total}
            deposit={deposit}
            note={requiresDeposit(total) ? 'Đơn có giá trị ≥ 1.000.000đ nên cần đặt cọc 30% để giữ phòng.' : 'Đơn dưới 1.000.000đ nên không cần đặt cọc.'}
            ctaLabel="Tiếp tục thanh toán →"
            onCtaClick={handleContinue}
            lock={lock}
          />
        )}
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
      <h3 className="font-bold text-wood-bark">{title}</h3>
      {children}
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
      {!error && hint && <p className="text-xs text-wood-bark/40 mt-1">{hint}</p>}
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-sm font-semibold text-wood-bark/80 mb-1.5 block">{label}</label>
      <textarea rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-2xl bg-fresh-grown/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-understory/40" />
    </div>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between rounded-2xl bg-fresh-grown/20 px-4 py-3">
      <span className="text-sm font-medium text-wood-bark">{label}</span>
      <span className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${checked ? 'bg-understory justify-end' : 'bg-wood-bark/20 justify-start'}`}>
        <span className="w-5 h-5 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}

function MultiChoice({ label, options, selected = [], onChange }) {
  const toggle = (opt) => onChange(selected.includes(opt) ? selected.filter((o) => o !== opt) : [...selected, opt]);
  return (
    <div>
      <label className="text-sm font-semibold text-wood-bark/80 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)} className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isActive ? 'bg-understory text-white border-understory' : 'border-wood-bark/20 text-wood-bark/70'}`}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}