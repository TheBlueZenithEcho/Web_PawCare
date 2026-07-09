import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function EmergencyModal({ booking, onClose, onConfirm }) {
  const [formData, setFormData] = useState({
    incident_type: 'HEALTH_ISSUE',
    description: '',
    actions_taken: {
      first_aid: false,
      vet_contacted: false,
      owner_contacted: false,
      isolated: false
    },
    action_notes: ''
  });

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      actions_taken: { ...prev.actions_taken, [field]: !prev.actions_taken[field] }
    }));
  };

  const handleSubmit = () => {
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border-2 border-red-500">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-red-100 flex justify-between items-center bg-red-50">
          <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle size={24} /> Báo cáo Sự cố Khẩn cấp
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 flex items-center gap-2">
            <strong>Lưu ý:</strong> Việc báo cáo sự cố sẽ đóng băng đơn hàng và gửi cảnh báo ngay lập tức cho Quản lý cấp cao.
          </div>

          {/* Booking Info Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 font-bold mb-0.5">Mã đơn: <span className="text-understory">{booking.booking_id}</span></p>
              <h3 className="text-base font-bold text-understory">{booking.pet_name} <span className="text-sm font-normal text-gray-500">({booking.pet_type})</span></h3>
            </div>
            <div className="text-right border-l border-gray-200 pl-4">
              <p className="text-xs text-gray-500 font-bold mb-0.5">Chủ thú cưng</p>
              <p className="font-semibold text-understory text-sm">{booking.customer_name}</p>
              <p className="text-xs text-[#1a66cc] font-bold">{booking.customer_phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phân loại sự cố</label>
                <select 
                  value={formData.incident_type}
                  onChange={(e) => setFormData({...formData, incident_type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none font-medium text-gray-700 bg-white text-sm"
                >
                  <option value="HEALTH_ISSUE">Sức khỏe thú cưng đột xuất (Co giật, ngất, nôn mửa...)</option>
                  <option value="AGGRESSIVE">Thú cưng cắn/gây thương tích cho nhân viên/pet khác</option>
                  <option value="LOST">Thất lạc / Chạy trốn</option>
                  <option value="OTHER">Sự cố khác (Hư hỏng tài sản...)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Các biện pháp đã xử lý tức thời (Checklist)</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={formData.actions_taken.first_aid} onChange={() => handleCheckboxChange('first_aid')} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                    <span className="text-xs font-medium text-gray-700">Sơ cứu tại chỗ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={formData.actions_taken.vet_contacted} onChange={() => handleCheckboxChange('vet_contacted')} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                    <span className="text-xs font-medium text-gray-700">Đưa đi thú y gần nhất</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={formData.actions_taken.owner_contacted} onChange={() => handleCheckboxChange('owner_contacted')} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                    <span className="text-xs font-medium text-gray-700">Đã gọi báo chủ (KH)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <input type="checkbox" checked={formData.actions_taken.isolated} onChange={() => handleCheckboxChange('isolated')} className="w-4 h-4 text-red-600 rounded focus:ring-red-500" />
                    <span className="text-xs font-medium text-gray-700">Đã cách ly (nhốt lồng)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4 flex flex-col">
              <div className="flex-1 flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mô tả chi tiết diễn biến <span className="text-red-500">*</span></label>
                <textarea 
                  placeholder="Ghi rõ thời gian, tình trạng hiện tại của thú cưng..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm bg-white min-h-[80px]" 
                ></textarea>
              </div>
              
              <div>
                <textarea 
                  rows={2}
                  placeholder="Ghi chú thêm về hành động đã xử lý..."
                  value={formData.action_notes}
                  onChange={(e) => setFormData({...formData, action_notes: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm bg-white" 
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-500/20"
          >
            Báo cáo Admin
          </button>
        </div>

      </div>
    </div>
  );
}
