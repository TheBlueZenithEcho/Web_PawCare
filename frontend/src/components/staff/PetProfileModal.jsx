import { useState, useRef } from 'react';
import { X, Phone, HeartPulse, Activity, AlertTriangle, ShieldAlert, FileText, ClipboardCheck, Home, User, Stethoscope, Camera } from 'lucide-react';
import { formatVND } from '@/services/mock/mockApi';
import { updatePet } from '@/services/supabase/supabaseUsersApi';

export default function PetProfileModal({ pet, owner, bookings, onClose, onSuccess }) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('HEALTH'); // 'HEALTH' | 'HISTORY'
  const [localPet, setLocalPet] = useState(pet);
  const [isEditing, setIsEditing] = useState(false);
  const [petForm, setPetForm] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  if (!localPet) return null;

  const handleAction = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalPet(prev => ({ ...prev, avatar: url }));
      if (isEditing) {
        setPetForm(prev => ({ ...prev, avatar: url }));
      }
      handleAction('Đã cập nhật ảnh thú cưng!');
    }
  };

  const getStatusText = (status, type) => {
    switch (status) {
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PROCESSING': return type === 'Hotel' ? 'Đang lưu trú' : 'Đang phục vụ';
      case 'COMPLETED_SERVICE': return 'Phục vụ xong';
      case 'PAID': return 'Đã thanh toán';
      case 'DONE': return 'Hoàn thành';
      case 'NO_SHOW': return 'No-show';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header: Pet Basic Info */}
        <div className="bg-gradient-to-r from-chloro to-green-700 text-white p-6 relative shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/30 bg-white/10 rounded-full transition-colors z-10 cursor-pointer">
            <X size={20} />
          </button>
          {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded shadow-lg animate-in fade-in slide-in-from-top-2 z-50">
              {toastMessage}
            </div>
          )}

          <div className="flex items-center gap-6">
            <div
              className="relative w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-5xl shadow-inner border-2 border-white/30 backdrop-blur-md shrink-0 cursor-pointer overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
            >
              {localPet.avatar ? (
                <img src={localPet.avatar} alt="Pet Avatar" className="w-full h-full object-cover" />
              ) : (
                localPet.species === 'Mèo' ? '🐈' : '🐕'
              )}
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} />
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isEditing ? (
                  <input className="px-2 py-1 text-black rounded border-2 border-transparent focus:border-chloro text-2xl font-bold w-48" value={petForm.pet_name} onChange={e => setPetForm({ ...petForm, pet_name: e.target.value })} placeholder="Tên thú cưng" />
                ) : (
                  <h2 className="text-3xl font-bold">{localPet.pet_name}</h2>
                )}
                {isEditing ? (
                  <select className="px-2 py-1.5 text-sm text-black rounded border-none font-bold" value={petForm.species} onChange={e => setPetForm({ ...petForm, species: e.target.value })}>
                    <option value="Chó">Chó</option>
                    <option value="Mèo">Mèo</option>
                  </select>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wide">
                    {localPet.species}
                  </span>
                )}
                {isEditing ? (
                  <select className="px-2 py-1.5 text-sm text-black rounded border-none font-bold" value={petForm.gender} onChange={e => setPetForm({ ...petForm, gender: e.target.value })}>
                    <option value="Đực">Đực</option><option value="Cái">Cái</option><option value="Chưa rõ">Chưa rõ</option>
                  </select>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white border border-white/30">
                    {localPet.gender || 'Chưa rõ'}
                  </span>
                )}
              </div>
              <div className="text-white/90 font-medium mb-3 text-sm flex gap-2 items-center">
                {isEditing ? (
                  <>
                    <input className="px-2 py-1 text-black rounded text-sm w-32" value={petForm.breed} onChange={e => setPetForm({ ...petForm, breed: e.target.value })} placeholder="Giống" />
                    <input className="px-2 py-1 text-black rounded text-sm w-20" value={petForm.size} onChange={e => setPetForm({ ...petForm, size: e.target.value })} placeholder="Size" />
                    <input className="px-2 py-1 text-black rounded text-sm w-20" type="number" step="0.1" value={petForm.weight} onChange={e => setPetForm({ ...petForm, weight: e.target.value })} placeholder="Kg" /> kg
                    <input className="px-2 py-1 text-black rounded text-sm w-32" type="date" value={petForm.dob} onChange={e => setPetForm({ ...petForm, dob: e.target.value })} />
                  </>
                ) : (
                  <p className="text-lg">
                    {localPet.breed} {localPet.size ? `· Size ${localPet.size}` : ''} {localPet.weight ? `· ${localPet.weight} kg` : ''} {localPet.dob ? `· Sinh: ${localPet.dob}` : ''}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 text-sm bg-black/20 w-fit px-3 py-1.5 rounded-lg border border-black/10">
                <User size={16} className="text-xantho" />
                <span className="font-semibold">{owner?.last_name} {owner?.first_name}</span>
                <span className="mx-1 opacity-50">|</span>
                <Phone size={14} /> <span>{owner?.phone}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 relative justify-center ml-4">
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="text-xs font-semibold bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg transition-colors border border-white/30">Hủy</button>
                  <button onClick={async () => {
                    try {
                      await updatePet(petForm.pet_id, petForm);
                      setLocalPet(petForm);
                      setIsEditing(false);
                      handleAction('Đã lưu hồ sơ thú cưng!');
                      if (onSuccess) onSuccess();
                    } catch (e) { alert('Lỗi: ' + e.message); }
                  }} className="text-xs font-semibold bg-[#82c696] text-white hover:bg-[#68a87b] px-4 py-2 rounded-lg transition-colors shadow-sm">💾 Lưu lại</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setPetForm({
                      ...localPet,
                      health_record: localPet.health_record || {
                        skin_condition: 'Bình thường', coat_condition: 'Bình thường', ear_condition: 'Bình thường', eye_condition: 'Bình thường', nail_condition: 'Bình thường', wound_description: 'Không có vết thương', recorded_at: new Date().toISOString().split('T')[0]
                      }
                    });
                    setIsEditing(true);
                  }}
                  className="text-xs font-semibold bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-1 shadow-sm"
                >
                  ✏️ Chỉnh sửa hồ sơ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`py-4 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'HEALTH' ? 'border-chloro text-understory' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <HeartPulse size={18} /> Hồ sơ Sức khỏe & Đặc điểm
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-4 px-4 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'HISTORY' ? 'border-chloro text-understory' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            <ClipboardCheck size={18} /> Lịch sử Dịch vụ ({bookings.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto bg-gray-50/30 flex-1">

          {/* TAB: HEALTH */}
          {activeTab === 'HEALTH' && (
            <div className="space-y-6">

              {/* Cảnh báo đặc biệt (Tình trạng lông, móng, bệnh lý...) */}
              {isEditing ? (
                <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 shadow-sm flex gap-3">
                  <ShieldAlert size={24} className="text-red-500 shrink-0" />
                  <div className="w-full">
                    <h3 className="font-bold text-red-800 mb-1">Lưu ý Đặc biệt / Bệnh lý</h3>
                    <textarea rows={2} className="w-full px-3 py-2 border border-red-200 bg-white rounded-lg text-red-700 font-medium resize-none" value={petForm.special_notes} onChange={e => setPetForm({ ...petForm, special_notes: e.target.value })} placeholder="Nhập lưu ý đặc biệt..." />
                  </div>
                </div>
              ) : (
                localPet.special_notes && localPet.special_notes !== 'Không' && (
                  <div className="bg-red-50/50 p-4 rounded-xl border border-red-200 shadow-sm flex gap-3">
                    <ShieldAlert size={24} className="text-red-500 shrink-0" />
                    <div>
                      <h3 className="font-bold text-red-800 mb-1">Lưu ý Đặc biệt / Bệnh lý</h3>
                      <p className="text-red-700 font-medium leading-relaxed">
                        {localPet.special_notes}
                      </p>
                    </div>
                  </div>
                )
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* Hành vi & Tính cách */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-lacustral">
                    <Activity size={20} className="text-blue-500" />
                    <h3 className="font-bold">Hành vi & Tính cách</h3>
                  </div>
                  {isEditing ? (
                    <textarea rows={3} className="w-full px-3 py-2 border border-blue-200 bg-blue-50/50 rounded-lg text-gray-700 font-medium resize-none" value={petForm.behavior_notes} onChange={e => setPetForm({ ...petForm, behavior_notes: e.target.value })} placeholder="Nhập hành vi..." />
                  ) : (
                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100/50">
                      <p className="text-gray-700 font-medium leading-relaxed">
                        {localPet.behavior_notes || 'Chưa có ghi chú về hành vi.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dị ứng */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-3 text-lacustral">
                    <AlertTriangle size={20} className="text-orange-500" />
                    <h3 className="font-bold">Tiền sử Dị ứng</h3>
                  </div>
                  {isEditing ? (
                    <textarea rows={3} className="w-full px-3 py-2 border border-orange-200 bg-orange-50/50 rounded-lg text-orange-800 font-medium resize-none" value={petForm.allergy_notes} onChange={e => setPetForm({ ...petForm, allergy_notes: e.target.value })} placeholder="Nhập dị ứng..." />
                  ) : (
                    <div className={`p-4 rounded-lg border ${localPet.allergy_notes && localPet.allergy_notes !== 'Không'
                        ? 'bg-orange-50 border-orange-200 text-orange-800 font-semibold'
                        : 'bg-gray-50 border-gray-100 text-gray-500'
                      }`}>
                      <p className="leading-relaxed">
                        {localPet.allergy_notes || 'Chưa ghi nhận dị ứng.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Chi tiết Khám & Kiểm tra sức khỏe (PET_HEALTH_RECORD) */}
              {(localPet.health_record || isEditing) ? (
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 text-lacustral">
                      <Stethoscope size={20} className="text-chloro" />
                      <h3 className="font-bold text-understory text-lg">Bệnh án / Kiểm tra sức khỏe</h3>
                    </div>
                    <span className="text-sm font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                      Cập nhật: {isEditing ? petForm.health_record?.recorded_at : localPet.health_record?.recorded_at}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    {[
                      { key: 'skin_condition', label: 'Tình trạng Da' },
                      { key: 'coat_condition', label: 'Tình trạng Lông' },
                      { key: 'ear_condition', label: 'Tình trạng Tai' },
                      { key: 'eye_condition', label: 'Tình trạng Mắt' },
                      { key: 'nail_condition', label: 'Tình trạng Móng' },
                      { key: 'wound_description', label: 'Vết thương' }
                    ].map(field => (
                      <div key={field.key}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{field.label}</p>
                        {isEditing ? (
                          <input
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded font-medium text-understory"
                            value={petForm.health_record?.[field.key] || ''}
                            onChange={e => setPetForm({ ...petForm, health_record: { ...petForm.health_record, [field.key]: e.target.value } })}
                          />
                        ) : (
                          <p className={`font-medium ${(localPet.health_record?.[field.key] || '').includes('Bình thường') || (localPet.health_record?.[field.key] || '').includes('Không') ? 'text-gray-700' : (field.key === 'wound_description' ? 'text-red-600 font-bold' : 'text-orange-600 font-bold')}`}>
                            {localPet.health_record?.[field.key]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 p-6 text-center rounded-xl">
                  <p className="text-gray-500 font-medium">Chưa có bản ghi sức khỏe nào.</p>
                </div>
              )}

            </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                  <FileText size={48} className="text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">Bé chưa sử dụng dịch vụ nào tại PawCare.</p>
                </div>
              ) : (
                bookings.map(bk => (
                  <div key={bk.booking_id} className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-xl ${bk.service_type === 'Hotel' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {bk.service_type === 'Hotel' ? <Home size={24} /> : <ClipboardCheck size={24} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-understory text-lg mb-1">{bk.service_name || bk.service_type}</h4>
                        <div className="flex items-center gap-3 text-sm text-lacustral">
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{bk.booking_id}</span>
                          <span>{bk.checkin_date || bk.booking_time}</span>
                          {bk.assigned_staff_name && (
                            <>
                              <span>•</span>
                              <span>Phụ trách: <strong>{bk.assigned_staff_name}</strong></span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${bk.status === 'COMPLETED_SERVICE' || bk.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                          bk.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {getStatusText(bk.status, bk.service_type)}
                      </span>
                      <p className="font-bold text-xantho text-lg mt-2">{formatVND(bk.total_amount)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
