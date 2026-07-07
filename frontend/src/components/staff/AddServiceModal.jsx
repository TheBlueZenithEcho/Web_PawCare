import React, { useState } from 'react';
import { X, CheckCircle, Plus } from 'lucide-react';
import { formatVND } from '@/services/mock/mockApi';

export default function AddServiceModal({ booking, onClose, onConfirm }) {
  const [selectedServices, setSelectedServices] = useState({});

  const groomingServices = [
    { id: 'S01', name: 'Tắm vệ sinh cơ bản', price: 200000, duration: '60 phút' },
    { id: 'S02', name: 'Cắt tỉa tạo kiểu', price: 250000, duration: '90 phút' },
    { id: 'S03', name: 'Spa thư giãn (Ozone)', price: 300000, duration: '45 phút' },
    { id: 'S04', name: 'Vệ sinh tai / Cắt móng lẻ', price: 50000, duration: '15 phút' },
  ];

  const handleToggle = (svc) => {
    setSelectedServices(prev => {
      const next = { ...prev };
      if (next[svc.id]) {
        delete next[svc.id];
      } else {
        next[svc.id] = svc;
      }
      return next;
    });
  };

  const totalAdded = Object.values(selectedServices).reduce((sum, item) => sum + item.price, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.keys(selectedServices).length === 0) {
      alert("Vui lòng chọn ít nhất 1 dịch vụ!");
      return;
    }
    onConfirm(Object.values(selectedServices));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-understory">Thêm Dịch vụ Grooming</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4">
            <p className="text-sm text-lacustral mb-2">Thêm dịch vụ chăm sóc trong thời gian lưu trú cho <span className="font-bold text-understory">{booking.pet_name}</span>:</p>

            <div className="space-y-3">
              {groomingServices.map(svc => (
                <label 
                  key={svc.id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedServices[svc.id] ? 'border-[#1a66cc] bg-blue-50/50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggle(svc)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                      selectedServices[svc.id] ? 'bg-[#1a66cc] border-[#1a66cc]' : 'border-gray-300 bg-white'
                    }`}>
                      {selectedServices[svc.id] && <CheckCircle size={14} className="text-white" />}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${selectedServices[svc.id] ? 'text-[#1a66cc]' : 'text-understory'}`}>{svc.name}</p>
                      <p className="text-xs text-gray-500">Thời gian: {svc.duration}</p>
                    </div>
                  </div>
                  <span className="font-bold text-understory">{formatVND(svc.price)}</span>
                </label>
              ))}
            </div>

            {totalAdded > 0 && (
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm font-bold text-lacustral">Tổng chi phí thêm:</span>
                <span className="text-lg font-black text-[#1a66cc]">{formatVND(totalAdded)}</span>
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
              className="px-6 py-2 bg-[#1a66cc] hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} /> Thêm vào hóa đơn
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
