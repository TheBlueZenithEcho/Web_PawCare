import { useState } from 'react';
import { X, Check, Calculator } from 'lucide-react';
import { formatVND } from '@/data/api';

export default function CheckoutModal({ booking, onClose, onConfirm }) {
  const totalBase = booking.total_amount || 0;
  
  const [formData, setFormData] = useState({
    late_fee: 0,
    additional_fee: 0,
    additional_notes: '',
    voucher_code: '',
    discount_amount: 0,
    payment_method: 'CASH'
  });

  const finalTotal = totalBase 
    + parseFloat(formData.late_fee || 0) 
    + parseFloat(formData.additional_fee || 0) 
    - parseFloat(formData.discount_amount || 0)
    - (booking.deposit_amount || 0);

  const handleSubmit = () => {
    onConfirm({
      ...formData,
      late_fee: parseFloat(formData.late_fee || 0),
      additional_fee: parseFloat(formData.additional_fee || 0),
      discount_amount: parseFloat(formData.discount_amount || 0),
      final_amount: finalTotal
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-understory">Thanh toán & Trả khách — {booking.booking_id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-crown rounded-full transition-colors text-lacustral">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 bg-crown/50 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Pet Card */}
          <div className="bg-white border border-chloro/20 rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-xantho/50 rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">
                {booking.pet_type === 'Mèo' ? '🐈' : '🐕'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-understory">{booking.pet_name}</h3>
                <p className="text-chloro text-xs font-medium">{booking.customer_name} · {booking.customer_phone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-lacustral">Dịch vụ</p>
              <p className="font-semibold text-understory text-sm">{booking.service_name}</p>
            </div>
          </div>

          {/* Billing Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-lacustral font-medium">Tiền dịch vụ gốc ({booking.service_name})</span>
              <span className="font-semibold text-understory">{formatVND(totalBase - (booking.addons_detail?.reduce((sum, a) => sum + a.price, 0) || 0))}</span>
            </div>
            
            {booking.addons_detail && booking.addons_detail.length > 0 && (
              <div className="pt-2 border-t border-dashed border-gray-100">
                <p className="text-xs font-semibold text-lacustral mb-2">Dịch vụ phát sinh lúc Check-in:</p>
                {booking.addons_detail.map((addon, idx) => (
                  <div key={idx} className="flex justify-between items-center text-understory text-sm mb-1 pl-2">
                    <span>+ {addon.name}</span>
                    <span className="font-semibold">{formatVND(addon.price)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-lacustral mb-1">Phí đón trễ (VNĐ)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={formData.late_fee}
                    onChange={e => setFormData({...formData, late_fee: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-chloro outline-none text-sm" 
                  />
                  <button 
                    onClick={() => setFormData({...formData, late_fee: 30000})}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-medium rounded-md text-gray-700 transition-colors"
                  >
                    Gợi ý: 30k
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-lacustral mb-1">Phí lẻ (Tã, súp...)</label>
                  <input 
                    type="number" 
                    value={formData.additional_fee}
                    onChange={e => setFormData({...formData, additional_fee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-chloro outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-lacustral mb-1">Mã giảm giá</label>
                  <input 
                    type="text" 
                    placeholder="VOUCHER10"
                    value={formData.voucher_code}
                    onChange={e => setFormData({...formData, voucher_code: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-chloro outline-none text-sm uppercase" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-lacustral mb-1">Số tiền giảm (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.discount_amount}
                    onChange={e => setFormData({...formData, discount_amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-chloro outline-none text-sm" 
                  />
                </div>
              </div>
            </div>

            {parseFloat(formData.discount_amount) > 0 && (
              <div className="flex justify-between items-center text-orange-500 text-sm pt-2">
                <span className="font-medium">Giảm giá voucher</span>
                <span className="font-semibold">-{formatVND(formData.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-chloro text-sm pt-4 border-t border-gray-200">
              <span className="font-medium">Đã đặt cọc</span>
              <span className="font-semibold">-{formatVND(booking.deposit_amount || 0)}</span>
            </div>
            
            <div className="flex justify-between items-center pt-3">
              <span className="font-bold text-understory">TỔNG THANH TOÁN</span>
              <span className="font-bold text-2xl text-chloro">{formatVND(finalTotal > 0 ? finalTotal : 0)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-lacustral mb-2 uppercase tracking-wider">Phương thức thanh toán</label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${formData.payment_method === 'CASH' ? 'border-chloro bg-chloro/5 ring-1 ring-chloro' : 'border-gray-200 hover:border-chloro/50 bg-white'}`}>
                <input type="radio" name="payment" className="hidden" checked={formData.payment_method === 'CASH'} onChange={() => setFormData({...formData, payment_method: 'CASH'})} />
                <span className="font-semibold text-sm text-understory block">Tiền mặt</span>
              </label>
              <label className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${formData.payment_method === 'VNPAY' ? 'border-chloro bg-chloro/5 ring-1 ring-chloro' : 'border-gray-200 hover:border-chloro/50 bg-white'}`}>
                <input type="radio" name="payment" className="hidden" checked={formData.payment_method === 'VNPAY'} onChange={() => setFormData({...formData, payment_method: 'VNPAY'})} />
                <span className="font-semibold text-sm text-understory block">VNPay</span>
              </label>
              <label className={`border rounded-xl p-3 text-center cursor-pointer transition-all ${formData.payment_method === 'MOMO' ? 'border-chloro bg-chloro/5 ring-1 ring-chloro' : 'border-gray-200 hover:border-chloro/50 bg-white'}`}>
                <input type="radio" name="payment" className="hidden" checked={formData.payment_method === 'MOMO'} onChange={() => setFormData({...formData, payment_method: 'MOMO'})} />
                <span className="font-semibold text-sm text-understory block">MoMo</span>
              </label>
            </div>
            
            {/* QR Code Display */}
            {formData.payment_method === 'VNPAY' && (
              <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded-xl flex flex-col items-center animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-bold text-blue-800 mb-2">Quét mã VNPay</p>
                <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-sm border border-blue-100 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="VNPay QR" className="w-full h-full opacity-80" />
                </div>
                <p className="text-xs text-blue-600 mt-2 text-center">Sử dụng ứng dụng ngân hàng hoặc ví VNPay để quét mã.</p>
              </div>
            )}
            
            {formData.payment_method === 'MOMO' && (
              <div className="mt-4 p-4 border border-pink-200 bg-pink-50 rounded-xl flex flex-col items-center animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-bold text-pink-800 mb-2">Quét mã MoMo</p>
                <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-sm border border-pink-100 flex items-center justify-center">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="MoMo QR" className="w-full h-full opacity-80" />
                </div>
                <p className="text-xs text-pink-600 mt-2 text-center">Mở ứng dụng MoMo và chọn "Quét mã".</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          <button 
            onClick={handleSubmit}
            className="w-full py-3.5 bg-chloro text-white rounded-xl font-bold hover:bg-understory transition-colors flex items-center justify-center gap-2 shadow-md shadow-chloro/20"
          >
            <Calculator size={18} /> Xác nhận thanh toán & Xuất hóa đơn
          </button>
        </div>

      </div>
    </div>
  );
}
