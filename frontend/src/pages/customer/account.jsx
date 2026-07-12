import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import CusLayout from '@/components/layout/CusLayout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { fetchCustomerProfileById, fetchCustomerAddresses, updateCustomer } from '@/services/supabase/supabaseUsersApi';
import { toast } from 'sonner';
import { PencilLine, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '' });

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [profile, addressList] = await Promise.all([
          fetchCustomerProfileById(user.customer_id),
          fetchCustomerAddresses(user.customer_id),
        ]);
        setCustomer(profile);
        setAddresses(addressList);
        setForm({
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          phone: profile?.phone || '',
          email: profile?.email || '',
        });
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải thông tin tài khoản');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const fullName = useMemo(() => {
    if (!customer) return 'Khách hàng';
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Khách hàng';
  }, [customer]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!customer?.customer_id) return;

    try {
      const updated = await updateCustomer(customer.customer_id, {
        last_name: form.last_name,
        first_name: form.first_name,
        phone: form.phone,
        email: form.email,
        cus_ava: customer.cus_ava,
      });
      setCustomer(updated);
      // Sync updated profile to AuthContext so Header reflects changes immediately
      login({ ...user, ...updated });
      setEditing(false);
      toast.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật thất bại');
    }
  };

  return (
    <ProtectedRoute>
      <CusLayout activePath="/customer/account">
        <div className="min-h-screen bg-[#f7faf7] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col gap-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1B693C]">Tài khoản của bạn</p>
                  <h1 className="mt-1 text-3xl font-black text-[#362F22]">{fullName}</h1>
                  <p className="mt-2 text-sm text-gray-500">Quản lý thông tin cá nhân, địa chỉ và lịch sử đặt chỗ của bạn.</p>
                </div>
                <div className="rounded-2xl bg-[#EFF4BD] px-4 py-3 text-sm font-medium text-[#1B693C]">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} />
                    Tài khoản đã kích hoạt
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#362F22]">Thông tin cá nhân</h2>
                  <button
                    onClick={() => setEditing((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1B693C] px-4 py-2 text-sm font-semibold text-white"
                  >
                    <PencilLine size={16} />
                    {editing ? 'Huỷ' : 'Chỉnh sửa'}
                  </button>
                </div>

                {loading ? (
                  <div className="mt-6 animate-pulse space-y-3">
                    <div className="h-4 w-2/3 rounded bg-gray-100" />
                    <div className="h-4 w-full rounded bg-gray-100" />
                    <div className="h-4 w-4/5 rounded bg-gray-100" />
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">Họ</label>
                        <input
                          type="text"
                          value={form.last_name}
                          disabled={!editing}
                          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                          className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-600">Tên</label>
                        <input
                          type="text"
                          value={form.first_name}
                          disabled={!editing}
                          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                          className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none disabled:bg-gray-50"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Phone size={16} className="text-[#1B693C]" />
                        Số điện thoại
                      </div>
                      <input
                        type="text"
                        value={form.phone}
                        disabled={!editing}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none disabled:bg-gray-50"
                      />
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Mail size={16} className="text-[#1B693C]" />
                        Email
                      </div>
                      <input
                        type="email"
                        value={form.email}
                        disabled={!editing}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none disabled:bg-gray-50"
                      />
                    </div>

                    {editing && (
                      <div className="flex justify-end">
                        <button type="submit" className="rounded-full bg-[#1B693C] px-5 py-2.5 text-sm font-semibold text-white">
                          Lưu thay đổi
                        </button>
                      </div>
                    )}
                  </form>
                )}
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#362F22]">Địa chỉ giao hàng</h2>
                  <Link href="/customer/bookings" className="text-sm font-semibold text-[#1B693C]">
                    Xem lịch sử đặt chỗ
                  </Link>
                </div>

                <div className="mt-6 space-y-3">
                  {addresses.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                      Bạn chưa có địa chỉ nào.
                    </div>
                  ) : (
                    addresses.map((item) => (
                      <div key={item.address_id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#362F22]">
                          <MapPin size={16} className="text-[#1B693C]" />
                          {item.recipient_name || 'Người nhận'}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{item.street_address}</p>
                        <p className="text-sm text-gray-500">{[item.ward, item.district, item.province].filter(Boolean).join(', ')}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CusLayout>
    </ProtectedRoute>
  );
}
