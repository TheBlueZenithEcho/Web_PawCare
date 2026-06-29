import { useState, useEffect } from 'react';
import Head from 'next/head';
import StaffLayout from '@/components/layout/StaffLayout';
import GroomingModal from '@/components/staff/GroomingModal';
import { fetchBookings, completeGrooming, reportIncident } from '@/data/api';
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
      const data = await fetchBookings({});
      // Lấy các booking Grooming từ trạng thái Đang phục vụ (PROCESSING) trở đi
      const validStatuses = ['PROCESSING', 'COMPLETED_SERVICE', 'PAID', 'DONE'];
      const groomerData = data.filter(b => 
        (b.service_category === 'Grooming' || !b.service_category || b.service_type === 'Grooming') && 
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
      const matchId = b.booking_id?.toLowerCase().includes(q);
      const matchPet = b.pet_name?.toLowerCase().includes(q);
      const matchCustomer = b.customer_name?.toLowerCase().includes(q);
      const matchPhone = b.customer_phone?.includes(q);
      if (!matchId && !matchPet && !matchCustomer && !matchPhone) return false;
    }

    // 3. Lọc ngày
    if (dateFilter !== 'all') {
      const dateStr = b.checkin_date || (b.booking_time ? b.booking_time.split(' ')[0] : '');
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
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-understory mb-1 flex items-center gap-2">
              <Scissors size={28} className="text-lacustral" /> Dịch vụ Grooming/Spa
            </h1>
            <p className="text-lacustral text-sm">Chỉ hiển thị các bé đang hoặc đã thực hiện dịch vụ</p>
          </div>
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
                    ? 'border-[#5e9e30] text-[#5e9e30] bg-white border shadow-sm' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Đang phục vụ
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'PROCESSING' ? 'bg-[#5e9e30] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {groomingBookings.filter(b => b.status === 'PROCESSING').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('COMPLETED')}
                className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${
                  activeTab === 'COMPLETED' 
                    ? 'border-[#5e9e30] text-[#5e9e30] bg-white border shadow-sm' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Phục vụ xong
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'COMPLETED' ? 'bg-[#5e9e30] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {groomingBookings.filter(b => b.status === 'COMPLETED_SERVICE').length}
                </span>
              </button>
            </div>

            {/* Search & Date Filter */}
            <div className="flex gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Tìm mã đơn, tên/SĐT khách, tên thú..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc] w-72"
                />
              </div>
              
              <div className="relative flex items-center gap-2">
                <div className="relative flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#1a66cc]">
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
                      className="px-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc] bg-white text-gray-700 min-w-[140px]"
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
              <div key={booking.booking_id} className={`bg-white border rounded-xl p-5 shadow-sm transition-all ${booking.status === 'PROCESSING' ? 'border-yellow-400 ring-4 ring-yellow-50' : 'border-gray-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-3xl shadow-sm">
                      {booking.pet_type === 'Mèo' ? '🐈' : '🐕'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-understory leading-tight">{booking.pet_name}</h3>
                      <p className="text-sm text-gray-500 mb-1">{booking.pet_breed} · {booking.pet_weight}kg</p>
                      <p className="text-xs font-medium text-lacustral">Mã đơn: {booking.booking_id}</p>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm border border-gray-100">
                  <p className="font-semibold text-understory mb-1">{booking.service_type}</p>
                  {booking.addons && booking.addons.length > 0 && (
                    <ul className="list-disc pl-4 text-gray-600 text-xs space-y-0.5">
                      {booking.addons.map((a, i) => <li key={i}>{a.addon_name}</li>)}
                    </ul>
                  )}
                  {booking.groomer_notes && (
                    <p className="mt-2 text-blue-700 bg-blue-50 p-2 rounded text-xs font-medium">Ghi chú sau ca: {booking.groomer_notes}</p>
                  )}
                </div>

                {booking.status === 'PROCESSING' && (
                  <button 
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full py-2.5 bg-understory hover:bg-lacustral text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <CheckCircle size={18} /> Hoàn tất cắt tỉa
                  </button>
                )}
                
                {booking.status !== 'PROCESSING' && booking.health_record?.photos && (
                  <div className="flex gap-2 mt-3">
                    {(Array.isArray(booking.health_record.photos) ? booking.health_record.photos : [booking.health_record.photos]).filter(src => typeof src === 'string' && src.length > 0).map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={src} alt="Grooming Result" className="w-12 h-12 rounded object-cover border border-gray-200" />
                    ))}
                  </div>
                )}
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
