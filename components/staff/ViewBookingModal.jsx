import { useState } from 'react';
import { X, Calendar, Clock, MapPin, Tag, AlertTriangle, CheckCircle, CheckSquare, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import CancelBookingModal from './CancelBookingModal';

export default function ViewBookingModal({ booking, onClose, onUpdateStatus }) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!booking) return null;

  const handleConfirmCancel = (id, cancelData) => {
    if (onUpdateStatus) {
      onUpdateStatus(id, 'CANCELLED');
    }
    setShowCancelModal(false);
    onClose();
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

  return (
    <>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-understory">Chi tiết Booking: {booking.booking_id}</h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">Trạng thái:</span>
              {getStatusBadge(booking.status, booking.service_type || booking.service_category)}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">Thông tin Khách hàng</h3>
              <div>
                <p className="text-sm text-gray-500">Họ tên</p>
                <p className="font-semibold text-gray-900">{booking.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-semibold text-gray-900">{booking.customer_phone}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">Thông tin Thú cưng</h3>
              <div>
                <p className="text-sm text-gray-500">Tên thú cưng</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">{booking.pet_type === 'Mèo' ? '🐈' : '🐕'}</span> {booking.pet_name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Loài / Giống</p>
                  <p className="font-semibold text-gray-900">{booking.pet_type} - {booking.pet_breed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cân nặng</p>
                  <p className="font-semibold text-gray-900">{booking.pet_weight}kg</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h3 className="font-bold text-understory mb-4 flex items-center gap-2">
              <Tag size={18}/> Chi tiết Dịch vụ
            </h3>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-sm text-gray-500">Dịch vụ</p>
                <p className="font-semibold text-gray-900">{booking.service_type || booking.service_category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thời gian</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <Clock size={14}/> {booking.booking_time}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Slot / Phòng</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1">
                  <MapPin size={14}/> {booking.room_or_slot_id || 'Chưa xếp'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng tiền tạm tính</p>
                <p className="font-bold text-[#1a66cc]">{(booking.total_amount || 0).toLocaleString('vi-VN')}đ</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tiền cọc</p>
                <p className="font-bold text-[#4c9535]">{(booking.deposit_amount || 0).toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
            
            {booking.addons && booking.addons.length > 0 && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Dịch vụ phát sinh thêm:</p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  {booking.addons.map((a, i) => (
                    <li key={i}>{a.addon_name} - {a.price.toLocaleString('vi-VN')}đ</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between gap-3 items-center">
          <div>
            {booking.status === 'CONFIRMED' && (
              <button 
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 border border-red-200 text-red-600 bg-red-50 rounded-xl font-semibold hover:bg-red-100 hover:text-red-700 transition-colors flex items-center gap-2"
              >
                <AlertTriangle size={18} /> Hủy Booking
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition-colors"
            >
            Đóng
          </button>
          {booking.status === 'PROCESSING' && onUpdateStatus && (
            <button 
              onClick={() => onUpdateStatus(booking.booking_id, 'COMPLETED_SERVICE')}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-indigo-600 transition-colors shadow-md shadow-purple-500/20"
            >
              Hoàn tất dịch vụ (Phục vụ xong)
            </button>
          )}
        </div>
        </div>

      </div>
    </div>
    
    {showCancelModal && (
      <CancelBookingModal 
        booking={booking} 
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
      />
    )}
    </>
  );
}
