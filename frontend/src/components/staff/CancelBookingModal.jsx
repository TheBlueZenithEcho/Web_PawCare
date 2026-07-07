import { useState } from 'react';
import { X, AlertTriangle, HelpCircle, ShieldAlert } from 'lucide-react';
import { formatVND, reportIncident } from '@/services/mock/mockApi';
import { useRouter } from 'next/router';

export default function CancelBookingModal({ booking, onClose, onConfirmCancel }) {
  const [cancelTimeframe, setCancelTimeframe] = useState('MORE_THAN_3_DAYS');
  const router = useRouter();
  
  if (!booking) return null;

  const deposit = booking.deposit_amount || 0;
  
  let refundAmount = 0;
  let refundPercentage = 0;

  if (deposit > 0) {
    if (cancelTimeframe === 'MORE_THAN_3_DAYS') {
      refundPercentage = 100;
      refundAmount = deposit;
    } else if (cancelTimeframe === 'BETWEEN_1_AND_3_DAYS') {
      refundPercentage = 50;
      refundAmount = deposit * 0.5;
    } else {
      refundPercentage = 0;
      refundAmount = 0;
    }
  }

  const handleConfirm = () => {
    onConfirmCancel(booking.booking_id, {
      refundAmount,
      cancelTimeframe
    });
  };

  const handleReportAdmin = async () => {
    const timeframeText = cancelTimeframe === 'MORE_THAN_3_DAYS' 
      ? 'Trước 3 ngày' 
      : cancelTimeframe === 'BETWEEN_1_AND_3_DAYS' 
        ? 'Trước 1-3 ngày' 
        : 'Trong vòng 24h';
        
    await reportIncident(booking.booking_id, {
      incident_type: 'REFUND',
      status: 'HANDLING',
      description: `Yêu cầu hủy Booking có cọc. Khách báo hủy ở mốc: ${timeframeText}. Cần hoàn trả: ${formatVND(refundAmount)} (${refundPercentage}% cọc).`
    });
    onClose();
    router.push('/staff/emergency?tab=HANDLING');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl w-full ${deposit > 0 ? 'max-w-3xl' : 'max-w-lg'} flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-red-700">Hủy Booking</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className={`grid gap-6 ${deposit > 0 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* Left Column (or full if no deposit) */}
            <div className="space-y-6 flex flex-col">
              <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 border border-gray-100">
                <p><strong>Mã Đơn:</strong> <span className="text-gray-900 font-bold">{booking.booking_id}</span></p>
                <p><strong>Khách hàng:</strong> {booking.customer_name} ({booking.customer_phone})</p>
                <p><strong>Dịch vụ:</strong> {booking.service_type || booking.service_category}</p>
                <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                  <span>Tổng tiền tạm tính: <strong className="text-gray-900">{formatVND(booking.total_amount || 0)}</strong></span>
                  <span>Tiền cọc: <strong className={deposit > 0 ? "text-red-600 font-bold" : "text-[#4c9535]"}>{formatVND(deposit)}</strong></span>
                </div>
              </div>

              {deposit > 0 && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200 flex gap-3 items-start mt-auto">
                  <ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <h3 className="font-bold text-red-800 text-sm">Booking có cọc</h3>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">
                      Nhân viên không có quyền trực tiếp xử lý hoàn tiền cọc. Vui lòng chuyển thông tin sang luồng <strong>Khẩn cấp & Sự cố</strong> để Admin quyết định.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (only if deposit) */}
            {deposit > 0 && (
              <div className="space-y-5 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 pt-6 md:pt-0 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-1">
                    Thời điểm hủy so với lịch check-in <HelpCircle size={14} className="text-gray-400" title="Giả lập mốc thời gian để tính hoàn cọc"/>
                  </h3>
                  
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${cancelTimeframe === 'MORE_THAN_3_DAYS' ? 'border-[#4c9535] bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="timeframe" 
                        checked={cancelTimeframe === 'MORE_THAN_3_DAYS'}
                        onChange={() => setCancelTimeframe('MORE_THAN_3_DAYS')}
                        className="w-4 h-4 text-[#4c9535] focus:ring-[#4c9535]"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Hủy trước 3 ngày</p>
                        <p className="text-xs text-gray-500">Hoàn 100% tiền cọc</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${cancelTimeframe === 'BETWEEN_1_AND_3_DAYS' ? 'border-[#4c9535] bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="timeframe" 
                        checked={cancelTimeframe === 'BETWEEN_1_AND_3_DAYS'}
                        onChange={() => setCancelTimeframe('BETWEEN_1_AND_3_DAYS')}
                        className="w-4 h-4 text-[#4c9535] focus:ring-[#4c9535]"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Hủy trước 1 ngày (24h - 72h)</p>
                        <p className="text-xs text-gray-500">Hoàn 50% tiền cọc</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${cancelTimeframe === 'LESS_THAN_24_HOURS' ? 'border-[#4c9535] bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="timeframe" 
                        checked={cancelTimeframe === 'LESS_THAN_24_HOURS'}
                        onChange={() => setCancelTimeframe('LESS_THAN_24_HOURS')}
                        className="w-4 h-4 text-[#4c9535] focus:ring-[#4c9535]"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Hủy trong vòng 24 giờ</p>
                        <p className="text-xs text-gray-500">Không hoàn cọc</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex justify-between items-center mt-auto">
                  <div>
                    <p className="text-sm font-semibold text-red-800">Số tiền hoàn trả khách</p>
                    <p className="text-xs text-red-600/80 mt-0.5">({refundPercentage}% tiền cọc)</p>
                  </div>
                  <p className="text-2xl font-bold text-red-700">{formatVND(refundAmount)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition-colors"
          >
            Hủy
          </button>
          {deposit > 0 ? (
            <button 
              onClick={handleReportAdmin}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <AlertTriangle size={18} />
              Báo Admin
            </button>
          ) : (
            <button 
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-sm"
            >
              Xác nhận Hủy Booking
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
