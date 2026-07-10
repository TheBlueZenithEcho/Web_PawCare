import { useState, useEffect } from 'react';
import { Loader2, MapPin, Plus, Clock, Pencil } from 'lucide-react';
// ĐÃ SỬA: Đổi getCurrentCustomer thành getCustomerById
import { getCustomerById, updateCustomerProfile, getMostRecentBooking } from '../../services/supabase/customerService';
import { getAddresses, addAddress, setDefaultAddress, deleteAddress } from '../../services/supabase/customer/profile/addressService';
import AccountLayout from '../../components/profile/ProfileSidebar';
import { supabase } from '../../services/supabase/client'; 

export default function MyProfilePage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    // 1. Đọc user từ localStorage giống hệt cách Header đang làm
    const savedUserStr = localStorage.getItem('customer_user');
    
    if (!savedUserStr) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    try {
      const savedUser = JSON.parse(savedUserStr);
      
      // 2. Lấy dữ liệu profile mới nhất từ Database bằng customer_id
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
      console.error("Lỗi parse dữ liệu user", error);
      setNotLoggedIn(true);
      setLoading(false);
    }
  }, []);

  return (
    <AccountLayout customer={customer} loading={loading} notLoggedIn={notLoggedIn}>
      <div>
        <h1 className="text-3xl font-bold text-wood-bark">My Profile</h1>
        <p className="text-wood-bark/60 mt-1">Quản lý thông tin cá nhân và địa chỉ nhận hàng.</p>
      </div>

      {customer && (
        <>
          <ProfileInfoCard customer={customer} onUpdated={setCustomer} />
          <AddressesCard customer={customer} />
          <SecurityCard customer={customer} />
          <RecentActivityCard customer={customer} />
        </>
      )}
    </AccountLayout>
  );
}

function ProfileInfoCard({ customer, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: customer.first_name, lastName: customer.last_name, phone: customer.phone, email: customer.email || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await updateCustomerProfile(customer.customer_id, form);
      onUpdated((prev) => ({ ...prev, ...updated }));
      
      // Cập nhật lại localStorage để thanh Header cũng đổi tên theo ngay lập tức
      const savedUser = JSON.parse(localStorage.getItem('customer_user') || '{}');
      localStorage.setItem('customer_user', JSON.stringify({ ...savedUser, ...updated }));
      
      setEditing(false);
    } catch (e) {
      console.error(e);
      setError('Không lưu được thông tin. Thử lại sau.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-wood-bark">Thông tin cá nhân</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-semibold text-understory hover:text-wood-bark">
            <Pencil size={14} /> Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <LabeledInput label="First Name" value={form.firstName} onChange={(v) => setForm((f) => ({ ...f, firstName: v }))} />
            <LabeledInput label="Last Name" value={form.lastName} onChange={(v) => setForm((f) => ({ ...f, lastName: v }))} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <LabeledInput label="Phone" value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
            <LabeledInput label="Email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="rounded-full bg-understory text-white px-6 py-2.5 text-sm font-bold hover:bg-wood-bark disabled:opacity-40 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />} Lưu thay đổi
            </button>
            <button onClick={() => setEditing(false)} className="rounded-full border border-wood-bark/20 px-6 py-2.5 text-sm font-semibold text-wood-bark/70">
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <InfoRow label="Họ và tên" value={`${customer.first_name} ${customer.last_name}`} />
          <InfoRow label="Email" value={customer.email || '—'} />
          <InfoRow label="Số điện thoại" value={customer.phone} />
          <InfoRow label="Thành viên từ" value={new Date(customer.created_at).toLocaleDateString('vi-VN')} />
        </div>
      )}
    </div>
  );
}

