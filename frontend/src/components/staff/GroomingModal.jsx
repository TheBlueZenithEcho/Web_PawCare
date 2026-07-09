import { useState } from 'react';
import { X, Check, AlertTriangle, AlertCircle, CheckSquare, Square, Clock } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';
import EmergencyModal from '@/components/staff/EmergencyModal';

export default function GroomingModal({ booking, onClose, onConfirm, onIncident }) {
  const [activeTab, setActiveTab] = useState('Dịch vụ');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  const allServices = booking.booking_service?.map(bs => bs.service?.service_name).filter(Boolean) || [];

  // Tab 1 Data
  const [checkedServices, setCheckedServices] = useState({});
  const [serviceNotes, setServiceNotes] = useState('');

  // Tab 2 Data (Health Record)
  const [healthData, setHealthData] = useState({
    after_weight: booking.pet?.weight || '',
    behavior_observed: '',
    skin_condition: '',
    coat_condition: '',
    ear_condition: '',
    eye_condition: '',
    nail_condition: '',
    photos: []
  });

  const handleServiceCheck = (serviceName) => {
    setCheckedServices(prev => ({
      ...prev,
      [serviceName]: !prev[serviceName]
    }));
  };

  const isHealthDataComplete = () => {
    return (
      healthData.after_weight &&
      healthData.behavior_observed &&
      healthData.skin_condition &&
      healthData.coat_condition &&
      healthData.ear_condition &&
      healthData.eye_condition &&
      healthData.nail_condition &&
      healthData.photos.length > 0
    );
  };

  const handleComplete = () => {
    if (!isHealthDataComplete()) {
      alert("Vui lòng điền đủ thông tin sức khỏe và upload ảnh ở tab 'Cập nhật sức khỏe'!");
      setActiveTab('Cập nhật sức khỏe');
      return;
    }

    onConfirm({
      health_record: healthData,
      service_notes: serviceNotes,
      status: 'COMPLETED_SERVICE'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Thực hiện Grooming — #{booking.booking_id} · {booking.pet?.pet_name}
          </h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsEmergencyOpen(true)}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-bold transition-colors border border-red-100 shadow-sm"
            >
              <AlertTriangle size={16} /> Báo cáo sự cố
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Pet Info */}
          <div className="w-1/3 flex flex-col border-r border-gray-100 bg-gray-50/50 transition-all duration-300">
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {/* Pet Info Card */}
              <div className="bg-[#f8faff] border border-blue-100 rounded-xl p-5 shadow-sm">
                <div className="flex gap-4 items-center mb-5">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-3xl shadow-sm border border-white shrink-0 overflow-hidden">
                    {booking.pet?.pet_ava ? (
                      <img src={booking.pet.pet_ava} alt="Pet avatar" className="w-full h-full object-cover" />
                    ) : (
                      booking.pet?.species === 'cat' ? '🐈' : '🐕'
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-[#1a3b5c]">{booking.pet?.pet_name}</h3>
                        <p className="text-[#3b82f6] text-sm font-medium mt-1">{booking.pet?.species === 'cat' ? 'Mèo' : 'Chó'} · {booking.pet?.breed} · {booking.pet?.weight <= 5 ? 'Nhỏ' : (booking.pet?.weight <= 15 ? 'Vừa' : 'Lớn')}</p>
                      </div>
                      <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1 shrink-0">
                        <Clock size={12} /> Đang phục vụ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-50 mb-4 shadow-sm">
                  <h4 className="text-sm font-bold text-gray-800 mb-2 border-b pb-2">Danh sách dịch vụ</h4>
                  <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                    {allServices.map((srv, i) => (
                      <li key={i}>{srv}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 bg-white p-3 rounded-lg border border-blue-50">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cân nặng</p>
                    <p className="font-semibold text-gray-800">{booking.pet?.weight || 'N/A'} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tuổi</p>
                    <p className="font-semibold text-gray-800">
                      {booking.pet?.dob ? (() => {
                        const ageDate = new Date(Date.now() - new Date(booking.pet.dob).getTime());
                        return Math.abs(ageDate.getUTCFullYear() - 1970) + ' tuổi';
                      })() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Giới tính</p>
                    <p className="font-semibold text-gray-800">{booking.pet?.gender === 'male' ? 'Đực' : (booking.pet?.gender === 'female' ? 'Cái' : 'N/A')}</p>
                  </div>
                </div>

                {booking.pet?.special_notes && (
                  <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg text-sm flex items-start gap-2 mb-2">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5 text-orange-500" />
                    <p><span className="font-bold">Lưu ý:</span> {booking.pet.special_notes}</p>
                  </div>
                )}
                
                {booking.pet?.allergy_notes && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm flex items-start gap-2 mb-4">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                    <p><span className="font-bold">Dị ứng:</span> {booking.pet.allergy_notes}</p>
                  </div>
                )}

                {booking.pet?.behavior_notes && (
                  <p className="text-gray-700 text-sm mt-4">Hành vi: {booking.pet.behavior_notes}</p>
                )}

                {booking.health_record?.photos && booking.health_record.photos.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-blue-50">
                    <p className="text-sm font-bold text-gray-800 mb-2">Ảnh lúc tiếp nhận</p>
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {booking.health_record.photos.map((src, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={src} alt="Check-in" className="w-16 h-16 rounded object-cover border border-gray-200" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tabs & Forms */}
          <div className="w-2/3 flex flex-col bg-white">
            
            {/* Tabs */}
            <div className="px-6 pt-4 border-b border-gray-200 bg-white flex gap-6 shrink-0">
              {['Dịch vụ', 'Cập nhật sức khỏe'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 font-semibold transition-colors flex items-center gap-2 ${
                    activeTab === tab 
                      ? 'border-b-2 border-[#1a66cc] text-[#1a66cc]' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* TAB 1: DỊCH VỤ */}
              {activeTab === 'Dịch vụ' && (
                <div className="space-y-6">
                  {/* Service Checklist */}
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Dịch vụ cần thực hiện</h3>
                <div className="space-y-3">
                  {allServices.map((srv, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => handleServiceCheck(srv)}
                    >
                      {checkedServices[srv] 
                        ? <CheckSquare className="text-green-500" size={20} /> 
                        : <Square className="text-gray-400" size={20} />
                      }
                      <span className={`text-gray-700 ${checkedServices[srv] ? 'line-through opacity-70' : ''}`}>{srv}</span>
                    </div>
                  ))}
                  {allServices.length === 0 && (
                    <p className="text-sm text-gray-500">Chưa có danh sách dịch vụ chi tiết.</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ghi chú quá trình thực hiện</label>
                <textarea 
                  rows={3}
                  placeholder="Thú cưng hợp tác tốt, lông được cắt theo yêu cầu..."
                  value={serviceNotes}
                  onChange={e => setServiceNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a66cc] outline-none text-sm resize-none" 
                ></textarea>
              </div>
            </div>
          )}

          {/* TAB 2: SỨC KHỎE */}
          {activeTab === 'Cập nhật sức khỏe' && (
            <div className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-sm">
                Bắt buộc cập nhật chỉ số sức khỏe và upload ảnh sau dịch vụ trước khi đánh dấu "Phục vụ xong".
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cân nặng sau dịch vụ (kg)</label>
                  <input 
                    type="number" step="0.1"
                    value={healthData.after_weight}
                    onChange={e => setHealthData({...healthData, after_weight: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a66cc] outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hành vi quan sát</label>
                  <input 
                    type="text" 
                    placeholder="Hiền, hợp tác tốt..."
                    value={healthData.behavior_observed}
                    onChange={e => setHealthData({...healthData, behavior_observed: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a66cc] outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tình trạng da</label>
                  <input 
                    type="text" 
                    placeholder="Sạch, không viêm..."
                    value={healthData.skin_condition}
                    onChange={e => setHealthData({...healthData, skin_condition: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a66cc] outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tình trạng lông sau cắt</label>
                  <input 
                    type="text" 
                    placeholder="Gọn gàng, mềm mượt..."
                    value={healthData.coat_condition}
                    onChange={e => setHealthData({...healthData, coat_condition: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a66cc] outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tai</label>
                  <input 
                    type="text" 
                    placeholder="Đã vệ sinh, sạch..."
                    value={healthData.ear_condition}
                    onChange={e => setHealthData({...healthData, ear_condition: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a66cc] outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mắt</label>
                  <input 
                    type="text" 
                    placeholder="Trong, không đỏ..."
                    value={healthData.eye_condition}
                    onChange={e => setHealthData({...healthData, eye_condition: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a66cc] outline-none text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tình trạng móng</label>
                  <input 
                    type="text" 
                    placeholder="Đã cắt dũa..."
                    value={healthData.nail_condition}
                    onChange={e => setHealthData({...healthData, nail_condition: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a66cc] outline-none text-sm" 
                  />
                </div>
              </div>

              <div className="bg-white border-2 border-dashed border-gray-300 p-5 rounded-xl">
                <ImageUpload 
                  images={healthData.photos} 
                  onChange={(imgs) => setHealthData({...healthData, photos: imgs})} 
                  label="Upload ảnh thú cưng sau khi hoàn thành dịch vụ"
                  maxImages={3}
                />
              </div>
            </div>
          )}


          </div> {/* END Tab Contents */}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-white flex flex-col gap-2 shrink-0">
              <div className="flex justify-between w-full gap-4">
                {activeTab === 'Dịch vụ' ? (
                  <>
                    <button 
                      onClick={onClose}
                      className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex-1 max-w-[200px]"
                    >
                      Đóng
                    </button>
                    <button 
                      onClick={() => setActiveTab('Cập nhật sức khỏe')}
                      className="px-6 py-2.5 bg-[#1a66cc] hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex-1"
                    >
                      Cập nhật sức khỏe
                    </button>
                  </>
                ) : activeTab === 'Cập nhật sức khỏe' ? (
                  <button 
                    onClick={handleComplete}
                    disabled={!isHealthDataComplete()}
                    className={`w-full px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
                      isHealthDataComplete()
                        ? 'bg-[#82c696] hover:bg-[#68a87b] text-white shadow-sm'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckSquare size={20} /> Phục vụ xong
                  </button>
                ) : null}
              </div>
              
              {activeTab === 'Cập nhật sức khỏe' && !isHealthDataComplete() && (
                <p className="text-red-500 text-sm text-center font-medium mt-1">Cần điền đủ thông tin và upload ảnh để hoàn thành</p>
              )}
            </div>

          </div>

        </div>
      </div>

      {isEmergencyOpen && (
        <EmergencyModal 
          booking={booking}
          onClose={() => setIsEmergencyOpen(false)}
          onConfirm={(data) => {
            setIsEmergencyOpen(false);
            if (onIncident) {
              onIncident(data);
            }
          }}
        />
      )}
    </div>
  );
}
