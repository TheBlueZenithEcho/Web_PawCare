import { useState, useEffect } from 'react';
import { X, Check, Search, Calendar, ChevronRight, Activity, Camera, AlertTriangle, Plus } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import { formatVND, fetchServices } from '@/data/api';

export default function CheckInModal({ booking, onClose, onConfirm }) {
  const [step, setStep] = useState(1);
  const [availableServices, setAvailableServices] = useState([]);
  const [isAddingService, setIsAddingService] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [isAgreed, setIsAgreed] = useState(false);
  
  // Form Data Bước 2
  const [formData, setFormData] = useState({
    weight: booking.pet_weight || '',
    clinical_status: {
      skin: '',
      hair: '',
      ears: '',
      eyes: '',
      nails: '',
      wounds: ''
    },
    reception_notes: booking.reception_notes || '',
    before_photos: []
  });

  useEffect(() => {
    fetchServices().then(data => setAvailableServices(data));
  }, []);

  const steps = [
    { num: 1, label: 'Xác nhận thông tin' },
    { num: 2, label: 'Kiểm tra lâm sàng' },
    { num: 3, label: 'Xác nhận dịch vụ' }
  ];

  const handleToggleAddon = (serviceId) => {
    setSelectedAddons(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const getAddonsTotal = () => {
    return selectedAddons.reduce((sum, id) => {
      const s = availableServices.find(s => s.id === id);
      return sum + (s?.price || 0);
    }, 0);
  };

  const finalTotal = (booking.total_amount || 0) + getAddonsTotal();

  const handleSubmit = () => {
    onConfirm({
      ...formData,
      weight: parseFloat(formData.weight),
      addons: selectedAddons,
      total_amount: finalTotal
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-understory">Tiếp nhận thú cưng — {booking.booking_id}</h2>
          <button onClick={onClose} className="p-2 hover:bg-crown rounded-full transition-colors text-lacustral">
            <X size={20} />
          </button>
        </div>

        {/* Stepper */}
        <div className="px-8 py-5 flex items-center justify-center gap-4 border-b border-gray-50">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step >= s.num ? 'bg-chloro text-white' : 'bg-crown border border-gray-200 text-gray-400'
              }`}>
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span className={`text-sm font-semibold ${step >= s.num ? 'text-chloro' : 'text-gray-400'}`}>
                {s.label}
              </span>
              {i < steps.length - 1 && <div className={`w-12 h-px ${step > s.num ? 'bg-chloro' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto bg-crown/50 flex-1">
          {step === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-lacustral mb-1">Khách hàng</p>
                  <p className="font-bold text-understory text-lg">{booking.customer_name}</p>
                  <p className="text-lacustral">{booking.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-lacustral mb-1">Loại dịch vụ</p>
                  <p className="font-bold text-understory text-lg">{booking.service_category}</p>
                  <p className="text-lacustral">{booking.service_name}</p>
                </div>
                <div>
                  <p className="text-sm text-lacustral mb-1">Groomer / Phòng</p>
                  <p className="font-bold text-understory text-lg">{booking.assigned_staff_name || booking.room_or_slot_id || 'Chưa xếp'}</p>
                </div>
                <div>
                  <p className="text-sm text-lacustral mb-1">Tiền cọc</p>
                  <p className="font-bold text-understory text-lg">{booking.deposit_amount ? formatVND(booking.deposit_amount) : 'Không cọc'}</p>
                </div>
              </div>

              {/* Pet Card */}
              <div className="bg-white border border-chloro/20 rounded-xl p-5 shadow-sm">
                <div className="flex gap-4 items-center mb-5">
                  <div className="w-14 h-14 bg-xantho/50 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                    {booking.pet_type === 'Mèo' ? '🐈' : '🐕'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-understory">{booking.pet_name}</h3>
                    <p className="text-chloro text-sm font-medium">{booking.pet_type} · {booking.pet_breed}</p>
                  </div>
                </div>

                {booking.reception_notes && (
                  <div className="bg-xantho/30 border border-xantho text-understory p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertTriangle size={16} className="text-oleander shrink-0 mt-0.5" />
                    <p><span className="font-bold">Lưu ý lúc đặt lịch:</span> {booking.reception_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-lacustral mb-1.5">Cân nặng đầu vào (kg)</label>
                <input 
                  type="number" 
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chloro outline-none" 
                />
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-understory mb-4">Khám lâm sàng (6 Chỉ số)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">1. Tình trạng Da</label>
                    <input 
                      type="text" 
                      placeholder="Bình thường, mẩn đỏ, viêm..." 
                      value={formData.clinical_status.skin}
                      onChange={e => setFormData({
                        ...formData, 
                        clinical_status: {...formData.clinical_status, skin: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-chloro focus:ring-1 focus:ring-chloro outline-none bg-gray-50/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">2. Tình trạng Lông</label>
                    <input 
                      type="text" 
                      placeholder="Bình thường, xơ xác, ve rận..." 
                      value={formData.clinical_status.hair}
                      onChange={e => setFormData({
                        ...formData, 
                        clinical_status: {...formData.clinical_status, hair: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-chloro focus:ring-1 focus:ring-chloro outline-none bg-gray-50/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">3. Tình trạng Tai</label>
                    <input 
                      type="text" 
                      placeholder="Bình thường, có rận tai, nấm..." 
                      value={formData.clinical_status.ears}
                      onChange={e => setFormData({
                        ...formData, 
                        clinical_status: {...formData.clinical_status, ears: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-chloro focus:ring-1 focus:ring-chloro outline-none bg-gray-50/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">4. Tình trạng Mắt</label>
                    <input 
                      type="text" 
                      placeholder="Bình thường, chảy dịch..." 
                      value={formData.clinical_status.eyes}
                      onChange={e => setFormData({
                        ...formData, 
                        clinical_status: {...formData.clinical_status, eyes: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-chloro focus:ring-1 focus:ring-chloro outline-none bg-gray-50/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">5. Tình trạng Móng</label>
                    <input 
                      type="text" 
                      placeholder="Bình thường, dài, xước..." 
                      value={formData.clinical_status.nails}
                      onChange={e => setFormData({
                        ...formData, 
                        clinical_status: {...formData.clinical_status, nails: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-chloro focus:ring-1 focus:ring-chloro outline-none bg-gray-50/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">6. Vết thương ngoài da</label>
                    <input 
                      type="text" 
                      placeholder="Không có, hoặc ghi vị trí..." 
                      value={formData.clinical_status.wounds}
                      onChange={e => setFormData({
                        ...formData, 
                        clinical_status: {...formData.clinical_status, wounds: e.target.value}
                      })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-chloro focus:ring-1 focus:ring-chloro outline-none bg-gray-50/50" 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-lacustral mb-1.5">Ghi chú tiếp nhận (Yêu cầu phát sinh)</label>
                <textarea 
                  rows={2} 
                  placeholder="Khách dặn cắt ngắn lông vùng bụng, pet hơi nhát..." 
                  value={formData.reception_notes}
                  onChange={e => setFormData({...formData, reception_notes: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chloro outline-none resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-semibold text-lacustral mb-1.5">Ảnh chụp tiếp nhận (Bằng chứng hiện trạng)</label>
                <ImageUpload 
                  images={formData.before_photos} 
                  onChange={(imgs) => setFormData({...formData, before_photos: imgs})} 
                  label="Thêm ảnh chụp"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-understory text-lg mb-4">Xác nhận dịch vụ với khách hàng</h3>
                <div className="space-y-3">
                  <div className="p-4 border border-chloro/20 rounded-xl bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <p className="text-sm text-lacustral mb-1 font-semibold">Dịch vụ gốc đã đặt</p>
                      <p className="font-medium text-understory">{booking.service_name}</p>
                    </div>
                    <span className="font-semibold text-understory">{formatVND(booking.total_amount || 0)}</span>
                  </div>
                  
                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-crown cursor-pointer transition-colors bg-white">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-chloro rounded" 
                      checked={isAddingService}
                      onChange={(e) => setIsAddingService(e.target.checked)}
                    />
                    <span className="font-medium text-understory">Khách yêu cầu thêm dịch vụ phát sinh</span>
                  </label>

                  {/* Vùng chọn thêm dịch vụ */}
                  {isAddingService && (
                    <div className="mt-4 p-4 border border-chloro/30 rounded-xl bg-chloro/5 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-sm font-semibold text-understory mb-3">Chọn dịch vụ bổ sung:</p>
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {availableServices.filter(s => s.id !== booking.service_id).map(service => {
                          const isSelected = selectedAddons.includes(service.id);
                          return (
                            <div 
                              key={service.id}
                              onClick={() => handleToggleAddon(service.id)}
                              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'bg-white border-chloro ring-1 ring-chloro' 
                                  : 'bg-white border-gray-200 hover:border-chloro/50'
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-medium text-understory text-sm leading-tight">{service.name}</span>
                                <span className="text-xs text-lacustral mt-1">{formatVND(service.price)}</span>
                              </div>
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                isSelected ? 'bg-chloro border-chloro text-white' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              <div className="bg-chloro/10 border border-chloro/20 rounded-xl p-5 flex flex-col gap-2">
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between items-center text-sm pb-3 border-b border-chloro/20">
                    <span className="text-lacustral">Dịch vụ phát sinh ({selectedAddons.length})</span>
                    <span className="font-medium text-understory">+{formatVND(getAddonsTotal())}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold text-understory text-lg">Tổng bill dự kiến</span>
                  <span className="text-2xl font-bold text-chloro">{formatVND(finalTotal)}</span>
                </div>
              </div>

              {booking.service_type === 'Hotel' && (
                <div className="mt-4 p-4 border border-orange-200 bg-orange-50 rounded-xl">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isAgreed}
                      onChange={(e) => setIsAgreed(e.target.checked)}
                      className="w-5 h-5 mt-0.5 text-orange-600 rounded border-gray-300 focus:ring-orange-500" 
                    />
                    <div>
                      <span className="font-semibold text-orange-900 block mb-1">Cam kết lưu trú & Nội quy Pet Hotel</span>
                      <span className="text-sm text-orange-800">
                        Khách hàng đã đọc và ký xác nhận vào hợp đồng lưu trú bản cứng (Bao gồm rủi ro bệnh lý phát sinh và phụ phí 30.000đ/giờ nếu đón trễ).
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-gray-100 bg-white flex justify-between">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 border border-gray-300 text-lacustral rounded-lg font-semibold hover:bg-crown transition-colors"
            >
              ← Quay lại
            </button>
          ) : <div />}

          {step < 3 ? (
            <button 
              onClick={() => {
                if (step === 2 && formData.before_photos.length === 0) {
                  alert("Vui lòng chụp ít nhất 1 ảnh hiện trạng thú cưng trước khi nhận!");
                  return;
                }
                setStep(step + 1);
              }}
              className="px-6 py-3 bg-understory hover:bg-lacustral text-white rounded-lg font-semibold flex items-center gap-2 transition-colors"
            >
              Tiếp tục
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={booking.service_type === 'Hotel' && !isAgreed}
              className="px-6 py-3 bg-chloro hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={20} /> Xác nhận tiếp nhận
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
