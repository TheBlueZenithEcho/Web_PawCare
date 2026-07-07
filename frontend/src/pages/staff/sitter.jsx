import { useState, useEffect } from 'react';
import Head from 'next/head';
import StaffLayout from '@/components/layout/StaffLayout';
import SitterDiaryModal from '@/components/staff/SitterDiaryModal';
import ExtendStayModal from '@/components/staff/ExtendStayModal';
import AddServiceModal from '@/components/staff/AddServiceModal';
import EmergencyModal from '@/components/staff/EmergencyModal';
import { fetchBookings, addDiaryEntry } from '@/services/mock/mockApi';
import { AlarmClock, AlertTriangle, Pin, CalendarDays, Plus, CalendarPlus, LogOut, BellRing, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function SitterPage() {
  const [hotelBookings, setHotelBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [modalType, setModalType] = useState(null); // 'DIARY' | 'EXTEND' | 'ADD_SERVICE'

  // Tabs & Stats
  const [activeTab, setActiveTab] = useState('PROCESSING'); // PROCESSING, CHECKOUT
  const [statsData, setStatsData] = useState({ active: 0, pending: 0, checkout: 0 });

  const isTodayOrTomorrow = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
      date.toDateString() === today.toDateString() ||
      date.toDateString() === tomorrow.toDateString()
    );
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBookings({});
      // Lấy TẤT CẢ các đơn Hotel
      const allHotelData = data.filter(b => b.service_category === 'Hotel');

      // Tính toán stats
      const active = allHotelData.filter(b => b.status === 'PROCESSING');
      const pending = allHotelData.filter(b => b.status === 'PENDING');
      const checkout = active.filter(b => isTodayOrTomorrow(b.checkout_date));
      const activeOnly = active.filter(b => !isTodayOrTomorrow(b.checkout_date));

      setStatsData({
        active: activeOnly.length,
        pending: pending.length,
        checkout: checkout.length,
      });

      setHotelBookings(allHotelData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveDiary = async (booking_id, diaryData) => {
    await addDiaryEntry(booking_id, diaryData);
    await loadData();
    setModalType(null);
    toast.success('Ghi nhận nhật ký thành công!');
  };

  const handleExtendStay = async (data) => {
    // Giả lập update

    toast.success('Gia hạn lưu trú thành công!');
    setModalType(null);
    await loadData();
  };

  const handleAddService = async (services) => {
    // Giả lập update

    toast.success('Đã thêm dịch vụ Grooming vào hóa đơn!');
    setModalType(null);
  };

  const handleEmergencyReport = async (formData) => {

    toast.success('Đã gửi báo cáo sự cố thành công! Hệ thống đã gửi cảnh báo cho Admin.');
    setModalType(null);
  };

  const handleNotifyN8n = async (booking) => {
    // Giả lập call Webhook N8N
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Đang gửi tín hiệu qua Webhook...',
        success: `Đã tự động gửi Email & Zalo nhắc nhở checkout cho khách hàng của ${booking.pet_name}!`,
        error: 'Có lỗi xảy ra',
      }
    );
  };

  const stats = [
    { id: 'PROCESSING', label: 'Đang lưu trú', count: statsData.active, bg: 'bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors', color: 'text-blue-600' },
    { id: 'PENDING', label: 'Chờ check-in', count: statsData.pending, bg: 'bg-xantho/10 hover:bg-xantho/20 cursor-pointer transition-colors', color: 'text-orange-500' },
    { id: 'CHECKOUT', label: 'Chờ check-out', count: statsData.checkout, bg: 'bg-chloro/5 hover:bg-chloro/10 cursor-pointer transition-colors', color: 'text-chloro' },
  ];

  const filteredBookings = hotelBookings.filter(b => {
    let matchTab = true;
    if (activeTab === 'PROCESSING') matchTab = b.status === 'PROCESSING' && !isTodayOrTomorrow(b.checkout_date);
    if (activeTab === 'CHECKOUT') matchTab = b.status === 'PROCESSING' && isTodayOrTomorrow(b.checkout_date);

    if (!matchTab) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        (b.pet_name && b.pet_name.toLowerCase().includes(term)) ||
        (b.booking_id && b.booking_id.toLowerCase().includes(term)) ||
        (b.customer_phone && b.customer_phone.includes(term))
      );
    }
    return true;
  });

  return (
    <StaffLayout>
      <Head>
        <title>PawCare - Pet Sitter</title>
      </Head>
      <div className="p-4 md:p-6 w-full space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-understory mb-1 flex items-center gap-2">
            <CalendarDays size={28} className="text-lacustral" /> Quản lý lưu trú
          </h1>
          <p className="text-lacustral text-sm">Nhật ký cần cập nhật trước 20:00 mỗi ngày</p>
        </div>

        {/* Filters & Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Filters & Tabs */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end px-6 pt-4 border-b border-gray-100 gap-4">
            {/* Tab Navigation */}
            <div className="flex gap-3 lg:gap-4 overflow-x-auto no-scrollbar w-full lg:w-auto order-2 lg:order-1 -mb-[1px]">
              <button
                onClick={() => setActiveTab('PROCESSING')}
                className={`pb-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'PROCESSING'
                    ? 'border-chloro text-chloro'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
              >
                Đang lưu trú
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'PROCESSING' ? 'bg-chloro text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {statsData.active}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('CHECKOUT')}
                className={`pb-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'CHECKOUT'
                    ? 'border-chloro text-chloro'
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
              >
                Chờ Check-out
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'CHECKOUT' ? 'bg-chloro text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {statsData.checkout}
                </span>
              </button>
            </div>

            {/* Top Bar: Search */}
            <div className="flex flex-row items-center w-full lg:w-auto pb-0 lg:pb-2.5 order-1 lg:order-2 flex-nowrap shrink-0">
              <div className="relative flex-1 lg:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:border-chloro focus:ring-1 focus:ring-chloro outline-none text-sm w-full lg:w-32 xl:w-48"
                />
              </div>
            </div>
          </div>
        </div>

        {/* List of Pets */}
        <div>
          {isLoading ? (
            <p className="text-lacustral text-center p-8">Đang tải dữ liệu...</p>
          ) : filteredBookings.length === 0 ? (
            <p className="text-lacustral text-center p-8 bg-white rounded-xl border border-gray-200">Không có thú cưng nào trong mục này.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBookings.map(booking => {
                const latestDiary = booking.diaries && booking.diaries.length > 0
                  ? booking.diaries[booking.diaries.length - 1]
                  : null;

                return (
                  <div
                    key={booking.booking_id}
                    className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-chloro/30 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Header: ID & Status */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{booking.booking_id}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap flex items-center gap-1">
                            <AlarmClock size={10} /> Đang lưu trú
                          </span>
                          {booking.has_incident && (
                            <span className="bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <AlertTriangle size={10} /> Sự cố
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Pet & Owner Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl border border-gray-100 shrink-0">
                          {booking.pet_type === 'Mèo' ? '🐈' : '🐕'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-gray-900 truncate">{booking.pet_name}</h3>
                          <div className="flex flex-col gap-0.5">
                            <div className="text-xs text-gray-500 truncate">
                              {booking.customer_name}
                            </div>
                            <span className="text-xs font-bold text-chloro truncate">{booking.room_or_slot_id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Dates Info */}
                      <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Check-in</div>
                            <div className="text-sm font-semibold text-gray-700 leading-tight">{booking.checkin_date || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-gray-400 uppercase">Check-out</div>
                            <div className="text-sm font-bold text-chloro">{booking.checkout_date || 'N/A'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Notes & Diary Area */}
                      <div className="flex-1 flex flex-col gap-2 mb-5">
                        {booking.reception_notes && (
                          <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                            <span className="text-[10px] font-bold text-blue-700 uppercase mb-0.5 block">Ghi chú</span>
                            <p className="text-xs text-blue-800 line-clamp-2">{booking.reception_notes}</p>
                          </div>
                        )}
                        <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-2.5 flex-1 flex flex-col justify-center">
                          {latestDiary ? (
                            <>
                              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Nhật ký ({latestDiary.date})</p>
                              <p className="text-xs text-gray-700 font-medium mb-1 line-clamp-2">{latestDiary.notes}</p>
                              {latestDiary.issues && (
                                <p className="text-[10px] text-red-600 font-semibold flex items-start gap-1 bg-red-50 p-1.5 rounded-md mt-1">
                                  <AlertTriangle size={10} className="mt-0.5 shrink-0" /> {latestDiary.issues}
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center justify-center text-gray-400 gap-1.5 py-1">
                              <span className="text-sm">📝</span>
                              <p className="text-[10px] font-medium">Chưa có nhật ký</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto pt-2 flex flex-col gap-2 border-t border-gray-100">
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => { setSelectedBooking(booking); setModalType('EXTEND'); }}
                            className="flex-1 py-2 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
                          >
                            <CalendarPlus size={14} /> Gia hạn
                          </button>
                          <button
                            onClick={() => { setSelectedBooking(booking); setModalType('ADD_SERVICE'); }}
                            className="flex-1 py-2 bg-chloro/10 text-chloro hover:bg-chloro/20 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-xs"
                          >
                            <Plus size={14} /> Spa
                          </button>
                        </div>

                        {activeTab === 'CHECKOUT' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleNotifyN8n(booking)}
                              className="flex-1 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors text-sm"
                            >
                              <BellRing size={16} /> Nhắc
                            </button>
                            <button
                              onClick={() => { setSelectedBooking(booking); setModalType('DIARY'); }}
                              className="flex-1 py-2.5 bg-chloro hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-sm"
                            >
                              📝 Nhật ký
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setSelectedBooking(booking); setModalType('DIARY'); }}
                            className="w-full py-2.5 bg-chloro hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm text-sm"
                          >
                            📝 Ghi nhật ký
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {modalType === 'DIARY' && selectedBooking && (
        <SitterDiaryModal
          booking={selectedBooking}
          initialMode="history"
          onClose={() => setModalType(null)}
          onConfirm={handleSaveDiary}
          onReportIncident={(booking) => {
            setSelectedBooking(booking);
            setModalType('EMERGENCY');
          }}
        />
      )}

      {modalType === 'EXTEND' && selectedBooking && (
        <ExtendStayModal
          booking={selectedBooking}
          onClose={() => { setSelectedBooking(null); setModalType(null); }}
          onConfirm={handleExtendStay}
        />
      )}

      {modalType === 'ADD_SERVICE' && selectedBooking && (
        <AddServiceModal
          booking={selectedBooking}
          onClose={() => { setSelectedBooking(null); setModalType(null); }}
          onConfirm={handleAddService}
        />
      )}

      {modalType === 'EMERGENCY' && selectedBooking && (
        <EmergencyModal
          booking={selectedBooking}
          onClose={() => { setSelectedBooking(null); setModalType(null); }}
          onConfirm={handleEmergencyReport}
        />
      )}
    </StaffLayout>
  );
}
