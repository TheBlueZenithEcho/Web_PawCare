import { useState, useEffect } from 'react';
import Head from 'next/head';
import StaffLayout from '@/components/layout/StaffLayout';
import GroomingModal from '@/components/staff/GroomingModal';
import { fetchBookings, completeGrooming, reportIncident } from '@/services/supabase/supabaseBookingApi';
import { Scissors, CheckCircle, Clock, Search, Filter, Calendar, CheckSquare } from 'lucide-react';

export default function GroomerPage() {
  const [groomingBookings, setGroomingBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Filter states
  const [activeTab, setActiveTab] = useState('PROCESSING'); // PROCESSING | COMPLETED
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [specificDate, setSpecificDate] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBookings();
      // Lấy các booking Grooming từ trạng thái Đang phục vụ (PROCESSING) trở đi
      const validStatuses = ['PROCESSING', 'COMPLETED_SERVICE', 'PAID', 'DONE'];
      const groomerData = data.filter(b => 
        b.booking_type === 'Grooming' && 
        validStatuses.includes(b.status)
      );
      setGroomingBookings(groomerData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompleteGrooming = async (booking_id, groomerData) => {
    await completeGrooming(booking_id, groomerData);
    await loadData();
    setSelectedBooking(null);
  };

  const handleIncident = async (booking_id, incidentData) => {
    await reportIncident(booking_id, incidentData);
    await loadData();
    setSelectedBooking(null);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PROCESSING': return <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1 w-max whitespace-nowrap"><Clock size={12}/> Đang phục vụ</span>;
      case 'COMPLETED_SERVICE': return <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 flex items-center gap-1 w-max whitespace-nowrap"><CheckSquare size={12}/> Phục vụ xong</span>;
      case 'PAID': 
      case 'DONE': return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 w-max whitespace-nowrap"><CheckCircle size={12}/> Hoàn thành</span>;
      default: return null;
    }
  };

  // Logic Lọc & Tìm kiếm
  const filteredBookings = groomingBookings.filter(b => {
    // 1. Lọc theo Tab (Trạng thái)
    if (activeTab === 'PROCESSING') {
      if (b.status !== 'PROCESSING') return false;
    } else {
      if (b.status !== 'COMPLETED_SERVICE') return false;
    }

    // 2. Tìm kiếm (Mã đơn, Tên pet, Tên khách, SĐT)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const petName = b.pet?.pet_name?.toLowerCase() || '';
      const customerName = `${b.customer?.last_name || ''} ${b.customer?.first_name || ''}`.toLowerCase();
      const customerPhone = b.customer?.phone || '';
      
      const matchId = b.booking_id?.toLowerCase().includes(q);
      const matchPet = petName.includes(q);
      const matchCustomer = customerName.includes(q);
      const matchPhone = customerPhone.includes(q);
      if (!matchId && !matchPet && !matchCustomer && !matchPhone) return false;
    }

    // 3. Lọc ngày
    if (dateFilter !== 'all') {
      const slotStart = b.booking_service?.[0]?.slot_start;
      const dateStr = slotStart ? slotStart.split('T')[0] : (b.created_at ? b.created_at.split('T')[0] : '');
      if (dateFilter === 'specific' && specificDate) {
        if (!dateStr.includes(specificDate)) return false;
      }
    }

    return true;
  });

  return (
    <StaffLayout>
      <Head>
        <title>PawCare - Groomer Workspace</title>
      </Head>
      <div className="p-4 md:p-6 w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-understory flex items-center gap-2">
            <Scissors size={28} className="text-lacustral" /> Dịch vụ Grooming/Spa
          </h1>
        </div>

        {/* Filters & Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Filters & Tabs */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end px-6 pt-4 border-b border-gray-100 gap-4">
            {/* Tab Navigation */}
            <div className="flex gap-3 lg:gap-4 overflow-x-auto no-scrollbar w-full lg:w-auto order-2 lg:order-1 -mb-[1px]">
              <button
                onClick={() => setActiveTab('PROCESSING')}
                className={`pb-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'PROCESSING' 
                    ? 'border-chloro text-chloro' 
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                Đang phục vụ
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'PROCESSING' ? 'bg-chloro text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {groomingBookings.filter(b => b.status === 'PROCESSING').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`pb-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'COMPLETED' 
                    ? 'border-chloro text-chloro' 
                    : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                Phục vụ xong
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'COMPLETED' ? 'bg-chloro text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {groomingBookings.filter(b => b.status === 'COMPLETED_SERVICE').length}
                </span>
              </button>
            </div>

            {/* Top Bar: Search & Filter */}
            <div className="flex flex-row items-center gap-2 w-full lg:w-auto pb-0 lg:pb-2.5 order-1 lg:order-2 flex-nowrap shrink-0">
              <div className="relative flex-1 lg:flex-none">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Tìm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-chloro focus:ring-1 focus:ring-chloro w-full lg:w-28 xl:w-48"
                />
              </div>
              
              <div className="relative flex items-center gap-2">
                <div className="relative flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-chloro focus-within:ring-1 focus-within:ring-chloro">
                  <Calendar size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
                  <select 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-9 pr-10 py-2 text-sm outline-none bg-transparent appearance-none cursor-pointer text-gray-700 min-w-[150px]"
                  >
                    <option value="all">Tất cả thời gian</option>
                    <option value="specific">Chọn ngày cụ thể...</option>
                    <option value="7days">7 ngày gần nhất</option>
                    <option value="thisMonth">Tháng này</option>
                  </select>
                  <Filter size={16} className="absolute right-3 text-gray-400 pointer-events-none" />
                </div>

                {dateFilter === 'specific' && (
                  <div className="relative animate-in fade-in slide-in-from-left-2">
                    <input 
                      type="date"
                      value={specificDate}
                      onChange={(e) => setSpecificDate(e.target.value)}
                      className="px-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-chloro focus:ring-1 focus:ring-chloro bg-white text-gray-700 min-w-[140px]"
                    />
                    {specificDate && (
                      <button 
                        onClick={() => setSpecificDate('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white px-1"
                        title="Xóa bộ lọc ngày"
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* List */}
        {isLoading ? (
          <p className="text-lacustral text-center p-8">Đang tải dữ liệu...</p>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-lacustral text-lg">Không tìm thấy ca cắt tỉa nào phù hợp với bộ lọc.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {filteredBookings.map(booking => (
              <div key={booking.booking_id} className="bg-white border border-gray-100 hover:border-chloro/30 transition-all duration-300 rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-3xl shadow-inner border border-gray-100 shrink-0">
                      {booking.pet?.species === 'cat' ? '🐈' : '🐕'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{booking.pet?.pet_name}</h3>
                      <p className="text-sm text-gray-500 mb-1">{booking.pet?.breed} · {booking.pet?.weight}kg</p>
                      <p className="text-xs font-medium text-gray-400">Mã đơn: {booking.booking_id}</p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 flex-1 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Dịch vụ</p>
                  <p className="font-semibold text-gray-900 mb-4">{booking.booking_type}</p>
                  
                  {booking.addons && booking.addons.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Hạng mục</p>
                      {booking.addons.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle size={14} className={booking.status === 'PROCESSING' ? 'text-gray-300' : 'text-chloro'} />
                          <span>{a.addon_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {booking.groomer_notes && (
                    <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <p className="text-xs font-bold text-blue-700 uppercase mb-1">Ghi chú</p>
                      <p className="text-sm text-blue-800">{booking.groomer_notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  {booking.status === 'PROCESSING' ? (
                    <button 
                      onClick={() => setSelectedBooking(booking)}
                      className="w-full py-3 bg-chloro hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                    >
                      <CheckCircle size={18} /> Hoàn tất cắt tỉa
                    </button>
                  ) : (
                    booking.health_record?.photos && (
                      <div className="flex gap-2">
                        {(Array.isArray(booking.health_record.photos) ? booking.health_record.photos : [booking.health_record.photos]).filter(src => typeof src === 'string' && src.length > 0).map((src, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img key={i} src={src} alt="Grooming Result" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <GroomingModal 
          booking={selectedBooking} 
          onClose={() => setSelectedBooking(null)}
          onConfirm={(data) => handleCompleteGrooming(selectedBooking.booking_id, data)}
          onIncident={(incidentData) => handleIncident(selectedBooking.booking_id, incidentData)}
        />
      )}
    </StaffLayout>
  );
}
