import { useState, useEffect, useMemo } from 'react';
import { Loader2, Search, Calendar, Clock, User, Download } from 'lucide-react';
import { getCustomerById } from '../../services/supabase/customerService';
import { getBookingsByCustomer } from '../../services/supabase/customer/profile/bookingService';
import { formatVND } from '../../utils/format'; // Trỏ về utils/format.js dùng chung
import AccountLayout from '../../components/profile/ProfileSidebar'; // Dùng chung layout Sidebar

const TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'upcoming', label: 'Sắp tới' },
  { id: 'completed', label: 'Đã xong' },
  { id: 'cancelled', label: 'Đã hủy' },
];

function classifyBooking(booking) {
  if (booking.status === 'cancelled') return 'cancelled';
  const now = new Date();
  return booking.referenceDate >= now ? 'upcoming' : 'completed';
}

export default function BookingHistoryPage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [openCancelReasonId, setOpenCancelReasonId] = useState(null);

  // ĐỒNG BỘ LOCALSTORAGE
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
    if (!customer) return;
    setLoadingBookings(true);
    getBookingsByCustomer(customer.customer_id)
      .then(setBookings)
      .catch((e) => console.error(e))
      .finally(() => setLoadingBookings(false));
  }, [customer]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const status = classifyBooking(b);
      if (activeTab !== 'all' && status !== activeTab) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return b.title.toLowerCase().includes(q) || (b.petName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [bookings, activeTab, search]);

  return (
    <AccountLayout customer={customer} loading={loading} notLoggedIn={notLoggedIn}>
      {customer && (
        <>
          <div>
            <h1 className="text-3xl font-bold text-wood-bark">Lịch sử đặt lịch</h1>
            <p className="text-wood-bark/60 mt-1 max-w-2xl">
              Xem lại và quản lý các lịch hẹn Grooming/Spa và Pet Hotel của bạn.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="inline-flex bg-white rounded-full shadow-sm p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                    activeTab === tab.id ? 'bg-understory text-white' : 'text-wood-bark/60 hover:text-wood-bark'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-bark/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm đơn..."
                className="pl-9 pr-4 py-2.5 rounded-full bg-white shadow-sm text-sm outline-none focus:ring-2 focus:ring-understory/30 w-64"
              />
            </div>
          </div>

          {loadingBookings ? (
            <p className="text-sm text-wood-bark/50 flex items-center gap-2 py-10 justify-center">
              <Loader2 size={14} className="animate-spin" /> Đang tải lịch sử...
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-wood-bark/50 text-center py-10">Không có booking nào phù hợp.</p>
          ) : (
            <div className="flex flex-col gap-5 mt-4">
              {filtered.map((b) => {
                const status = classifyBooking(b);
                const isCancelReasonOpen = openCancelReasonId === b.booking_id;
                return (
                  <div key={b.booking_id} className="bg-white rounded-3xl shadow-sm p-6 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={status} />
                        <span className="text-xs text-wood-bark/40">#{b.booking_id}</span>
                      </div>
                      <h3 className="text-xl font-bold text-wood-bark">{b.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-wood-bark/60 mt-1">
                        {b.dateLabel && (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} /> {b.dateLabel}
                          </span>
                        )}
                        {b.timeLabel && (
                          <span className="flex items-center gap-1.5">
                            <Clock size={14} /> {b.timeLabel}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-6 bg-fresh-grown/15 rounded-2xl px-4 py-3 mt-4 text-sm">
                        {b.petName && (
                          <div>
                            <p className="text-[10px] uppercase text-wood-bark/40">Thú cưng</p>
                            <p className="font-semibold text-wood-bark">{b.petName}</p>
                          </div>
                        )}
                        {b.staffLabel && (
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-understory" />
                            <div>
                              <p className="text-[10px] uppercase text-wood-bark/40">Nhân viên</p>
                              <p className="font-semibold text-wood-bark">{b.staffLabel}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {status === 'cancelled' && isCancelReasonOpen && (
                        <p className="text-sm text-red-500 mt-3">
                          Lý do hủy: {b.cancel_reason || 'Không có ghi chú.'}
                        </p>
                      )}
                    </div>

                    <div className="lg:w-56 flex flex-col gap-2 shrink-0">
                      {status !== 'cancelled' && (
                        <>
                          <p className="text-xs text-wood-bark/40">Số tiền đã trả</p>
                          <p className="text-xl font-bold text-wood-bark">{formatVND(b.amountPaid)}</p>
                          {b.paymentMethod && (
                            <p className="text-xs text-wood-bark/50 flex items-center gap-1.5">
                              <Download size={12} /> {paymentMethodLabel(b.paymentMethod)}
                            </p>
                          )}
                        </>
                      )}

                      <a
                        href={b.booking_type === 'grooming' ? '/customer/booking/dich_vu_cham_soc' : '/customer/booking/dich_vu_luu_tru'}
                        className="rounded-full bg-understory text-white text-center py-2.5 text-sm font-bold hover:bg-wood-bark transition-colors mt-2"
                      >
                        {status === 'cancelled' ? 'Đặt lại' : 'Đặt lại'}
                      </a>

                      {status === 'cancelled' ? (
                        <button
                          onClick={() => setOpenCancelReasonId(isCancelReasonOpen ? null : b.booking_id)}
                          className="rounded-full border border-wood-bark/20 py-2.5 text-sm font-semibold text-wood-bark/70 hover:border-red-300 hover:text-red-500 transition-colors"
                        >
                          {isCancelReasonOpen ? 'Ẩn lý do hủy' : 'Xem lý do hủy'}
                        </button>
                      ) : (
                        <button className="rounded-full border border-wood-bark/20 py-2.5 text-sm font-semibold text-wood-bark/70 hover:border-understory hover:text-understory transition-colors">
                          Xem chi tiết
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </AccountLayout>
  );
}

function StatusBadge({ status }) {
  const styles = {
    upcoming: 'bg-blue-100 text-blue-600',
    completed: 'bg-fresh-grown/50 text-understory',
    cancelled: 'bg-red-100 text-red-500',
  };
  const labels = { upcoming: 'SẮP TỚI', completed: 'ĐÃ XONG', cancelled: 'ĐÃ HỦY' };
  return (
    <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function paymentMethodLabel(method) {
  if (method === 'bank_transfer') return 'Chuyển khoản';
  if (method === 'momo') return 'MoMo';
  if (method === 'vnpay') return 'VNPay';
  return method;
}