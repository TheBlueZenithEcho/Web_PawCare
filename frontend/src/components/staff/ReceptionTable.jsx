import { Search, AlertTriangle, Calendar, User, Phone, Check, CheckCircle, ShieldCheck, Clock, CheckSquare, Edit, Ban, FileText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import CheckInModal from './CheckInModal';
import CheckoutModal from './CheckoutModal';
import ServiceLogModal from './ServiceLogModal';
import EmergencyModal from './EmergencyModal';
import PaymentModal from './PaymentModal';
import SitterDiaryModal from './SitterDiaryModal';

const TABS = [
  { id: 'ALL', label: 'TẤT CẢ' },
  { id: 'PENDING', label: 'CHỜ PHỤC VỤ' },
  { id: 'PROCESSING', label: 'ĐANG PHỤC VỤ' },
  { id: 'COMPLETED_SERVICE', label: 'PHỤC VỤ XONG' },
  { id: 'DONE', label: 'HOÀN THÀNH' },
  { id: 'CANCELLED', label: 'ĐÃ HỦY' }
];

export default function ReceptionTable({ 
  bookings, 
  isLoading, 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery,
  onCheckIn,
  onServiceLog,
  onCheckout,
  onReportIncident
}) {
  const [activeModal, setActiveModal] = useState({ type: null, data: null });

  const getStatusBadge = (status, hasIncident, category) => {
    if (hasIncident) {
      return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1 w-max whitespace-nowrap"><AlertTriangle size={14} /> SỰ CỐ</span>;
    }
    switch (status) {
      case 'PENDING': return <span className="bg-[#115566]/10 text-lacustral px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 w-max whitespace-nowrap">{category === 'Hotel' ? 'Đã xác nhận' : 'Chờ phục vụ'}</span>;
      case 'PROCESSING': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1 w-max whitespace-nowrap"><Clock size={12}/> {category === 'Hotel' ? 'Đang lưu trú' : 'Đang phục vụ'}</span>;
      case 'COMPLETED_SERVICE': return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1 w-max whitespace-nowrap"><CheckSquare size={12}/> Phục vụ xong</span>;
      case 'PAID': return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1 w-max whitespace-nowrap"><CheckSquare size={12}/> Đã thanh toán</span>;
      case 'DONE': return <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1 w-max whitespace-nowrap"><CheckCircle size={12}/> Hoàn thành</span>;
      case 'NO_SHOW': return <span className="bg-gray-100 text-gray-700 border border-gray-300 px-3 py-1 rounded-md text-sm font-bold flex items-center gap-1 w-max whitespace-nowrap">No-show</span>;
      case 'CANCELLED': return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-md text-sm font-medium w-max whitespace-nowrap"><Ban size={12}/> Đã hủy</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm font-medium w-max whitespace-nowrap">{status}</span>;
    }
  };

  const getActionButtons = (booking) => {
    if (booking.has_incident) {
      return <button className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md font-medium text-sm transition-colors">Xem sự cố</button>;
    }

    switch (booking.status) {
      case 'PENDING':
        return (
          <div className="flex items-center gap-2">
            <button className="border border-gray-300 text-understory hover:bg-crown px-3 py-1.5 rounded-md font-medium text-sm transition-colors">
              Sửa
            </button>
            <button 
              onClick={() => setActiveModal({ type: 'CHECKIN', data: booking })}
              className="bg-chloro hover:bg-understory text-white px-4 py-1.5 rounded-md font-medium text-sm transition-colors shadow-sm shadow-chloro/20"
            >
              Tiếp nhận
            </button>
          </div>
        );
      case 'COMPLETED_SERVICE':
        return (
          <button 
            onClick={() => setActiveModal({ type: 'PAYMENT', data: booking })}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-2 rounded-md font-bold text-sm transition-colors shadow-sm flex items-center gap-1 whitespace-nowrap"
          >
            <ShieldCheck size={16} /> Thanh toán
          </button>
        );
      case 'PROCESSING':
        return (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveModal({ type: 'SITTER_DIARY', data: booking })}
              className="border border-gray-300 text-understory hover:bg-crown px-3 py-1.5 rounded-md font-medium text-sm transition-colors"
            >
              Xem ghi chú
            </button>
            {booking.service_category === 'Hotel' ? (
              <button 
                onClick={() => setActiveModal({ type: 'PAYMENT', data: booking })}
                className="bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 rounded-md font-bold text-sm transition-colors shadow-sm flex items-center gap-1 whitespace-nowrap"
              >
                <ShieldCheck size={16} /> Thanh toán
              </button>
            ) : (
              <button 
                onClick={() => setActiveModal({ type: 'SERVICELOG', data: booking })}
                className="bg-understory hover:bg-lacustral text-white px-4 py-1.5 rounded-md font-medium text-sm transition-colors"
              >
                Nhật ký
              </button>
            )}
            <button 
              onClick={() => setActiveModal({ type: 'EMERGENCY', data: booking })}
              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-md font-medium text-sm transition-colors border border-red-200 hover:border-red-600"
              title="Báo sự cố"
            >
              <AlertTriangle size={16} />
            </button>
          </div>
        );
      case 'PAID':
        return (
          <button 
            onClick={() => {
              if (window.confirm('Xác nhận bàn giao thú cưng cho khách và kết thúc booking?')) {
                if (window.onHandover) {
                  window.onHandover(booking.booking_id);
                  // Giả lập gửi Webhook N8N để thiết lập kịch bản gửi Email xin đánh giá sau 24h
                  setTimeout(() => {
                    toast.success('Hệ thống đã tự động gửi Webhook để thiết lập kịch bản xin Review sau 24h!', {
                      duration: 4000,
                    });
                  }, 500);
                }
              }
            }}
            className="bg-understory hover:bg-lacustral text-white px-4 py-2 rounded-md font-bold text-sm transition-colors shadow-sm flex items-center gap-1"
          >
            <CheckCircle size={16} /> Bàn giao
          </button>
        );
      default:
        return (
          <button className="border border-gray-300 text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded-md font-medium text-sm transition-colors">
            Xem chi tiết
          </button>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      
      {/* Search & Tabs */}
      <div className="p-4 border-b border-gray-200 bg-crown/50 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <input 
              type="text" 
              placeholder="Tìm theo Số điện thoại, Tên khách, Tên pet..." 
              className="pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:border-chloro focus:ring-1 focus:ring-chloro"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="text-gray-400 absolute right-3 top-2.5" />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {TABS.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'bg-white border border-gray-300 text-understory shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-understory border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-crown">
              <th className="p-4 font-semibold text-lacustral text-sm whitespace-nowrap">Mã Đơn</th>
              <th className="p-4 font-semibold text-lacustral text-sm whitespace-nowrap">Khách hàng</th>
              <th className="p-4 font-semibold text-lacustral text-sm whitespace-nowrap">Thú cưng</th>
              <th className="p-4 font-semibold text-lacustral text-sm whitespace-nowrap">Dịch vụ</th>
              <th className="p-4 font-semibold text-lacustral text-sm whitespace-nowrap">Giờ / Phòng</th>
              <th className="p-4 font-semibold text-lacustral text-sm whitespace-nowrap">Trạng thái</th>
              <th className="p-4 font-semibold text-lacustral text-sm whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">Không tìm thấy đơn nào.</td>
              </tr>
            ) : (
              bookings.map(b => (
                <tr key={b.booking_id} className={`transition-colors ${b.has_incident ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-crown/50'}`}>
                  <td className="p-4 text-sm font-mono text-gray-500">{b.booking_id}</td>
                  <td className="p-4">
                    <p className="font-semibold text-understory">{b.customer_name}</p>
                    <p className="text-xs text-lacustral mt-1">{b.customer_phone}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-understory">{b.pet_name}</p>
                    <p className="text-xs text-lacustral mt-1">{b.pet_type} · {b.pet_breed}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-block border border-gray-200 px-2 py-0.5 rounded text-xs font-semibold text-lacustral mb-1 bg-white">
                      {b.service_category}
                    </span>
                    <p className="text-sm text-understory mt-1">{b.service_name}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-understory">{b.booking_time}</p>
                    {b.room_or_slot_id && <p className="text-xs text-lacustral mt-1">{b.room_or_slot_id}</p>}
                    {b.assigned_staff_name && <p className="text-xs text-lacustral mt-1">NV: {b.assigned_staff_name}</p>}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(b.status, b.has_incident, b.service_category)}
                  </td>
                  <td className="p-4">
                    {getActionButtons(b)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {activeModal.type === 'CHECKIN' && (
        <CheckInModal 
          booking={activeModal.data} 
          onClose={() => setActiveModal({ type: null, data: null })} 
          onConfirm={(data) => {
            onCheckIn(activeModal.data.booking_id, data);
            setActiveModal({ type: null, data: null });
          }}
        />
      )}

      {activeModal.type === 'SERVICELOG' && (
        <ServiceLogModal 
          booking={activeModal.data} 
          onClose={() => setActiveModal({ type: null, data: null })} 
          onConfirm={(data) => {
            onServiceLog(activeModal.data.booking_id, data);
            setActiveModal({ type: null, data: null });
          }}
        />
      )}

      {activeModal.type === 'CHECKOUT' && (
        <CheckoutModal 
          booking={activeModal.data} 
          onClose={() => setActiveModal({ type: null, data: null })} 
          onConfirm={(data) => {
            onCheckout(activeModal.data.booking_id, data);
            setActiveModal({ type: null, data: null });
          }}
        />
      )}

      {activeModal.type === 'EMERGENCY' && (
        <EmergencyModal 
          booking={activeModal.data} 
          onClose={() => setActiveModal({ type: null, data: null })} 
          onConfirm={(data) => {
            onReportIncident(activeModal.data.booking_id, data);
            setActiveModal({ type: null, data: null });
          }}
        />
      )}

      {activeModal.type === 'SITTER_DIARY' && (
        <SitterDiaryModal 
          booking={activeModal.data}
          onClose={() => setActiveModal({ type: null, data: null })}
        />
      )}

      {activeModal.type === 'PAYMENT' && (
        <PaymentModal 
          booking={activeModal.data}
          onClose={() => setActiveModal({ type: null, data: null })}
          onConfirm={(data) => {
            if (onCheckout) onCheckout(activeModal.data.booking_id, data);
            setActiveModal({ type: null, data: null });
          }}
        />
      )}
    </div>
  );
}
