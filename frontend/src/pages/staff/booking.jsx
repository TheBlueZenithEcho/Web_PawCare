import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import StaffLayout from '@/components/layout/StaffLayout';
import { fetchBookings, updateBookingStatus, reportIncident, checkInBooking, completeBookingHandover, checkoutBookingPayment } from '@/services/supabase/supabaseBookingApi';
import { Search, PlusCircle, CheckCircle, Clock, AlertTriangle, Filter, Eye, ShieldCheck, CheckCircle2, ClipboardCheck, XCircle, ChevronRight, CheckSquare, Package, Calendar, Phone } from 'lucide-react';
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

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const TABS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'CONFIRMED', label: 'Đã xác nhận' },
    { id: 'PROCESSING', label: 'Đang phục vụ / Lưu trú' },
    { id: 'COMPLETED_SERVICE', label: 'Phục vụ xong' },
    { id: 'PAID', label: 'Đã thanh toán' },
    { id: 'DONE', label: 'Hoàn thành' },
    { id: 'CANCELLED', label: 'Đã hủy' },
  ];

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBookings();
      setBookings(data);
      filterData(data, activeTab, searchTerm, dateFilterType, specificDate);
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
      filtered = filtered.filter(b => {
        const customerPhone = b.customer?.phone || '';
        const customerName = `${b.customer?.last_name || ''} ${b.customer?.first_name || ''}`;
        const petName = b.pet?.pet_name || '';
        const bookingId = b.booking_id || '';
        return (
          customerPhone.includes(lowerSearch) ||
          customerName.toLowerCase().includes(lowerSearch) ||
          petName.toLowerCase().includes(lowerSearch) ||
          bookingId.toLowerCase().includes(lowerSearch)
        );
      });
    }
    if (dateType === 'SPECIFIC' && specificDateVal) {
      filtered = filtered.filter(b => {
        const checkin = b.booking_room?.[0]?.check_in_date || b.booking_service?.[0]?.slot_start?.split('T')[0] || b.created_at?.split('T')[0];
        return checkin && checkin.startsWith(specificDateVal);
      });
    } else if (dateType === 'NEXT_7_DAYS') {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      filtered = filtered.filter(b => {
        const dateStr = b.booking_room?.[0]?.check_in_date || b.booking_service?.[0]?.slot_start?.split('T')[0] || b.created_at?.split('T')[0];
        if (!dateStr) return false;

        if (dateStr.length === 5 && dateStr.includes(':')) return true;

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
    await checkInBooking(selectedBooking, checkInData);
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
      await checkoutBookingPayment(selectedBooking.booking_id);
      await loadData();
      setActiveTab('PAID');
    }
    setIsCheckoutModalOpen(false);
    setSelectedBooking(null);
  };

  const handleHandover = async (bookingId) => {
    if (window.confirm('Xác nhận bàn giao thú cưng cho khách và kết thúc booking?')) {
      await completeBookingHandover(bookingId);
      await loadData();
      setActiveTab('DONE');
    }
  };

  const getStatusBadge = (status, service_type) => {
    const badges = {
      'CONFIRMED': (
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          <CheckCircle size={12} /> Đã xác nhận
        </span>
      ),
      'PROCESSING': (
        <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          <Clock size={12} className="animate-spin-slow" /> {service_type === 'Hotel' ? 'Đang lưu trú' : 'Đang phục vụ'}
        </span>
      ),
      'COMPLETED_SERVICE': (
        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          <CheckSquare size={12} /> Phục vụ xong
        </span>
      ),
      'PAID': (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          <ShieldCheck size={12} /> Đã thanh toán
        </span>
      ),
      'DONE': (
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          <CheckCircle2 size={12} /> Hoàn thành
        </span>
      ),
      'NO_SHOW': (
        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          <AlertTriangle size={12} /> No-show
        </span>
      ),
      'CANCELLED': (
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">
          <XCircle size={12} /> Đã hủy
        </span>
      ),
    };
    return badges[status] || <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
  };

  const getStatusTheme = (status) => {
    const themes = {
      'CONFIRMED': { bg: 'bg-blue-500' },
      'PROCESSING': { bg: 'bg-orange-500' },
      'COMPLETED_SERVICE': { bg: 'bg-purple-500' },
      'PAID': { bg: 'bg-emerald-500' },
      'DONE': { bg: 'bg-green-500' },
      'NO_SHOW': { bg: 'bg-red-500' },
      'CANCELLED': { bg: 'bg-gray-400' },
    };
    return themes[status] || { bg: 'bg-gray-200' };
  };

  const getActionButtons = (booking) => {
    const viewButton = (
      <button
        onClick={() => { setSelectedBooking(booking); setIsViewModalOpen(true); }}
        className="flex-1 flex items-center justify-center p-2.5 text-gray-500 hover:text-gray-700 bg-white hover:bg-gray-100 rounded-xl transition-all font-bold text-sm"
      >
        Chi tiết
      </button>
    );

    if (booking.status === 'CONFIRMED') {
      return (
        <div className="flex items-center gap-2 w-full">
          {viewButton}
          <button
            onClick={() => { setSelectedBooking(booking); setIsCheckInModalOpen(true); }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-chloro hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            Tiếp nhận
          </button>
        </div>
      );
    }
    if (booking.status === 'COMPLETED_SERVICE') {
      return (
        <div className="flex items-center gap-2 w-full">
          {viewButton}
          <button
            onClick={() => { setSelectedBooking(booking); setIsCheckoutModalOpen(true); }}
            className="flex-1 flex items-center justify-center gap-1.5 bg-chloro hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            Thanh toán
          </button>
        </div>
      );
    }
    if (booking.status === 'PAID') {
      return (
        <div className="flex items-center gap-2 w-full">
          {viewButton}
          <button
            onClick={() => handleHandover(booking.booking_id)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            Bàn giao
          </button>
        </div>
      );
    }
    return <div className="flex w-full">{viewButton}</div>;
  };

  return (
    <StaffLayout>
      <Head>
        <title>PawCare - Tiếp nhận & Đặt lịch</title>
      </Head>

      <div className="p-4 md:p-6 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-understory flex items-center gap-2">
            <ClipboardCheck size={28} className="text-lacustral" /> Tiếp nhận & Đặt lịch
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-chloro hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm w-full sm:w-auto"
          >
            <PlusCircle size={20} /> Đơn đặt lịch mới
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[80vh]">

          {/* Filters & Tabs */}
          <div className="flex flex-col lg:flex-row justify-between items-center px-6 py-4 border-b border-gray-100 gap-4">
            {/* Status Dropdown */}
            <div className="w-full lg:w-auto order-2 lg:order-1 relative" ref={dropdownRef}>
              <div
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="relative flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm hover:border-chloro/50 transition-all cursor-pointer min-w-[240px]"
              >
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400" />
                  <span className="text-sm font-bold text-gray-700">
                    {TABS.find(t => t.id === activeTab)?.label} ({activeTab === 'ALL' ? bookings.length : bookings.filter(b => b.status === activeTab).length})
                  </span>
                </div>
                <div className={`text-gray-400 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {isStatusDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-[280px] bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="py-2">
                    {TABS.map(tab => {
                      const count = tab.id === 'ALL' ? bookings.length : bookings.filter(b => b.status === tab.id).length;
                      return (
                        <div
                          key={tab.id}
                          onClick={() => { setActiveTab(tab.id); setIsStatusDropdownOpen(false); }}
                          className={`px-4 py-2.5 text-sm cursor-pointer flex justify-between items-center transition-colors ${activeTab === tab.id
                              ? 'bg-green-50/50 font-bold text-chloro'
                              : 'hover:bg-gray-50 font-medium text-gray-700'
                            }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-chloro text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Top Bar: Search & Filter */}
            <div className="flex flex-row items-center gap-2 w-full lg:w-auto pb-0 lg:pb-2.5 order-1 lg:order-2 flex-nowrap shrink-0">
              <div className="relative flex-1 lg:flex-none">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-chloro focus:ring-1 focus:ring-chloro w-full lg:w-28 xl:w-48"
                />
              </div>

              <div className="relative flex items-center gap-2">
                <div className="relative flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden focus-within:border-chloro focus-within:ring-1 focus-within:ring-chloro">
                  <Calendar size={16} className="absolute left-3 text-gray-400 pointer-events-none" />
                  <select
                    value={dateFilterType}
                    onChange={(e) => setDateFilterType(e.target.value)}
                    className="pl-9 pr-8 py-2 text-sm outline-none bg-transparent appearance-none cursor-pointer text-gray-700 w-36 xl:w-auto"
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
                      className="px-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-chloro focus:ring-1 focus:ring-chloro bg-white text-gray-700 min-w-[140px]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table container */}
          <div className="bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-100 flex-1 flex flex-col">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500 animate-pulse">Đang tải dữ liệu...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500 h-full">
                <p className="font-semibold text-lg">Không tìm thấy đơn nào.</p>
                <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10">
                {filteredBookings.map((booking) => {
                  const serviceType = booking.booking_type;
                  const theme = getStatusTheme(booking.status, serviceType);
                  const customerName = `${booking.customer?.last_name || ''} ${booking.customer?.first_name || ''}`;
                  const bookingTime = booking.booking_service?.[0]?.slot_start || booking.booking_room?.[0]?.check_in_date || booking.created_at;
                  const formattedTime = bookingTime.includes('T') ? bookingTime.split('T')[1].substring(0, 5) : bookingTime;
                  const petSpecies = booking.pet?.species;
                  const roomOrSlotId = booking.booking_service?.[0]?.table_id || booking.booking_room?.[0]?.room_id;

                  return (
                    <div
                      key={booking.booking_id}
                      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-chloro/30 transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      <div className="p-5 flex-1 flex flex-col">
                        {/* Card Header: ID & Status */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">{booking.booking_id}</span>
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mt-0.5">
                              <Clock size={14} className="text-gray-400" /> {formattedTime}
                            </div>
                          </div>
                          <div>
                            {getStatusBadge(booking.status, serviceType)}
                          </div>
                        </div>

                        {/* Pet & Owner Info */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl border border-gray-100 shrink-0">
                            {petSpecies === 'cat' ? '🐈' : '🐕'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-gray-900 truncate">{booking.pet?.pet_name}</h3>
                            <div className="flex flex-col gap-0.5">
                              <p className="text-xs text-gray-500 truncate">{booking.pet?.breed} • {booking.pet?.weight}kg</p>
                              <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
                                <Phone size={10} /> {customerName}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Service Info Box */}
                        <div className="bg-gray-50 rounded-xl p-3 mb-5 mt-auto border border-gray-100 flex flex-col gap-2">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded flex items-center justify-center bg-white border border-gray-200 shrink-0 mt-0.5">
                              {serviceType === 'Hotel' ? '🏨' : serviceType === 'Grooming' ? '✂️' : '🏥'}
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase">Dịch vụ</div>
                              <div className="text-sm font-semibold text-gray-900 leading-tight">
                                {serviceType === 'Hotel' ? 'Lưu trú' : serviceType === 'Grooming' ? 'Grooming/Spa' : serviceType}
                              </div>
                            </div>
                          </div>

                          {roomOrSlotId && (
                            <div className="flex items-start gap-2 pt-2 border-t border-gray-200">
                              <div className="w-5 h-5 rounded flex items-center justify-center bg-white border border-gray-200 shrink-0 mt-0.5">
                                <Package size={12} className="text-gray-500" />
                              </div>
                              <div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase">{serviceType === 'Hotel' ? 'Phòng lưu trú' : 'Bàn / Slot'}</div>
                                <div className="text-sm font-semibold text-gray-900 leading-tight">{roomOrSlotId}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-auto pt-2">
                          {getActionButtons(booking)}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
