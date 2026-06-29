import { useState, useEffect } from 'react';
import Head from 'next/head';
import StaffLayout from '@/components/layout/StaffLayout';
import SitterDiaryModal from '@/components/staff/SitterDiaryModal';
import ExtendStayModal from '@/components/staff/ExtendStayModal';
import AddServiceModal from '@/components/staff/AddServiceModal';
import EmergencyModal from '@/components/staff/EmergencyModal';
import { fetchBookings, addDiaryEntry } from '@/data/api';
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
            <CalendarDays size={28} className="text-lacustral" /> Quản lý lưu trú (Pet Hotel)
          </h1>
          <p className="text-lacustral text-sm">Nhật ký cần cập nhật trước 20:00 mỗi ngày</p>
        </div>

        {/* Filters & Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50/50 border-b border-gray-100">
            {/* Tabs */}
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('PROCESSING')}
                className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'PROCESSING' 
                    ? 'border-moss-green text-moss-green bg-white border shadow-sm' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Đang lưu trú
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'PROCESSING' ? 'bg-moss-green text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {statsData.active}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('CHECKOUT')}
                className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'CHECKOUT' 
                    ? 'border-moss-green text-moss-green bg-white border shadow-sm' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Chờ Check-out
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'CHECKOUT' ? 'bg-moss-green text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {statsData.checkout}
                </span>
              </button>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Tìm SĐT, Mã, Tên pet..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azeitona outline-none text-sm w-full md:w-64"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
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
            <div className="space-y-6">
              {filteredBookings.map(booking => {
                const latestDiary = booking.diaries && booking.diaries.length > 0 
                  ? booking.diaries[booking.diaries.length - 1] 
                  : null;

                return (
                  <div key={booking.booking_id} className="bg-white border border-gray-200 hover:border-blue-200 transition-colors rounded-xl p-6 shadow-sm">
                    {/* Pet Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl shadow-sm border border-blue-200">
                          {booking.pet_type === 'Mèo' ? '🐈' : '🐕'}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-understory">{booking.pet_name}</h3>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md text-xs font-bold border border-yellow-200 flex items-center gap-1 whitespace-nowrap"><AlarmClock size={12}/> Đang lưu trú</span>
                            {booking.has_incident && (
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded font-semibold flex items-center gap-1 border border-yellow-200">
                                <AlertTriangle size={12} /> Sự cố
                              </span>
                            )}
                          </div>
                          <p className="text-lacustral text-sm font-medium mb-1">{booking.customer_name} · {booking.customer_phone}</p>
                          <p className="text-gray-500 text-sm font-mono bg-gray-50 px-2 py-0.5 rounded-md w-max border border-gray-100">
                            {booking.room_or_slot_id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-lacustral mb-1">Check-in</p>
                        <p className="font-semibold text-understory">{booking.checkin_date || 'N/A'}</p>
                        <p className="text-lacustral mt-2 mb-1">Check-out</p>
                        <p className="font-semibold text-fig-leaf text-lg">{booking.checkout_date || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {booking.reception_notes && (
                      <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg flex items-start gap-2 mb-4">
                        <Pin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-blue-700 text-sm">{booking.reception_notes}</p>
                      </div>
                    )}

                    {/* Latest Diary */}
                    <div className="border border-gray-100 bg-gray-50/50 rounded-lg p-4 mb-4">
                      {latestDiary ? (
                        <>
                          <p className="text-sm font-semibold text-understory mb-2">Nhật ký gần nhất ({latestDiary.date})</p>
                          <p className="text-sm text-gray-600 mb-1">{latestDiary.notes}</p>
                          {latestDiary.issues && (
                            <p className="text-sm text-orange-600 flex items-center gap-1">
                              <AlertTriangle size={14} /> {latestDiary.issues}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-lacustral">Chưa có nhật ký nào.</p>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setSelectedBooking(booking); setModalType('EXTEND'); }}
                          className="px-4 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
                        >
                          <CalendarPlus size={16} /> Gia hạn lưu trú
                        </button>
                        <button 
                          onClick={() => { setSelectedBooking(booking); setModalType('ADD_SERVICE'); }}
                          className="px-4 py-2 border border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg font-medium flex items-center gap-2 transition-colors text-sm"
                        >
                          <Plus size={16} /> Thêm Dịch vụ Spa
                        </button>
                      </div>

                      <div className="flex gap-2">
                        {activeTab === 'CHECKOUT' && (
                          <button 
                            onClick={() => handleNotifyN8n(booking)}
                            className="px-4 py-2 bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 rounded-lg font-bold flex items-center gap-2 transition-colors text-sm shadow-sm"
                          >
                            <BellRing size={16} /> Nhắc Checkout
                          </button>
                        )}
                        <button 
                          onClick={() => { setSelectedBooking(booking); setModalType('DIARY'); }}
                          className="px-6 py-2 bg-moss-green hover:bg-fig-leaf text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm text-sm"
                        >
                          📝 Ghi nhật ký
                        </button>
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
