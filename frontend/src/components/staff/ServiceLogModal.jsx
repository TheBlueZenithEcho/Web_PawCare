import { useState } from 'react';
import { X, Check, Camera, Info } from 'lucide-react';

export default function ServiceLogModal({ booking, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    after_weight: booking.pet_weight || '',
    pet_behavior: '',
    food_consumption_percentage: 100,
    playtime_minutes: 30,
    after_photos: []
  });

  const isHotel = booking.service_category === 'Hotel' || booking.service_type === 'Hotel';

  const handleSubmit = () => {
    const logData = {
      after_weight: parseFloat(formData.after_weight),
      pet_behavior: formData.pet_behavior,
      after_photos: formData.after_photos
    };

    if (isHotel) {
      logData.hotel_diary = {
        food_consumption_percentage: parseInt(formData.food_consumption_percentage),
        playtime_minutes: parseInt(formData.playtime_minutes)
      };
    }

    onConfirm(logData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-understory">Cập nhật Nhật ký dịch vụ — #{booking.booking_id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-crown rounded-full transition-colors text-lacustral">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 bg-crown/50 space-y-5 max-h-[70vh] overflow-y-auto">
          
          <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-chloro/20">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl shadow-sm border border-white shrink-0 overflow-hidden">
              {booking.pet?.pet_ava ? (
                <img src={booking.pet.pet_ava} alt="Pet avatar" className="w-full h-full object-cover" />
              ) : (
                booking.pet?.species === 'cat' ? '🐈' : '🐕'
              )}
            </div>
            <div>
              <h3 className="font-bold text-understory">{booking.pet_name}</h3>
              <p className="text-chloro text-xs font-medium">{booking.service_name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-lacustral mb-1.5">Cân nặng sau ca (kg)</label>
              <input 
                type="number" 
                value={formData.after_weight} 
                onChange={(e) => setFormData({...formData, after_weight: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chloro outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-lacustral mb-1.5">Trạng thái tinh thần</label>
              <input 
                type="text" 
                placeholder="Ngoan, hợp tác, cắn..." 
                value={formData.pet_behavior}
                onChange={(e) => setFormData({...formData, pet_behavior: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chloro outline-none" 
              />
            </div>
          </div>

          {isHotel && (
            <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-4">
              <h4 className="font-semibold text-understory flex items-center gap-2">
                <Info size={16} className="text-chloro" /> Nhật ký Hotel (Sitter)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-lacustral mb-1.5">Lượng thức ăn tiêu thụ (%)</label>
                  <input 
                    type="number" 
                    min="0" max="100"
                    value={formData.food_consumption_percentage}
                    onChange={(e) => setFormData({...formData, food_consumption_percentage: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chloro outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-lacustral mb-1.5">Thời gian vận động (phút)</label>
                  <input 
                    type="number" 
                    value={formData.playtime_minutes}
                    onChange={(e) => setFormData({...formData, playtime_minutes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chloro outline-none" 
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-lacustral mb-1.5">Ảnh thành phẩm / Sinh hoạt</label>
            <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-lacustral hover:text-chloro hover:border-chloro hover:bg-chloro/5 transition-colors flex flex-col items-center justify-center gap-2 bg-white">
              <Camera size={24} />
              <span className="font-semibold">Upload ảnh (Bắt buộc)</span>
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-lacustral rounded-lg font-semibold hover:bg-crown transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 bg-understory text-white rounded-lg font-semibold hover:bg-chloro transition-colors flex items-center gap-2 shadow-md shadow-understory/20"
          >
            <Check size={18} /> Cập nhật & Chuyển "Phục vụ xong"
          </button>
        </div>

      </div>
    </div>
  );
}
