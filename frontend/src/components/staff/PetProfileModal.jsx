import { useState, useRef } from 'react';
import { X, Phone, HeartPulse, Activity, AlertTriangle, ShieldAlert, FileText, ClipboardCheck, Home, User, Stethoscope, Camera } from 'lucide-react';
import { formatVND } from '@/utils/format';
import { updatePet, uploadPetAvatar, deletePet } from '@/services/supabase/supabaseUsersApi';

export default function PetProfileModal({ pet, owner, bookings, onClose, onSuccess, onViewBooking }) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('HEALTH'); // 'HEALTH' | 'HISTORY'
  const [localPet, setLocalPet] = useState(pet);
  const [isEditing, setIsEditing] = useState(false);
  const [petForm, setPetForm] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  
  // Mock dữ liệu Bệnh án
  const [localHealth, setLocalHealth] = useState({
    skin: '',
    coat: '',
    ear: '',
    eye: '',
    nail: '',
    wound: ''
  });
  const [healthForm, setHealthForm] = useState(null);

  if (!localPet) return null;

  const handleAction = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
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
        <div className="bg-[#1b7337] text-white p-6 relative shrink-0">
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
              className="relative w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-5xl shadow-inner border-2 border-white/30 backdrop-blur-md shrink-0 overflow-hidden group"
            >
              {(isEditing ? petForm.pet_ava : localPet.pet_ava) ? (
                <img src={isEditing ? petForm.pet_ava : localPet.pet_ava} alt="Pet Avatar" className="w-full h-full object-cover" />
              ) : (
                localPet.species === 'cat' ? '🐈' : '🐕'
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                  <Camera size={24} />
                  <span className="text-[10px] mt-1 font-bold text-center leading-tight">Đổi ảnh</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      setToastMessage('Đang tải ảnh lên...');
                      const url = await uploadPetAvatar(localPet.pet_id, file);
                      setPetForm({ ...petForm, pet_ava: url });
                      handleAction('Đã tải ảnh xong, hãy bấm Lưu lại!');
                    } catch (err) {
                      alert('Lỗi tải ảnh. Có thể bạn chưa tạo Storage Bucket "avatars" trên Supabase: ' + err.message);
                      setToastMessage('');
                    }
                  }} />
                </label>
              )}
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
                    <option value="dog">Chó</option>
                    <option value="cat">Mèo</option>
                  </select>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wide">
                    {localPet.species === 'cat' ? 'Mèo' : 'Chó'}
                  </span>
                )}
                {isEditing ? (
                  <select className="px-2 py-1.5 text-sm text-black rounded border-none font-bold" value={petForm.gender} onChange={e => setPetForm({ ...petForm, gender: e.target.value })}>
                    <option value="male">Đực</option><option value="female">Cái</option>
                  </select>
                ) : (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-white/20 text-white border border-white/30">
                    {localPet.gender === 'female' ? 'Cái' : 'Đực'}
                  </span>
                )}
              </div>
              <div className="text-white/90 font-medium mb-3 text-sm flex gap-2 items-center">
                {isEditing ? (
                  <>
                    <input className="px-2 py-1 text-black rounded text-sm w-32" value={petForm.breed} onChange={e => setPetForm({ ...petForm, breed: e.target.value })} placeholder="Giống" />
                    <select className="px-2 py-1 text-black rounded text-sm w-24" value={petForm.size} onChange={e => setPetForm({ ...petForm, size: e.target.value })}>
                      <option value="S">Nhỏ (S)</option>
                      <option value="M">Vừa (M)</option>
                      <option value="L">Lớn (L)</option>
                    </select>
                    <input className="px-2 py-1 text-black rounded text-sm w-20" type="number" step="0.1" value={petForm.weight} onChange={e => setPetForm({ ...petForm, weight: e.target.value })} placeholder="Kg" /> kg
                    <input className="px-2 py-1 text-black rounded text-sm w-32" type="date" value={petForm.dob} onChange={e => setPetForm({ ...petForm, dob: e.target.value })} />
                  </>
                ) : (
                  <p className="text-lg">
                    {localPet.breed} {localPet.size ? `· Size ${localPet.size}` : ''} {localPet.weight ? `· ${localPet.weight} kg` : ''} {localPet.dob ? `· Sinh: ${new Date(localPet.dob).toLocaleDateString('vi-VN')}` : ''}
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
                      setLocalHealth(healthForm);
                      setIsEditing(false);
                      handleAction('Đã lưu hồ sơ thú cưng!');
                      if (onSuccess) onSuccess();
                    } catch (e) { alert('Lỗi: ' + e.message); }
                  }} className="text-xs font-semibold bg-[#82c696] text-white hover:bg-[#68a87b] px-4 py-2 rounded-lg transition-colors shadow-sm">💾 Lưu lại</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPetForm({
                        ...localPet
                      });
                      setHealthForm({
                        ...localHealth
                      });
                      setIsEditing(true);
                    }}
                    className="text-xs font-semibold bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-1 shadow-sm"
                  >
                    ✏️ Chỉnh sửa hồ sơ
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa thú cưng này? Lịch sử sẽ bị mất.')) {
                        try {
                          await deletePet(localPet.pet_id);
                          alert('Đã xóa hồ sơ thú cưng thành công!');
                          if (onSuccess) onSuccess();
                          onClose();
                        } catch (e) { alert('Lỗi xóa thú cưng: ' + e.message); }
                      }
                    }}
                    className="text-xs font-semibold bg-red-500/80 text-white hover:bg-red-500 px-4 py-2 rounded-lg transition-colors border border-red-500/50 flex items-center justify-center gap-1 shadow-sm"
                  >
                    🗑 Xóa
                  </button>
                </div>
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
              <div className="grid grid-cols-3 gap-6">
                {/* Hành vi & Tính cách */}
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Hành vi & Tích cách</p>
                  {isEditing ? (
                    <textarea rows={1} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium resize-none focus:outline-none focus:ring-1 focus:ring-gray-300" value={petForm.behavior_notes} onChange={e => setPetForm({ ...petForm, behavior_notes: e.target.value })} placeholder="Nhập hành vi..." />
                  ) : (
                    <div className="px-3 py-2.5 bg-gray-50/50 rounded-lg">
                      <p className="text-gray-700 font-medium">{localPet.behavior_notes || 'Chưa có ghi chú'}</p>
                    </div>
                  )}
                </div>

                {/* Dị ứng */}
                <div>
                  <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1"><AlertTriangle size={14}/> Dị ứng</p>
                  {isEditing ? (
                    <textarea rows={1} className="w-full px-3 py-2 bg-orange-50/30 border border-orange-100 rounded-lg text-orange-800 font-medium resize-none focus:outline-none focus:ring-1 focus:ring-orange-300" value={petForm.allergy_notes} onChange={e => setPetForm({ ...petForm, allergy_notes: e.target.value })} placeholder="Nhập dị ứng..." />
                  ) : (
                    <div className="px-3 py-2.5 bg-orange-50/30 rounded-lg">
                      <p className="text-orange-800 font-medium">{localPet.allergy_notes || 'Không có'}</p>
                    </div>
                  )}
                </div>

                {/* Lưu ý Đặc biệt */}
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Lưu ý Đặc biệt</p>
                  {isEditing ? (
                    <textarea rows={1} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 font-medium resize-none focus:outline-none focus:ring-1 focus:ring-gray-300" value={petForm.special_notes} onChange={e => setPetForm({ ...petForm, special_notes: e.target.value })} placeholder="Lưu ý đặc biệt..." />
                  ) : (
                    <div className="px-3 py-2.5 bg-gray-50/50 rounded-lg">
                      <p className="text-gray-700 font-medium">{localPet.special_notes || 'Không có'}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bệnh án / Kiểm tra sức khỏe */}
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Stethoscope size={20} />
                    <h3 className="font-bold">Bệnh án / Kiểm tra sức khỏe</h3>
                  </div>
                  <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                    {new Date().toISOString().split('T')[0]}
                  </span>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-3 gap-y-6 gap-x-8">
                  {/* Skin */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tình trạng da</p>
                    {isEditing ? (
                      <input className="w-full px-2 py-1.5 border-b border-gray-200 focus:border-green-500 outline-none text-sm text-gray-700 font-medium" placeholder="Bình thường" value={healthForm.skin} onChange={e => setHealthForm({...healthForm, skin: e.target.value})} />
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{localHealth.skin || 'Bình thường'}</p>
                    )}
                  </div>
                  {/* Coat */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tình trạng lông</p>
                    {isEditing ? (
                      <input className="w-full px-2 py-1.5 border-b border-gray-200 focus:border-green-500 outline-none text-sm text-gray-700 font-medium" placeholder="Bình thường" value={healthForm.coat} onChange={e => setHealthForm({...healthForm, coat: e.target.value})} />
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{localHealth.coat || 'Bình thường'}</p>
                    )}
                  </div>
                  {/* Ear */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tình trạng tai</p>
                    {isEditing ? (
                      <input className="w-full px-2 py-1.5 border-b border-gray-200 focus:border-green-500 outline-none text-sm text-gray-700 font-medium" placeholder="Bình thường" value={healthForm.ear} onChange={e => setHealthForm({...healthForm, ear: e.target.value})} />
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{localHealth.ear || 'Bình thường'}</p>
                    )}
                  </div>
                  {/* Eye */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tình trạng mắt</p>
                    {isEditing ? (
                      <input className="w-full px-2 py-1.5 border-b border-gray-200 focus:border-green-500 outline-none text-sm text-gray-700 font-medium" placeholder="Bình thường" value={healthForm.eye} onChange={e => setHealthForm({...healthForm, eye: e.target.value})} />
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{localHealth.eye || 'Bình thường'}</p>
                    )}
                  </div>
                  {/* Nail */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tình trạng móng</p>
                    {isEditing ? (
                      <input className="w-full px-2 py-1.5 border-b border-gray-200 focus:border-green-500 outline-none text-sm text-gray-700 font-medium" placeholder="Bình thường" value={healthForm.nail} onChange={e => setHealthForm({...healthForm, nail: e.target.value})} />
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{localHealth.nail || 'Bình thường'}</p>
                    )}
                  </div>
                  {/* Wound */}
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mô tả vết thương</p>
                    {isEditing ? (
                      <input className="w-full px-2 py-1.5 border-b border-gray-200 focus:border-green-500 outline-none text-sm text-gray-700 font-medium" placeholder="Không" value={healthForm.wound} onChange={e => setHealthForm({...healthForm, wound: e.target.value})} />
                    ) : (
                      <p className="text-sm font-medium text-gray-700">{localHealth.wound || 'Không'}</p>
                    )}
                  </div>
                </div>
              </div>



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
                  <div 
                    key={bk.booking_id} 
                    className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex items-center justify-between hover:shadow-md hover:border-chloro transition-all cursor-pointer group"
                    onClick={() => onViewBooking && onViewBooking(bk)}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`p-4 rounded-xl ${bk.service_type === 'Hotel' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {bk.service_type === 'Hotel' ? <Home size={24} /> : <ClipboardCheck size={24} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-understory text-lg mb-1">{bk.booking_service?.[0]?.service?.service_name || bk.booking_type}</h4>
                        <div className="flex items-center gap-3 text-sm text-lacustral">
                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{bk.booking_id}</span>
                          <span>{new Date(bk.created_at).toLocaleString('vi-VN')}</span>
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
                      <p className="font-bold text-xantho text-lg mt-2">{formatVND(bk.total_bill || 0)}</p>
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
