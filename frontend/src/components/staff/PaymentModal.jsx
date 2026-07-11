import React, { useState } from 'react';
import { X, Receipt } from 'lucide-react';
import { formatVND } from '@/utils/format';
import { toast } from 'sonner';

export default function PaymentModal({ booking, onClose, onConfirm }) {
  // Tự động tính phí trả trễ cho Hotel (ví dụ: 250k/ngày)
  const calculateInitialLateFee = () => {
    if (booking.booking_type !== 'Hotel') return 0;
    const checkoutStr = booking.booking_room?.[0]?.check_out_date || booking.checkout_date;
    if (!checkoutStr) return 0;
    
    const checkoutDate = new Date(checkoutStr);
    checkoutDate.setHours(23, 59, 59, 999); // Trễ tính từ ngày hôm sau
    
    const now = new Date();
    if (now > checkoutDate) {
      const diffDays = Math.ceil((now - checkoutDate) / (1000 * 60 * 60 * 24));
      return diffDays * 250000;
    }
    return 0;
  };

  const [lateFee, setLateFee] = useState(calculateInitialLateFee());
  const [extraFee, setExtraFee] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');

  const baseAmount = booking.total_bill || 0;
  const newTotalBill = baseAmount + Number(lateFee) + Number(extraFee) - Number(discountAmount);
  const totalAmount = newTotalBill - (booking.deposit_amount || 0);
  
  const customerName = `${booking.customer?.last_name || ''} ${booking.customer?.first_name || ''}`;
  const serviceName = booking.booking_service?.[0]?.service?.service_name || booking.booking_type || 'Grooming';

  const handleSubmit = (e) => {
    e.preventDefault();

    // Giả lập gửi Webhook N8N xuất hóa đơn điện tử
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Đang xử lý & gửi hóa đơn điện tử qua Email (Webhook)...',
        success: 'Thanh toán thành công. Đã tự động gửi hóa đơn cho khách!',
        error: 'Có lỗi xảy ra'
      }
    );

    setTimeout(() => {
      onConfirm({
        payment_method: paymentMethod,
        new_total_bill: newTotalBill,
        total_paid: totalAmount > 0 ? totalAmount : 0,
        fees: { lateFee, extraFee, discountAmount, discountCode }
      });
    }, 1500); // Chờ 1.5s để mô phỏng webhook
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-understory flex items-center gap-2">
            Thanh toán & Trả khách — {booking.booking_id}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-6">
            
            {/* Summary */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                {booking.pet?.pet_ava ? (
                  <img src={booking.pet.pet_ava} alt="Pet avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-gray-100">
                    {booking.pet?.species === 'cat' ? '🐈' : '🐕'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-understory">{booking.pet?.pet_name}</h3>
                  <p className="text-xs text-gray-500">{customerName} · {booking.customer?.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-500">Dịch vụ</p>
                <p className="text-sm font-bold text-understory">{serviceName}</p>
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-sm text-gray-600 font-medium">Tiền dịch vụ gốc ({serviceName})</span>
                <span className="font-bold text-understory">{formatVND(baseAmount)}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-understory mb-1">Phí đón trễ (VNĐ)</label>
                  <input 
                    type="number" 
                    value={lateFee}
                    onChange={(e) => setLateFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-understory mb-1 opacity-0">Gợi ý</label>
                  <div className="px-3 py-2 text-sm bg-gray-50 rounded-lg text-gray-500 text-center">Gợi ý: 30k</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-understory mb-1">Phí lẻ (Tã, súp...)</label>
                  <input 
                    type="number" 
                    value={extraFee}
                    onChange={(e) => setExtraFee(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-understory mb-1">Mã giảm giá</label>
                  <input 
                    type="text" 
                    placeholder="VOUCHER10"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-understory mb-1">Số tiền giảm (VNĐ)</label>
                  <input 
                    type="number" 
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc]"
                  />
                </div>
              </div>

              {booking.deposit_amount > 0 && (
                <div className="flex justify-between items-center pt-2 text-[#10b981]">
                  <span className="text-sm font-medium">Đã đặt cọc</span>
                  <span className="font-bold">-{formatVND(booking.deposit_amount)}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="font-bold text-understory">TỔNG THANH TOÁN</span>
                <span className="text-xl font-black text-[#10b981]">{formatVND(totalAmount > 0 ? totalAmount : 0)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-understory mb-2 uppercase tracking-wide">Phương thức thanh toán</label>
              <div className="grid grid-cols-3 gap-3">
                {['Tiền mặt', 'VNPay', 'MoMo'].map(method => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-sm font-bold rounded-lg border transition-all ${paymentMethod === method ? 'border-understory text-understory shadow-sm ring-1 ring-understory' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Display */}
            {paymentMethod === 'VNPay' && (
              <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-xl flex flex-col items-center animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-bold text-blue-800 mb-2">Quét mã VNPay</p>
                <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-sm border border-blue-100 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="VNPay QR" className="w-full h-full opacity-80" />
                </div>
                <p className="text-xs text-blue-600 mt-2 text-center">Sử dụng ứng dụng ngân hàng hoặc ví VNPay để quét mã.</p>
              </div>
            )}
            
            {paymentMethod === 'MoMo' && (
              <div className="mt-4 p-4 border border-pink-200 bg-pink-50 rounded-xl flex flex-col items-center animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-bold text-pink-800 mb-2">Quét mã MoMo</p>
                <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-sm border border-pink-100 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="MoMo QR" className="w-full h-full opacity-80" />
                </div>
                <p className="text-xs text-pink-600 mt-2 text-center">Mở ứng dụng MoMo và chọn "Quét mã".</p>
              </div>
            )}

          </div>

          <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3">
            <button 
              type="submit" 
              className="flex-1 bg-[#65a30d] hover:bg-[#4d7c0f] text-white py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Receipt size={18} /> Xác nhận thanh toán & Xuất hóa đơn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
