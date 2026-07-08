import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatVND } from '@/utils/format';

export default function ExtendStayModal({ booking, onClose, onConfirm }) {
  const [newCheckoutDate, setNewCheckoutDate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [selectedNewRoom, setSelectedNewRoom] = useState('');

  const handleCheckRoom = () => {
    if (!newCheckoutDate) return;
    setIsChecking(true);
    setCheckResult(null);

    // Giả lập logic kiểm tra phòng
    setTimeout(() => {
      setIsChecking(false);
      const current = new Date(booking.checkout_date);
      const extend = new Date(newCheckoutDate);
      const diffDays = Math.ceil((extend - current) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        setCheckResult({ error: 'Ngày gia hạn phải sau ngày checkout hiện tại!' });
      } else if (diffDays <= 2) {
        setCheckResult({ 
          success: true, 
          message: `Phòng ${booking.room_or_slot_id} vẫn còn trống trong khoảng thời gian này.`,
          newRoom: booking.room_or_slot_id,
          extraFee: diffDays * 250000 // Giả lập 250k/ngày
        });
      } else {
        // Giả lập kẹt phòng nếu gia hạn quá 2 ngày
        const suggestRoom = booking.room_or_slot_id === 'Phòng L01' ? 'Phòng M02' : 'Phòng L01';
        const mockAvailableRooms = ['Phòng M02', 'Phòng M03', 'Phòng L01', 'Phòng L02', 'Phòng VIP 01'].filter(r => r !== booking.room_or_slot_id);
        
        setCheckResult({ 
          success: true, 
          isChanged: true,
          message: `Phòng ${booking.room_or_slot_id} đã có người đặt. Đề xuất đổi sang ${suggestRoom}.`,
          newRoom: suggestRoom,
          availableRooms: mockAvailableRooms,
          extraFee: diffDays * 250000 
        });
        setSelectedNewRoom(suggestRoom);
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkResult || checkResult.error) return;
    
    onConfirm({
      new_checkout_date: newCheckoutDate,
      new_room: checkResult.isChanged ? selectedNewRoom : checkResult.newRoom,
      extra_fee: checkResult.extraFee
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-understory">Gia hạn lưu trú</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
              <div>
                <p className="text-xs text-lacustral">Thú cưng</p>
                <h3 className="font-bold text-understory">{booking.pet_name}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-lacustral">Phòng hiện tại</p>
                <p className="font-bold text-understory">{booking.room_or_slot_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-understory mb-1">Ngày check-out cũ</label>
                <input 
                  type="date" 
                  value={booking.checkout_date}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-200 bg-gray-100 rounded-lg text-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-understory mb-1">Ngày check-out mới</label>
                <input 
                  type="date" 
                  value={newCheckoutDate}
                  onChange={(e) => { setNewCheckoutDate(e.target.value); setCheckResult(null); }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc]"
                  required
                />
              </div>
            </div>

            <button 
              type="button"
              onClick={handleCheckRoom}
              disabled={!newCheckoutDate || isChecking}
              className="w-full py-2 bg-[#1a66cc]/10 text-[#1a66cc] font-bold rounded-lg transition-colors hover:bg-[#1a66cc]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CalendarIcon size={16} /> {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra phòng'}
            </button>

            {checkResult && (
              <div className={`p-4 rounded-xl border text-sm mt-4 animate-in slide-in-from-top-2 ${
                checkResult.error ? 'bg-red-50 border-red-200 text-red-700' : 
                checkResult.isChanged ? 'bg-orange-50 border-orange-200 text-orange-800' : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                {checkResult.error ? (
                  <p className="flex items-center gap-2 font-medium"><AlertTriangle size={16}/> {checkResult.error}</p>
                ) : (
                  <>
                    <p className="flex items-start gap-2 font-medium mb-2">
                      {checkResult.isChanged ? <AlertTriangle size={16} className="shrink-0 mt-0.5"/> : <CheckCircle size={16} className="shrink-0 mt-0.5"/>}
                      {checkResult.message}
                    </p>

                    {checkResult.isChanged && checkResult.availableRooms && (
                      <div className="mt-3 bg-white p-3 rounded-lg border border-orange-100 mb-3">
                        <label className="block text-xs font-bold text-gray-700 mb-2">Danh sách phòng trống phù hợp:</label>
                        <select 
                          value={selectedNewRoom}
                          onChange={(e) => setSelectedNewRoom(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc]"
                        >
                          {checkResult.availableRooms.map(room => (
                            <option key={room} value={room}>{room} (Trống)</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="border-t border-black/10 pt-2 mt-2">
                      <p className="flex justify-between">
                        <span>Chi phí gia hạn dự kiến:</span>
                        <span className="font-bold">{formatVND(checkResult.extraFee)}</span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 text-gray-600 font-semibold hover:bg-gray-200 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={!checkResult || checkResult.error}
              className="px-6 py-2 bg-[#1a66cc] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Xác nhận gia hạn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
