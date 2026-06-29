import { useState, useEffect } from 'react';
import Head from 'next/head';
import StaffLayout from '@/components/layout/StaffLayout';
import { fetchBookings, updateBookingStatus, reportIncident } from '@/data/api';
import { Search, PlusCircle, CheckCircle, Clock, AlertTriangle, Filter, Eye, ShieldCheck, CheckCircle2, ClipboardCheck, XCircle, ChevronRight, CheckSquare, Package, Calendar } from 'lucide-react';
import CheckInModal from '@/components/staff/CheckInModal';
import CreateBookingModal from '@/components/staff/CreateBookingModal';
import PaymentModal from '@/components/staff/PaymentModal';
import ViewBookingModal from '@/components/staff/ViewBookingModal';

export default function ReceptionTable() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilterType, setDateFilterType] = useState('ALL'); // 'ALL', 'SPECIFIC', 'NEXT_7_DAYS'
  const [specificDate, setSpecificDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'CONFIRMED', label: 'Đã xác nhận' },
    { id: 'PROCESSING', label: 'Đang phục vụ' },
    { id: 'COMPLETED_SERVICE', label: 'Phục vụ xong' },
    { id: 'PAID', label: 'Đã thanh toán' },
    { id: 'DONE', label: 'Hoàn thành' },
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBookings({ search: searchTerm, status: activeTab !== 'ALL' ? activeTab : undefined });
      setBookings(data);
      filterData(data, activeTab, searchTerm);
    } catch (error) {
      console.error("Failed to load bookings", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filterData = (data, tab, search, dateType, specificDateVal) => {
    let filtered = data;
    if (tab !== 'ALL') {
      filtered = filtered.filter(b => b.status === tab);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(b => 
        (b.customer_phone && b.customer_phone.includes(lowerSearch)) ||
        (b.customer_name && b.customer_name.toLowerCase().includes(lowerSearch)) ||
        (b.pet_name && b.pet_name.toLowerCase().includes(lowerSearch)) ||
        (b.booking_id && b.booking_id.toLowerCase().includes(lowerSearch))
      );
    }
    if (dateType === 'SPECIFIC' && specificDateVal) {
      filtered = filtered.filter(b => b.checkin_date === specificDateVal || (b.booking_time && b.booking_time.startsWith(specificDateVal)));
    } else if (dateType === 'NEXT_7_DAYS') {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      filtered = filtered.filter(b => {
        // Simple logic for mock data: Parse 'YYYY-MM-DD' from checkin_date or booking_time
        const dateStr = b.checkin_date || (b.booking_time ? b.booking_time.split(' ')[0] : null);
        if (!dateStr) return false;
        
        // For 'HH:mm' we can't filter by date properly in mock data if it lacks YYYY-MM-DD. 
        // For this demo, let's just assume we parse it correctly if it's YYYY-MM-DD.
        if (dateStr.length === 5 && dateStr.includes(':')) return true; // It's just a time string, assume today.

        const bDate = new Date(dateStr);
        return bDate >= today && bDate <= nextWeek;
      });
    }
    setFilteredBookings(filtered);
  };

  useEffect(() => {
    filterData(bookings, activeTab, searchTerm, dateFilterType, specificDate);
  }, [activeTab, searchTerm, bookings, dateFilterType, specificDate]);

  const handleCheckInComplete = async (bookingId, checkInData) => {
    await updateBookingStatus(bookingId, 'PROCESSING');
    await loadData();
    setIsCheckInModalOpen(false);
    setSelectedBooking(null);
  };

  const handleCreateBookingComplete = async () => {
    await loadData();
    setIsCreateModalOpen(false);
  };

  const handleCheckoutComplete = async (checkoutData) => {
    if (selectedBooking) {
      await updateBookingStatus(selectedBooking.booking_id, 'PAID');
      await loadData();
      setActiveTab('PAID');
    }
    setIsCheckoutModalOpen(false);
    setSelectedBooking(null);
  };

  const handleHandover = async (bookingId) => {
    if (confirm('Xác nhận bàn giao thú cưng cho khách và kết thúc booking?')) {
      await updateBookingStatus(bookingId, 'DONE');
      await loadData();
      setActiveTab('DONE');
    }
  };

  const getStatusBadge = (status, service_type) => {
    const badges = {
      'CONFIRMED': (
        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200 shadow-sm whitespace-nowrap">
          <CheckCircle size={12} /> Đã xác nhận
        </span>
      ),
      'PROCESSING': (
        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold border border-orange-200 shadow-sm whitespace-nowrap">
          <Clock size={12} className="animate-spin-slow" /> {service_type === 'Hotel' ? 'Đang lưu trú' : 'Đang phục vụ'}
        </span>
      ),
      'COMPLETED_SERVICE': (
        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-200 shadow-sm whitespace-nowrap">
          <CheckSquare size={12} /> Phục vụ xong
        </span>
      ),
      'PAID': (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm whitespace-nowrap">
          <ShieldCheck size={12} /> Đã thanh toán
        </span>
      ),
      'DONE': (
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm whitespace-nowrap">
          <CheckCircle2 size={12} /> Hoàn thành
        </span>
      ),
      'NO_SHOW': (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200 shadow-sm whitespace-nowrap">
          <AlertTriangle size={12} /> No-show
        </span>
      ),
      'CANCELLED': (
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-200 shadow-sm whitespace-nowrap">
          <XCircle size={12} /> Đã hủy
        </span>
      ),
    };
    return badges[status] || <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
  };

  const getActionButtons = (booking) => {
    const viewButton = (
      <button 
        onClick={() => { setSelectedBooking(booking); setIsViewModalOpen(true); }}
        className="flex items-center justify-center p-2 text-gray-400 hover:text-chloro bg-white hover:bg-green-50 border border-gray-200 hover:border-green-200 rounded-xl transition-all shadow-sm group"
        title="Xem chi tiết"
      >
        <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    );

    if (booking.status === 'CONFIRMED') {
      return (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedBooking(booking); setIsCheckInModalOpen(true); }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 hover:shadow-blue-500/40 whitespace-nowrap w-fit"
          >
            <CheckCircle size={16} /> Tiếp nhận
          </button>
          {viewButton}
        </div>
      );
    }
    if (booking.status === 'COMPLETED_SERVICE') {
      return (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { setSelectedBooking(booking); setIsCheckoutModalOpen(true); }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-green-500/20 hover:shadow-green-500/40 whitespace-nowrap w-fit"
          >
            <ShieldCheck size={16} /> Thanh toán
          </button>
          {viewButton}
        </div>
      );
    }
    if (booking.status === 'PAID') {
      return (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleHandover(booking.booking_id)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md shadow-gray-900/20 hover:shadow-gray-900/40 whitespace-nowrap w-fit"
          >
            <Package size={16} /> Bàn giao
          </button>
          {viewButton}
        </div>
      );
    }
    return viewButton;
  };

  return (
    <StaffLayout>
      <Head>
        <title>PawCare - Tiếp nhận & Đặt lịch</title>
      </Head>
      
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-understory mb-1 flex items-center gap-2">
              <ClipboardCheck size={28} className="text-lacustral" /> Tiếp nhận & Đặt lịch
            </h1>
            <p className="text-lacustral text-sm">Quản lý điều phối các dịch vụ và đơn đặt lịch</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#5e9e30] hover:bg-[#4d8227] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm w-full sm:w-auto"
          >
            <PlusCircle size={20} /> Đơn đặt lịch mới
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          {/* Top Bar: Search & Filter */}
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50/50 border-b border-gray-100">
            <div className="flex gap-3 ml-auto">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm mã đơn, tên/SĐT khách, tên thú..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc] w-72"
                />
              </div>
              
              <div className="relative flex items-center gap-2">
                <div className="relative flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#1a66cc]">
                  <Calendar size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
                  <select 
                    value={dateFilterType}
                    onChange={(e) => setDateFilterType(e.target.value)}
                    className="pl-9 pr-10 py-2 text-sm outline-none bg-transparent appearance-none cursor-pointer text-gray-700 min-w-[150px]"
                  >
                    <option value="ALL">Tất cả thời gian</option>
                    <option value="SPECIFIC">Chọn ngày cụ thể...</option>
                    <option value="NEXT_7_DAYS">7 ngày tới</option>
                  </select>
                  <Filter size={16} className="absolute right-3 text-gray-400 pointer-events-none" />
                </div>
                {dateFilterType === 'SPECIFIC' && (
                  <div className="relative animate-in fade-in slide-in-from-left-2">
                    <input 
                      type="date"
                      value={specificDate}
                      onChange={(e) => setSpecificDate(e.target.value)}
                      className="px-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc] bg-white text-gray-700 min-w-[140px]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 px-4 py-3 bg-gray-50/50 border-b border-gray-100 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'border-[#5e9e30] text-[#5e9e30] bg-white border shadow-sm' 
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTab === tab.id ? 'bg-[#5e9e30] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.id === 'ALL' ? bookings.length : bookings.filter(b => b.status === tab.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Table container */}
          <div className="bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-100">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500 animate-pulse">Đang tải dữ liệu...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="font-semibold text-lg">Không tìm thấy đơn nào.</p>
                <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              </div>
            ) : (
              <div className="overflow-x-auto p-4 max-w-full">
                <table className="w-full text-left border-separate border-spacing-y-2 min-w-[900px]">
                  <thead>
                    <tr className="text-xs uppercase text-gray-400 bg-gray-50/50">
                      <th className="px-6 py-3 rounded-l-xl font-bold">Mã / Thời gian</th>
                      <th className="px-6 py-3 font-bold">Khách hàng</th>
                      <th className="px-6 py-3 font-bold">Thú cưng</th>
                      <th className="px-6 py-3 font-bold">Dịch vụ</th>
                      <th className="px-6 py-3 font-bold w-[180px]">Trạng thái</th>
                      <th className="px-6 py-3 rounded-r-xl font-bold text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.booking_id} className="bg-white hover:bg-gray-50/80 transition-colors shadow-sm ring-1 ring-gray-100 rounded-xl group">
                        <td className="px-6 py-4 rounded-l-xl">
                          <div className="font-bold text-gray-900 group-hover:text-chloro transition-colors">{booking.booking_id}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <Clock size={14} /> {booking.booking_time}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{booking.customer_name}</div>
                          <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl shadow-sm">
                              {booking.pet_type === 'Mèo' ? '🐈' : '🐕'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{booking.pet_name}</div>
                              <div className="text-xs text-gray-500">{booking.pet_breed} · {booking.pet_weight}kg</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{booking.service_type}</div>
                          {booking.room_or_slot_id && (
                            <div className="text-xs font-semibold text-chloro mt-1">Slot/Phòng: {booking.room_or_slot_id}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(booking.status, booking.service_type)}
                        </td>
                        <td className="px-6 py-4 text-right rounded-r-xl">
                          <div className="flex justify-end gap-2">
                            {getActionButtons(booking)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
        </div>
      </div>

      {isCheckInModalOpen && selectedBooking && (
        <CheckInModal 
          booking={selectedBooking} 
          onClose={() => { setIsCheckInModalOpen(false); setSelectedBooking(null); }}
          onConfirm={(data) => handleCheckInComplete(selectedBooking.booking_id, data)}
        />
      )}

      {isCreateModalOpen && (
        <CreateBookingModal 
          onClose={() => setIsCreateModalOpen(false)}
          onConfirm={handleCreateBookingComplete}
        />
      )}

      {isCheckoutModalOpen && selectedBooking && (
        <PaymentModal 
          booking={selectedBooking} 
          onClose={() => { setIsCheckoutModalOpen(false); setSelectedBooking(null); }}
          onConfirm={handleCheckoutComplete}
        />
      )}

      {isViewModalOpen && selectedBooking && (
        <ViewBookingModal 
          booking={selectedBooking} 
          onClose={() => { setIsViewModalOpen(false); setSelectedBooking(null); }}
          onUpdateStatus={async (id, status) => {
            await updateBookingStatus(id, status);
            await loadData();
            setIsViewModalOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}

    </StaffLayout>
  );
}