function AddressesCard({ customer }) {
  const [addresses, setAddresses] = useState(customer.customer_address || []);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ recipientName: '', recipientPhone: '', streetAddress: '', ward: '', district: '', province: '', isDefault: false });
  const [saving, setSaving] = useState(false);

  const refresh = async () => setAddresses(await getAddresses(customer.customer_id));

  const handleAdd = async () => {
    setSaving(true);
    try {
      await addAddress({ customerId: customer.customer_id, ...form });
      await refresh();
      setShowForm(false);
      setForm({ recipientName: '', recipientPhone: '', streetAddress: '', ward: '', district: '', province: '', isDefault: false });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-wood-bark flex items-center gap-2">
          <MapPin size={16} /> Địa chỉ giao hàng
        </h3>
        <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1.5 text-sm font-semibold text-understory hover:text-wood-bark">
          <Plus size={14} /> Thêm địa chỉ
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {addresses.length === 0 && !showForm && <p className="text-sm text-wood-bark/50">Chưa có địa chỉ nào được lưu.</p>}
        {addresses.map((addr) => (
          <div key={addr.address_id} className="flex items-start justify-between bg-fresh-grown/15 rounded-2xl px-4 py-3">
            <div className="text-sm">
              <p className="font-semibold text-wood-bark flex items-center gap-2">
                {addr.recipient_name}
                {addr.is_default && <span className="text-[10px] bg-understory text-white px-2 py-0.5 rounded-full">Mặc định</span>}
              </p>
              <p className="text-wood-bark/60">{addr.recipient_phone}</p>
              <p className="text-wood-bark/60">{[addr.street_address, addr.ward, addr.district, addr.province].filter(Boolean).join(', ')}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {!addr.is_default && (
                <button onClick={() => setDefaultAddress(customer.customer_id, addr.address_id).then(refresh)} className="text-xs font-semibold text-understory">
                  Đặt mặc định
                </button>
              )}
              <button onClick={() => deleteAddress(addr.address_id).then(refresh)} className="text-xs font-semibold text-red-500">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="mt-4 border-t border-wood-bark/10 pt-4 flex flex-col gap-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <LabeledInput label="Tên người nhận" value={form.recipientName} onChange={(v) => setForm((f) => ({ ...f, recipientName: v }))} />
            <LabeledInput label="SĐT người nhận" value={form.recipientPhone} onChange={(v) => setForm((f) => ({ ...f, recipientPhone: v }))} />
          </div>
          <LabeledInput label="Địa chỉ chi tiết" value={form.streetAddress} onChange={(v) => setForm((f) => ({ ...f, streetAddress: v }))} placeholder="Số nhà, tên đường" />
          <div className="grid sm:grid-cols-3 gap-3">
            <LabeledInput label="Phường/Xã" value={form.ward} onChange={(v) => setForm((f) => ({ ...f, ward: v }))} />
            <LabeledInput label="Quận/Huyện" value={form.district} onChange={(v) => setForm((f) => ({ ...f, district: v }))} />
            <LabeledInput label="Tỉnh/Thành" value={form.province} onChange={(v) => setForm((f) => ({ ...f, province: v }))} />
          </div>
          <label className="flex items-center gap-2 text-sm text-wood-bark/70">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
            Đặt làm địa chỉ mặc định
          </label>
          <div className="flex gap-3">
            <button onClick={handleAdd} disabled={saving} className="rounded-full bg-understory text-white px-6 py-2.5 text-sm font-bold hover:bg-wood-bark disabled:opacity-40">
              Lưu địa chỉ
            </button>
            <button onClick={() => setShowForm(false)} className="rounded-full border border-wood-bark/20 px-6 py-2.5 text-sm font-semibold text-wood-bark/70">
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SecurityCard({ customer }) {
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('idle'); 

  const handleChangePassword = async () => {
    if (newPassword.length < 6) return;
    setStatus('saving');
    try {
      const { error } = await supabase
        .from('customer')
        .update({ password_hash: newPassword })
        .eq('customer_id', customer.customer_id);

      if (error) throw error;
      
      setStatus('done');
      setNewPassword('');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h3 className="font-bold text-wood-bark mb-4">Bảo mật</h3>
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Mật khẩu mới (≥ 6 ký tự)"
          className="flex-1 rounded-2xl bg-fresh-grown/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-understory/40"
        />
        <button onClick={handleChangePassword} disabled={status === 'saving'} className="rounded-full bg-understory text-white px-6 py-3 text-sm font-bold hover:bg-wood-bark disabled:opacity-40 whitespace-nowrap">
          Đổi mật khẩu
        </button>
      </div>
      {status === 'done' && <p className="text-xs text-understory mt-2">✓ Đổi mật khẩu thành công.</p>}
      {status === 'error' && <p className="text-xs text-red-500 mt-2">Có lỗi xảy ra, thử lại sau.</p>}
    </div>
  );
}

function RecentActivityCard({ customer }) {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMostRecentBooking(customer.customer_id)
      .then(setBooking)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [customer.customer_id]);

  return (
    <div className="bg-fresh-grown/20 rounded-3xl p-6 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-understory">
          <Clock size={18} />
        </div>
        <div>
          <p className="font-bold text-wood-bark">Hoạt động gần đây</p>
          {loading ? (
            <p className="text-sm text-wood-bark/50">Đang tải...</p>
          ) : booking ? (
            <p className="text-sm text-wood-bark/60">
              Đặt lịch gần nhất: <strong>{booking.pet?.pet_name}</strong> — {new Date(booking.created_at).toLocaleDateString('vi-VN')}
            </p>
          ) : (
            <p className="text-sm text-wood-bark/60">Chưa có lịch sử đặt dịch vụ nào.</p>
          )}
        </div>
      </div>
      <a href="/customer/profile/tai-khoan/lich-su-dat" className="rounded-full bg-understory text-white px-5 py-2.5 text-sm font-bold hover:bg-wood-bark transition-colors">
        Xem lịch sử đầy đủ
      </a>
    </div>
  );
}

function LabeledInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-wood-bark/60 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl bg-fresh-grown/20 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-understory/40"
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-wood-bark/40 uppercase tracking-wide">{label}</p>
      <p className="font-medium text-wood-bark">{value}</p>
    </div>
  );
}