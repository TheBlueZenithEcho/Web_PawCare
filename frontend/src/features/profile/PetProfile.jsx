import { useState, useEffect, useCallback } from 'react';
import { Loader2, Search, Plus, Calendar, Cake, X } from 'lucide-react';
import { getCustomerById } from '../../services/supabase/customerService';
// ĐÃ SỬA IMPORT
import { getPetsByCustomer, getUpcomingCareForPet, createPet } from '../../services/supabase/customer/profile/petService';
import { calculateAge } from '../../utils/hotelRules';
import AccountLayout from '../../components/profile/ProfileSidebar';

const SPECIES_OPTIONS = [
  { id: '', label: 'All Species' },
  { id: 'dog', label: 'Dog' },
  { id: 'cat', label: 'Cat' },
];

export default function MyPetsPage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const [pets, setPets] = useState([]);
  const [upcomingByPet, setUpcomingByPet] = useState({});
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [loadingPets, setLoadingPets] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

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

  const loadPets = useCallback(async () => {
    if (!customer) return;
    setLoadingPets(true);
    try {
      const list = await getPetsByCustomer(customer.customer_id, { search, species: species || undefined });
      setPets(list);
      const entries = await Promise.all(
        list.map((p) => getUpcomingCareForPet(p.pet_id).then((u) => [p.pet_id, u]))
      );
      setUpcomingByPet(Object.fromEntries(entries));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPets(false);
    }
  }, [customer, search, species]);

  useEffect(() => {
    if (customer) loadPets();
  }, [loadPets, customer]);

  return (
    <AccountLayout customer={customer} loading={loading} notLoggedIn={notLoggedIn}>
      {customer && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-wood-bark">My Pets</h1>
              <p className="text-wood-bark/60 mt-1">Manage your beloved family members and their care schedule.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-bark/40" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="pl-9 pr-4 py-2.5 rounded-full bg-white shadow-sm text-sm outline-none focus:ring-2 focus:ring-understory/30"
                />
              </div>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="rounded-full bg-white shadow-sm px-4 py-2.5 text-sm font-medium outline-none"
              >
                {SPECIES_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 rounded-full bg-understory text-white px-5 py-2.5 text-sm font-bold hover:bg-wood-bark transition-colors whitespace-nowrap"
              >
                <Plus size={15} /> Add Pet
              </button>
            </div>
          </div>

          {loadingPets ? (
            <p className="text-sm text-wood-bark/50 flex items-center gap-2 py-10 justify-center">
              <Loader2 size={14} className="animate-spin" /> Đang tải...
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 mt-6">
              {pets.map((pet) => (
                <PetCard key={pet.pet_id} pet={pet} upcoming={upcomingByPet[pet.pet_id]} />
              ))}

              <button
                onClick={() => setShowAddForm(true)}
                className="border-2 border-dashed border-wood-bark/20 rounded-3xl flex flex-col items-center justify-center gap-3 py-12 text-wood-bark/50 hover:border-understory hover:text-understory transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-fresh-grown/30 flex items-center justify-center">
                  <Plus size={18} />
                </span>
                Grow the Family?
              </button>
            </div>
          )}

          {showAddForm && (
            <AddPetModal
              customerId={customer.customer_id}
              onClose={() => setShowAddForm(false)}
              onCreated={() => {
                setShowAddForm(false);
                loadPets();
              }}
            />
          )}
        </>
      )}
    </AccountLayout>
  );
}

function PetCard({ pet, upcoming }) {
  const age = calculateAge(pet.dob);
  return (
    <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-wood-bark">{pet.pet_name}</h3>
          <p className="text-sm text-wood-bark/50">
            {pet.species === 'dog' ? 'Dog' : 'Cat'}{pet.breed ? ` • ${pet.breed}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm border-y border-wood-bark/10 py-3">
        <MiniStat label="Gender" value={pet.gender ? (pet.gender === 'male' ? 'Male' : 'Female') : '—'} />
        <MiniStat label="Age" value={age != null ? `${age} Years` : '—'} />
        <MiniStat label="Weight" value={pet.weight ? `${pet.weight} kg` : '—'} />
      </div>

      <div className="flex flex-col gap-2 text-sm text-wood-bark/70">
        {upcoming && (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-understory" />
            Upcoming: <strong>{upcoming.label}</strong> — {formatUpcomingDate(upcoming.date)}
          </div>
        )}
        {pet.dob && (
          <div className="flex items-center gap-2">
            <Cake size={14} className="text-understory" />
            Birthday: {new Date(pet.dob).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>

      <a
        href={`/customer/profile/thu_cung/${pet.pet_id}`}
        className="self-start rounded-full border border-wood-bark/20 px-5 py-2 text-sm font-semibold text-wood-bark hover:border-understory hover:text-understory transition-colors text-center"
      >
        View Details
      </a>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-wood-bark/40 tracking-wide">{label}</p>
      <p className="font-semibold text-wood-bark">{value}</p>
    </div>
  );
}

function formatUpcomingDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' });
}

function AddPetModal({ customerId, onClose, onCreated }) {
  const [form, setForm] = useState({ pet_name: '', species: 'dog', size: 'M', breed: '', weight: '', dob: '', gender: 'male' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async () => {
    if (!form.pet_name.trim()) {
      setError('Vui lòng nhập tên thú cưng');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createPet({
        customer_id: customerId,
        pet_name: form.pet_name,
        species: form.species,
        size: form.size,
        breed: form.breed || null,
        weight: form.weight || null,
        dob: form.dob || null,
        gender: form.gender,
      });
      onCreated();
    } catch (e) {
      console.error(e);
      setError('Không tạo được hồ sơ thú cưng. Thử lại sau.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] px-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-wood-bark">Register a New Pet</h3>
          <button onClick={onClose} className="text-wood-bark/40 hover:text-wood-bark">
            <X size={18} />
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <LabeledInput label="Pet Name" value={form.pet_name} onChange={(v) => update({ pet_name: v })} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-wood-bark/60 block mb-1">Species</label>
            <select value={form.species} onChange={(e) => update({ species: e.target.value })} className="w-full rounded-xl bg-fresh-grown/20 px-3 py-2.5 text-sm outline-none">
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-wood-bark/60 block mb-1">Size</label>
            <select value={form.size} onChange={(e) => update({ size: e.target.value })} className="w-full rounded-xl bg-fresh-grown/20 px-3 py-2.5 text-sm outline-none">
              {['S', 'M', 'L', 'XL'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <LabeledInput label="Breed" value={form.breed} onChange={(v) => update({ breed: v })} />
          <LabeledInput label="Weight (kg)" type="number" value={form.weight} onChange={(v) => update({ weight: v })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <LabeledInput label="Ngày sinh" type="date" value={form.dob} onChange={(v) => update({ dob: v })} />
          <div>
            <label className="text-xs font-semibold text-wood-bark/60 block mb-1">Gender</label>
            <select value={form.gender} onChange={(e) => update({ gender: e.target.value })} className="w-full rounded-xl bg-fresh-grown/20 px-3 py-2.5 text-sm outline-none">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-full bg-understory text-white py-3 text-sm font-bold hover:bg-wood-bark disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 size={14} className="animate-spin" />} Lưu thú cưng
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