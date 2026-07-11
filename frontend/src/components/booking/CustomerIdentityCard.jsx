import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { lookupCustomerByPhone, getCustomerById } from '../../services/supabase/customerService';
import { isValidVNPhone } from '../../utils/groomingRules';
import PetPicker from './PetPicker';

/**
 * Gộp 3 luồng đặt lịch theo yêu cầu redesign PawCare:
 *
 * 1. Đã đăng nhập      -> tự lấy customer + danh sách pet qua session localStorage
 *                          (xem useAuth.js), không hỏi lại SĐT.
 * 2. Chưa đăng nhập,
 *    đã từng đến        -> nhập SĐT, bấm Tra cứu, xác nhận thông tin + chọn pet trong danh sách đã lưu.
 * 3. Khách hoàn toàn mới -> SĐT không có trong hệ thống -> nhập tay đầy đủ, tạo hồ sơ mới.
 *
 * Component này chỉ chịu trách nhiệm "xác định đây là ai" + "đặt cho pet nào / pet mới".
 * Các field chi tiết riêng theo dịch vụ (size cho grooming, weight/gender/age cho hotel...)
 * vẫn nằm ở từng Step2 gọi component này — vì mỗi luồng dịch vụ cần field khác nhau, và vì
 * BR (qtnv_new §5.1.2, §5.1.3): thông tin pet được bổ sung/cập nhật dần mỗi lần dùng dịch vụ,
 * nên kể cả pet đã có sẵn, các field đó vẫn cần hiển thị để nhân viên/khách bổ sung thêm.
 *
 * Props:
 * - booking, setBooking: state booking của Step2 cha.
 * - errors: object lỗi validate từ Step2 cha (firstName, lastName, phone...).
 */
