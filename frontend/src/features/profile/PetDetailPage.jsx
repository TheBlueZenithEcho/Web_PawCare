import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader2, Pencil, Heart, ShieldCheck, Calendar, BedDouble, X } from 'lucide-react';
import { getCustomerById } from '../../services/supabase/customerService';
// ĐÃ SỬA IMPORT
import { getPetById, getPetHealthRecords, getPetGroomingBookings, getPetHotelBookings, updatePet } from '../../services/supabase/customer/profile/petService';
import { calculateAge } from '../../utils/hotelRules';
import { formatVND } from '../../utils/format';
import AccountLayout from '../../components/profile/ProfileSidebar';

const TABS = ['Tổng quan', 'Sức khỏe', 'Lịch hẹn', 'Lưu trú'];

export default function PetDetailPage() {
  const router = useRouter();
  const { petId } = router.query;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const [pet, setPet] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [groomingBookings, setGroomingBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loadingPet, setLoadingPet] = useState(true);
  const [activeTab, setActiveTab] = useState('Tổng quan');
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('customer_user');
    if (!savedUserStr) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }
    try {
      const savedUser = JSON.parse(savedUserStr);
      getCustomerById(savedUser.customer_id)
        .then((c) => {
          if (!c) {
            setNotLoggedIn(true);
            localStorage.removeItem('customer_user');
          } else {
            setCustomer(c);
          }
        })
        .catch((e) => {
          console.error(e);
          setNotLoggedIn(true);
        })
        .finally(() => setLoading(false));
    } catch (error) {
      setNotLoggedIn(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!petId) return;
    setLoadingPet(true);
    Promise.all([
      getPetById(petId),
      getPetHealthRecords(petId),
      getPetGroomingBookings(petId),
      getPetHotelBookings(petId),
    ])
      .then(([p, health, grooming, hotel]) => {
        setPet(p);
        setHealthRecords(health);
        setGroomingBookings(grooming);
        setHotelBookings(hotel);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingPet(false));
  }, [petId]);

  return (
    <AccountLayout customer={customer} loading={loading} notLoggedIn={notLoggedIn}>
      {customer && (
        <>
          {loadingPet || !pet ? (
            <p className="text-sm text-wood-bark/50 flex items-center gap-2 py-20 justify-center">
              <Loader2 size={14} className="animate-spin" /> Đang tải hồ sơ thú cưng...
            </p>
          ) : (
            <>
              <PetHeaderCard pet={pet} onEdit={() => setShowEdit(true)} />

              <div className="flex gap-2 border-b border-wood-bark/10 overflow-x-auto mt-6">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab ? 'border-understory text-understory' : 'border-transparent text-wood-bark/50 hover:text-wood-bark'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeTab === 'Tổng quan' && (
                  <OverviewTab pet={pet} healthRecords={healthRecords} groomingBookings={groomingBookings} hotelBookings={hotelBookings} />
                )}
                {activeTab === 'Sức khỏe' && <HealthRecordTab records={healthRecords} />}
                {activeTab === 'Lịch hẹn' && <AppointmentsTab bookings={groomingBookings} />}
                {activeTab === 'Lưu trú' && <HotelStaysTab bookings={hotelBookings} />}
              </div>

              {showEdit && (
                <EditPetModal
                  pet={pet}
                  onClose={() => setShowEdit(false)}
                  onSaved={(updated) => {
                    setPet(updated);
                    setShowEdit(false);
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </AccountLayout>
  );
}

function PetHeaderCard({ pet, onEdit }) {
  const age = calculateAge(pet.dob);
  return (
    <div className="grid sm:grid-cols-[280px_1fr] gap-6">
      <div className="relative rounded-3xl overflow-hidden h-64 bg-fresh-grown/30 flex items-end p-5">
        {pet.pet_ava && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pet.pet_ava} alt={pet.pet_name} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <h1 className="relative text-white text-3xl font-bold drop-shadow">{pet.pet_name}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-wood-bark">Chi tiết thú cưng</h3>
          <button onClick={onEdit} className="flex items-center gap-1.5 text-sm font-semibold text-understory hover:text-wood-bark">
            <Pencil size={14} /> Sửa hồ sơ
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <DetailRow label="Loài" value={pet.species === 'dog' ? 'Chó' : 'Mèo'} />
          <DetailRow label="Giống loài" value={pet.breed || '—'} />
          <DetailRow label="Tuổi" value={age != null ? `${age} Tuổi` : '—'} />
          <DetailRow label="Cân nặng" value={pet.weight ? `${pet.weight} kg` : '—'} />
          <DetailRow label="Ngày sinh" value={pet.dob ? new Date(pet.dob).toLocaleDateString('vi-VN') : '—'} />
          <DetailRow label="Chủ sở hữu" value={pet.customer ? `${pet.customer.first_name} ${pet.customer.last_name}` : '—'} />
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ pet, healthRecords, groomingBookings, hotelBookings }) {
  const upcomingGrooming = groomingBookings
    .flatMap((b) => (b.booking_service || []).map((bs) => ({ ...bs, status: b.status })))
    .filter((bs) => bs.status === 'confirmed' && new Date(bs.slot_start) >= new Date())
    .sort((a, b) => new Date(a.slot_start) - new Date(b.slot_start));

  const pastHotelStays = hotelBookings
    .flatMap((b) => (b.booking_room || []).map((br) => br))
    .filter((br) => new Date(br.check_out_date) < new Date())
    .sort((a, b) => new Date(b.check_out_date) - new Date(a.check_out_date));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <InfoCard icon={Heart} title="Tính cách">
          {pet.behavior_notes ? (
            <p className="text-sm text-wood-bark/70 italic">&ldquo;{pet.behavior_notes}&rdquo;</p>
          ) : (
            <p className="text-sm text-wood-bark/40">Chưa có ghi chú tính cách.</p>
          )}
        </InfoCard>

        <InfoCard icon={ShieldCheck} title="Thông tin sức khỏe">
          {pet.allergy_notes ? (
            <p className="text-sm">
              <span className="font-semibold text-red-500">Dị ứng: </span>
              <span className="text-wood-bark/70">{pet.allergy_notes}</span>
            </p>
          ) : (
            <p className="text-sm text-wood-bark/40">Chưa ghi nhận dị ứng nào.</p>
          )}
        </InfoCard>
      </div>

      <InfoCard icon={Calendar} title="Lịch sử cân nặng">
        {healthRecords.filter((r) => r.weight).length > 0 ? (
          <WeightChart records={healthRecords.filter((r) => r.weight)} />
        ) : (
          <p className="text-sm text-wood-bark/40">Chưa có dữ liệu cân nặng từ pet_health_record.</p>
        )}
      </InfoCard>

      <div>
        <h3 className="font-bold text-wood-bark mb-3">Lịch trình chăm sóc</h3>
        {upcomingGrooming.length === 0 ? (
          <p className="text-sm text-wood-bark/40">Chưa có lịch hẹn sắp tới.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingGrooming.map((bs, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-wood-bark">{bs.service?.service_name}</p>
                  <p className="text-sm text-wood-bark/50">
                    {new Date(bs.slot_start).toLocaleString('vi-VN')}
                    {bs.groomer ? ` · ${bs.groomer.first_name} ${bs.groomer.last_name}` : ''}
                  </p>
                </div>
                <span className="text-xs font-bold bg-fresh-grown/50 text-understory px-3 py-1 rounded-full">Đã xác nhận</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-bold text-wood-bark mb-3">Lịch sử lưu trú</h3>
        {pastHotelStays.length === 0 ? (
          <p className="text-sm text-wood-bark/40">Chưa có lịch sử lưu trú.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pastHotelStays.map((br, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BedDouble size={18} className="text-understory" />
                  <div>
                    <p className="font-semibold text-wood-bark">Phòng {br.room?.room_id}</p>
                    <p className="text-sm text-wood-bark/50">
                      {new Date(br.check_in_date).toLocaleDateString('vi-VN')} → {new Date(br.check_out_date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HealthRecordTab({ records }) {
  if (records.length === 0) return <EmptyState text="Chưa có bản ghi sức khỏe (pet_health_record) nào." />;
  return (
    <div className="flex flex-col gap-3">
      {records.map((r) => (
        <div key={r.record_id} className="bg-white rounded-2xl shadow-sm px-5 py-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-wood-bark">{new Date(r.recorded_at).toLocaleDateString('vi-VN')}</p>
            {r.weight && <span className="text-sm font-bold text-understory">{r.weight} kg</span>}
          </div>
          <div className="text-sm text-wood-bark/60 flex flex-wrap gap-4">
            {r.body_temperature && <span>Nhiệt độ: {r.body_temperature}°C</span>}
            {r.appetite && <span>Ăn uống: {r.appetite}</span>}
          </div>
          {r.note && <p className="text-sm text-wood-bark/50 mt-1">{r.note}</p>}
        </div>
      ))}
    </div>
  );
}

function AppointmentsTab({ bookings }) {
  const rows = bookings.flatMap((b) => (b.booking_service || []).map((bs) => ({ ...bs, status: b.status, total_bill: b.total_bill })));
  if (rows.length === 0) return <EmptyState text="Chưa có lịch hẹn Grooming nào." />;
  return (
    <div className="flex flex-col gap-3">
      {rows.map((bs, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-wood-bark">{bs.service?.service_name}</p>
            <p className="text-sm text-wood-bark/50">
              {new Date(bs.slot_start).toLocaleString('vi-VN')}
              {bs.groomer ? ` · ${bs.groomer.first_name} ${bs.groomer.last_name}` : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-wood-bark">{formatVND(bs.total_bill)}</p>
            <p className="text-xs text-wood-bark/40 uppercase">{bs.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HotelStaysTab({ bookings }) {
  const rows = bookings.flatMap((b) => (b.booking_room || []).map((br) => ({ ...br, status: b.status, total_bill: b.total_bill })));
  if (rows.length === 0) return <EmptyState text="Chưa có lịch sử lưu trú Pet Hotel nào." />;
  return (
    <div className="flex flex-col gap-3">
      {rows.map((br, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-sm px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BedDouble size={18} className="text-understory" />
            <div>
              <p className="font-semibold text-wood-bark">Phòng {br.room?.room_id}</p>
              <p className="text-sm text-wood-bark/50">
                {new Date(br.check_in_date).toLocaleDateString('vi-VN')} → {new Date(br.check_out_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-wood-bark">{formatVND(br.total_bill)}</p>
            <p className="text-xs text-wood-bark/40 uppercase">{br.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function WeightChart({ records }) {
  const max = Math.max(...records.map((r) => r.weight));
  return (
    <div className="flex items-end gap-3 h-32">
      {records.slice(-8).map((r) => (
        <div key={r.record_id} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-understory rounded-t-md"
            style={{ height: `${Math.max((r.weight / max) * 100, 8)}%` }}
            title={`${r.weight}kg`}
          />
          <span className="text-[10px] text-wood-bark/40">{new Date(r.recorded_at).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })}</span>
        </div>
      ))}
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h3 className="font-bold text-wood-bark flex items-center gap-2 mb-3">
        <Icon size={16} className="text-understory" /> {title}
      </h3>
      {children}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-wood-bark/40 tracking-wide">{label}</p>
      <p className="font-semibold text-wood-bark">{value}</p>
    </div>
  );
}

function EmptyState({ text }) {
  return <p className="text-sm text-wood-bark/40 text-center py-10">{text}</p>;
}

function EditPetModal({ pet, onClose, onSaved }) {
  const [form, setForm] = useState({
    breed: pet.breed || '',
    weight: pet.weight || '',
    dob: pet.dob || '',
    behavior_notes: pet.behavior_notes || '',
    allergy_notes: pet.allergy_notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updatePet(pet.pet_id, form);
      onSaved({ ...pet, ...updated });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-wood-bark">Sửa thông tin {pet.pet_name}</h3>
          <button onClick={onClose} className="text-wood-bark/40 hover:text-wood-bark">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <LabeledInput label="Giống loài" value={form.breed} onChange={(v) => setForm((f) => ({ ...f, breed: v }))} />
          <LabeledInput label="Cân nặng (kg)" type="number" value={form.weight} onChange={(v) => setForm((f) => ({ ...f, weight: v }))} />
        </div>
        <LabeledInput label="Ngày sinh" type="date" value={form.dob} onChange={(v) => setForm((f) => ({ ...f, dob: v }))} />
        <div>
          <label className="text-xs font-semibold text-wood-bark/60 block mb-1">Tính cách (ghi chú hành vi)</label>
          <textarea
            rows={2}
            value={form.behavior_notes}
            onChange={(e) => setForm((f) => ({ ...f, behavior_notes: e.target.value }))}
            className="w-full rounded-xl bg-fresh-grown/20 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-understory/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-wood-bark/60 block mb-1">Dị ứng</label>
          <textarea
            rows={2}
            value={form.allergy_notes}
            onChange={(e) => setForm((f) => ({ ...f, allergy_notes: e.target.value }))}
            className="w-full rounded-xl bg-fresh-grown/20 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-understory/40"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full bg-understory text-white py-3 text-sm font-bold hover:bg-wood-bark disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />} Lưu thay đổi
        </button>
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="text-xs font-semibold text-wood-bark/60 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-fresh-grown/20 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-understory/40"
      />
    </div>
  );
}