export default function CustomerIdentityCard({ booking, setBooking, errors = {} }) {
  const { user, loading: authLoading } = useAuth();

  // checking | guest-entry | guest-confirm | guest-new | authed
  const [phase, setPhase] = useState('checking');
  const [pets, setPets] = useState([]);
  const [phoneInput, setPhoneInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const updateCustomer = (patch) =>
    setBooking((prev) => ({ ...prev, customer: { ...prev.customer, ...patch } }));

  const applyPetSelection = (petId, petList) => {
    if (petId == null) {
      // "Thêm thú cưng mới": xoá thông tin pet để form chi tiết bên dưới (ở Step2 cha) nhập mới.
      setBooking((prev) => ({
        ...prev,
        pet: {
          ...prev.pet,
          petId: null,
          name: '',
          breed: '',
          weight: '',
          allergyNotes: '',
          behaviorNotes: '',
          specialNotes: '',
        },
      }));
      return;
    }
    const found = petList.find((p) => p.pet_id === petId);
    if (!found) return;
    setBooking((prev) => ({
      ...prev,
      pet: {
        ...prev.pet,
        petId: found.pet_id,
        name: found.pet_name,
        species: found.species || prev.pet.species,
        breed: found.breed || '',
        weight: found.weight || '',
        gender: found.gender || prev.pet.gender,
        allergyNotes: found.allergy_notes || '',
        behaviorNotes: found.behavior_notes || '',
        specialNotes: found.special_notes || '',
      },
    }));
  };

  // Luồng 1: đã đăng nhập (đọc từ localStorage 'customer_user', xem useAuth.js) ->
  // tự động refetch customer + pet mới nhất theo customer_id, không hỏi lại SĐT.
  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.customer_id) {
      setPhase((p) => (p === 'checking' ? 'guest-entry' : p));
      return;
    }

    let cancelled = false;
    getCustomerById(user.customer_id)
      .then((customer) => {
        if (cancelled) return;
        if (!customer) {
          // customer_id trong localStorage không còn tồn tại (hiếm, vd bị xoá) -> coi như khách mới.
          setPhase('guest-new');
          return;
        }
        const petList = customer.pet || [];
        setPets(petList);
        updateCustomer({
          customerId: customer.customer_id,
          firstName: customer.first_name,
          lastName: customer.last_name,
          phone: customer.phone || '',
          email: customer.email || '',
          isReturning: true,
        });
        if (petList.length === 1) applyPetSelection(petList[0].pet_id, petList);
        setPhase('authed');
      })
      .catch((e) => {
        console.error(e);
        setPhase('guest-entry');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleSearch = async () => {
    const phone = phoneInput.trim();
    if (!isValidVNPhone(phone)) {
      setSearchError('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');
      return;
    }
    setSearching(true);
    setSearchError('');
    try {
      const found = await lookupCustomerByPhone(phone);
      if (found) {
        const petList = found.pet || [];
        setPets(petList);
        updateCustomer({
          customerId: found.customer_id,
          firstName: found.first_name,
          lastName: found.last_name,
          phone: found.phone,
          email: found.email || '',
          isReturning: true,
        });
        if (petList.length === 1) applyPetSelection(petList[0].pet_id, petList);
        setPhase('guest-confirm');
      } else {
        // Luồng 3: SĐT chưa từng có -> khách mới.
        updateCustomer({ customerId: null, phone, isReturning: false });
        setPhase('guest-new');
      }
    } catch (e) {
      console.error(e);
      setSearchError('Có lỗi khi tra cứu, vui lòng thử lại.');
    } finally {
      setSearching(false);
    }
  };

  const handleNotMe = () => {
    setPets([]);
    updateCustomer({ customerId: null, firstName: '', lastName: '', email: '', isReturning: false });
    setPhoneInput('');
    setSearchError('');
    setPhase('guest-entry');
  };

  if (phase === 'checking' || authLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-6 text-sm text-wood-bark/50 flex items-center gap-2">
        <Loader2 size={14} className="animate-spin" /> Đang kiểm tra thông tin tài khoản...
      </div>
    );
  }

  // ---- Luồng 2 (bước đầu): nhập SĐT để tra cứu ----
  if (phase === 'guest-entry') {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
        <h3 className="font-bold text-wood-bark flex items-center gap-2">👤 Bạn đã từng đến PawCare chưa?</h3>
        <p className="text-sm text-wood-bark/60">
          Nhập số điện thoại để hệ thống tìm lại thông tin cũ, hoặc bỏ qua nếu bạn là khách mới.
        </p>
        <div className="flex gap-3">
          <input
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Số điện thoại"
            className="flex-1 rounded-2xl bg-fresh-grown/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-understory/40"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="rounded-2xl bg-understory px-5 text-sm font-bold text-white hover:bg-wood-bark transition-colors disabled:opacity-60"
          >
            {searching ? <Loader2 size={16} className="animate-spin" /> : 'Tra cứu'}
          </button>
        </div>
        {searchError && <p className="text-xs text-red-500">{searchError}</p>}
        <button
          onClick={() => {
            updateCustomer({ customerId: null, phone: phoneInput, isReturning: false });
            setPhase('guest-new');
          }}
          className="self-start text-sm font-semibold text-understory hover:underline"
        >
          Tôi là khách hàng mới, bỏ qua tra cứu →
        </button>
      </div>
    );
  }

  // ---- Luồng 1 (đã đăng nhập) & Luồng 2 (đã xác nhận) ----
  if (phase === 'authed' || phase === 'guest-confirm') {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
        <h3 className="font-bold text-wood-bark flex items-center gap-2">
          👤 {phase === 'authed' ? 'Thông tin tài khoản' : 'Đã nhận diện khách hàng cũ'}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {(!booking.customer.lastName || !booking.customer.firstName || errors.firstName || errors.lastName) ? (
            <>
              <Field label="Tên" value={booking.customer.firstName} onChange={(v) => updateCustomer({ firstName: v })} error={errors.firstName} />
              <Field label="Họ" value={booking.customer.lastName} onChange={(v) => updateCustomer({ lastName: v })} error={errors.lastName} />
            </>
          ) : (
            <InfoRow label="Họ tên" value={`${booking.customer.lastName} ${booking.customer.firstName}`.trim()} />
          )}
          {(!booking.customer.phone || errors.phone) ? (
            <Field label="Số điện thoại" value={booking.customer.phone} onChange={(v) => updateCustomer({ phone: v })} error={errors.phone} />
          ) : (
            <InfoRow label="Số điện thoại" value={booking.customer.phone} />
          )}
          <InfoRow label="Email" value={booking.customer.email || '—'} />
        </div>

        {pets.length > 0 ? (
          <PetPicker pets={pets} selectedPetId={booking.pet.petId} onSelect={(id) => applyPetSelection(id, pets)} />
        ) : (
          <p className="text-sm text-wood-bark/50">
            Chưa có thú cưng nào được lưu — vui lòng điền thông tin thú cưng ở phần bên dưới.
          </p>
        )}

        {phase === 'guest-confirm' && (
          <button onClick={handleNotMe} className="self-start text-sm font-semibold text-wood-bark/60 hover:text-red-500">
            Đây không phải tôi, nhập lại SĐT khác
          </button>
        )}
      </div>
    );
  }

  // ---- Luồng 3: khách hoàn toàn mới ----
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
      <h3 className="font-bold text-wood-bark flex items-center gap-2">👤 Thông tin khách hàng mới</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Tên" value={booking.customer.firstName} onChange={(v) => updateCustomer({ firstName: v })} error={errors.firstName} />
        <Field label="Họ" value={booking.customer.lastName} onChange={(v) => updateCustomer({ lastName: v })} error={errors.lastName} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Số điện thoại" value={booking.customer.phone} onChange={(v) => updateCustomer({ phone: v })} error={errors.phone} />
        <Field label="Địa chỉ Email" value={booking.customer.email} onChange={(v) => updateCustomer({ email: v })} />
      </div>
      <button onClick={() => setPhase('guest-entry')} className="self-start text-sm font-semibold text-wood-bark/60 hover:text-understory">
        ← Tôi thật ra đã từng đến, để mình tra lại SĐT
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-wood-bark/50">{label}</p>
      <p className="font-medium text-wood-bark">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, error, type = 'text' }) {
  return (
    <div>
      <label className="text-sm font-semibold text-wood-bark/80 mb-1.5 block">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-2xl px-4 py-3 text-sm outline-none bg-fresh-grown/20 focus:ring-2 focus:ring-understory/40 ${
          error ? 'ring-2 ring-red-300' : ''
        }`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}