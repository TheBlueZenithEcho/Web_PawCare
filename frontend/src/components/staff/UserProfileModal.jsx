import { useState, useRef } from 'react';
import { X, Phone, Mail, Dog, Calendar, ClipboardCheck, AlertTriangle, ShieldCheck, Tag, Home, Stethoscope, Camera } from 'lucide-react';
import { formatVND } from '@/utils/format';
import { updateCustomer, updatePet, uploadCustomerAvatar, deleteCustomer, deletePet, createPet } from '@/services/supabase/supabaseUsersApi';

export default function UserProfileModal({ customer, pets, bookings, onClose, onOpenCreateAccount, onSuccess, onViewBooking }) {
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('PETS'); // 'PETS' | 'BOOKINGS'
  const [toastMessage, setToastMessage] = useState('');

  const [localCustomer, setLocalCustomer] = useState(customer);
  const [localPets, setLocalPets] = useState(pets);

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState(null);

  const [editingPetId, setEditingPetId] = useState(null);
  const [petForm, setPetForm] = useState(null);

  const [isAddingPet, setIsAddingPet] = useState(false);
  const [newPetForm, setNewPetForm] = useState({
    pet_name: '', species: 'dog', breed: '', weight: '', gender: 'unknown',
    health_record: { skin_condition: '', coat_condition: '', ear_condition: '', eye_condition: '', nail_condition: '', wound_description: '', recorded_at: new Date().toISOString().split('T')[0] }
  });


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

  const handleAction = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };



  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header & Customer Info */}
        <div className="bg-understory text-white p-6 relative shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/30 bg-white/10 rounded-full transition-colors z-10 cursor-pointer">
            <X size={20} />
          </button>
          <div className="flex flex-col xl:flex-row gap-6 xl:items-center">
            <div className="flex gap-4 sm:gap-6 items-center flex-1 min-w-0">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#dcfce7] shadow-lg border-4 border-white/20 shrink-0 flex items-center justify-center text-3xl sm:text-4xl font-bold text-understory overflow-hidden group">
              {(isEditingCustomer ? customerForm.cus_ava : localCustomer.cus_ava) ? (
                <img src={isEditingCustomer ? customerForm.cus_ava : localCustomer.cus_ava} alt="Customer Avatar" className="w-full h-full object-cover" />
              ) : (
                localCustomer.first_name ? localCustomer.first_name.charAt(0).toUpperCase() : '?'
              )}
              {isEditingCustomer && (
                <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                  <Camera size={24} />
                  <span className="text-[10px] mt-1 font-bold text-center leading-tight">Đổi ảnh</span>
                  <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      setToastMessage('Đang tải ảnh lên...');
                      const url = await uploadCustomerAvatar(localCustomer.customer_id, file);
                      setCustomerForm({ ...customerForm, cus_ava: url });
                      handleAction('Đã tải ảnh xong, hãy bấm Lưu lại!');
                    } catch (err) {
                      alert('Lỗi tải ảnh: ' + err.message);
                      setToastMessage('');
                    }
                  }} />
                </label>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {isEditingCustomer ? (
                  <div className="flex gap-2 flex-1 min-w-0">
                    <input className="px-3 py-1 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 text-xl font-bold w-24 focus:outline-none focus:bg-white/20 transition-colors" value={customerForm.last_name} onChange={e => setCustomerForm({ ...customerForm, last_name: e.target.value })} placeholder="Họ" />
                    <input className="px-3 py-1 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 text-xl font-bold flex-1 min-w-0 focus:outline-none focus:bg-white/20 transition-colors" value={customerForm.first_name} onChange={e => setCustomerForm({ ...customerForm, first_name: e.target.value })} placeholder="Tên" />
                  </div>
                ) : (
                  <h2 className="text-xl font-bold truncate" title={`${localCustomer.last_name} ${localCustomer.first_name}`}>
                    {localCustomer.last_name} {localCustomer.first_name}
                  </h2>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  {localCustomer.user_id ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-chloro text-white border border-green-500">
                      <ShieldCheck size={12} /> Có tài khoản
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-white/20 text-white border border-white/30">
                      <AlertTriangle size={12} /> Khách vãng lai
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-white/80 text-sm mb-3 flex items-center gap-2 flex-wrap">
                <span>ID: {localCustomer.customer_id}</span>
                <span className="text-white/40">•</span>
                <span>Tham gia: {new Date(localCustomer.created_at).toLocaleDateString('vi-VN')}</span>
              </div>

              <div className="flex gap-4 text-sm font-medium flex-wrap">
                {isEditingCustomer ? (
                  <div className="flex gap-3 w-full">
                    <input className="px-3 py-1.5 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 text-sm w-32 focus:outline-none focus:bg-white/20 transition-colors" value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} placeholder="SĐT" />
                    <input className="px-3 py-1.5 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 text-sm flex-1 min-w-0 focus:outline-none focus:bg-white/20 transition-colors" value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} placeholder="Email" />
                  </div>
                ) : (
                  <>
                    <p className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10"><Phone size={14} className="text-xantho" /> {localCustomer.phone}</p>
                    {localCustomer.email && <p className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10"><Mail size={14} className="text-xantho" /> {localCustomer.email}</p>}
                  </>
                )}
              </div>
            </div>
            </div>
            <div className="flex flex-row gap-4 items-center justify-between xl:justify-end shrink-0 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 hide-scrollbar">
              <div className="flex flex-col gap-2 relative shrink-0">
                {isEditingCustomer ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingCustomer(false)} className="text-sm font-bold bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/20">Hủy</button>
                    <button onClick={async () => {
                      try {
                        await updateCustomer(customerForm.customer_id, customerForm);
                        setLocalCustomer(customerForm);
                        setIsEditingCustomer(false);
                        handleAction('Đã lưu thông tin khách hàng!');
                        if (onSuccess) onSuccess();
                      } catch (e) { alert('Lỗi: ' + e.message); }
                    }} className="text-sm font-bold bg-[#82c696] text-white hover:bg-[#68a87b] px-4 py-2 rounded-xl transition-colors shadow-sm">Lưu lại</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setCustomerForm(localCustomer); setIsEditingCustomer(true); }}
                      className="text-sm font-bold bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/20 flex items-center justify-center gap-1.5"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này? Lưu ý: Việc này có thể thất bại nếu khách hàng đã có dữ liệu thú cưng hoặc dịch vụ.')) {
                          try {
                            await deleteCustomer(localCustomer.customer_id);
                            alert('Đã xóa khách hàng thành công!');
                            if (onSuccess) onSuccess();
                            onClose();
                          } catch (e) {
                            alert('Lỗi xóa khách hàng: ' + e.message);
                          }
                        }
                      }}
                      className="text-sm font-bold bg-red-500/90 text-white hover:bg-red-600 px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      Xóa
                    </button>
                  </div>
                )}
                {!customer.user_id && (
                  <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => onOpenCreateAccount(customer)}
                      className="text-xs font-semibold bg-white text-understory hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      Cấp tài khoản ngay
                    </button>
                    <button
                      onClick={() => handleAction('Đã gửi email hướng dẫn tạo tài khoản!')}
                      className="text-xs font-semibold bg-transparent border border-white/30 text-white hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Gửi Email hướng dẫn
                    </button>
                    {toastMessage && (
                      <div className="absolute top-[110%] left-1/2 -translate-x-1/2 w-[220px] bg-green-600 text-white text-[11px] font-bold px-3 py-2 rounded shadow-lg text-center animate-in fade-in slide-in-from-top-2 z-50">
                        <ShieldCheck size={14} className="inline mr-1" /> {toastMessage}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 h-full flex flex-col justify-center">
                <p className="text-white/80 text-sm mb-1">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-xantho">{formatVND(customer.total_spent)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50 shrink-0">
          <button
            onClick={() => setActiveTab('PETS')}
            className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'PETS' ? 'border-chloro text-chloro' : 'border-transparent text-gray-500 hover:text-understory'
              }`}
          >
            <Dog size={18} /> Pet Profile ({pets.length})
          </button>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'BOOKINGS' ? 'border-chloro text-chloro' : 'border-transparent text-gray-500 hover:text-understory'
              }`}
          >
            <Calendar size={18} /> Lịch sử dịch vụ ({bookings.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-crown/30">

          {activeTab === 'PETS' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-800 text-lg">Danh sách Thú cưng</h3>
                {!isAddingPet && (
                  <button 
                    onClick={() => setIsAddingPet(true)}
                    className="flex items-center gap-1 bg-chloro text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
                  >
                    + Thêm thú cưng
                  </button>
                )}
              </div>
              
              {isAddingPet && (
                <div className="bg-white border-2 border-chloro p-5 rounded-xl shadow-sm mb-6 animate-in fade-in zoom-in duration-200">
                  <h4 className="font-bold text-understory mb-4">Thêm Thú cưng Mới</h4>
                  <div className="flex flex-col gap-3 text-sm">
                    <input className="px-3 py-2 border border-gray-300 rounded-lg w-full outline-none focus:border-chloro" value={newPetForm.pet_name} onChange={e => setNewPetForm({ ...newPetForm, pet_name: e.target.value })} placeholder="Tên thú cưng *" />
                    <div className="flex gap-3">
                      <select className="px-3 py-2 border border-gray-300 rounded-lg flex-1 outline-none focus:border-chloro" value={newPetForm.species} onChange={e => setNewPetForm({ ...newPetForm, species: e.target.value })}>
                        <option value="dog">Chó</option>
                        <option value="cat">Mèo</option>
                      </select>
                      <input className="px-3 py-2 border border-gray-300 rounded-lg flex-1 outline-none focus:border-chloro" value={newPetForm.breed} onChange={e => setNewPetForm({ ...newPetForm, breed: e.target.value })} placeholder="Giống (VD: Poodle)" />
                    </div>
                    <div className="flex gap-3">
                      <input className="px-3 py-2 border border-gray-300 rounded-lg flex-1 outline-none focus:border-chloro" type="number" step="0.1" value={newPetForm.weight} onChange={e => setNewPetForm({ ...newPetForm, weight: e.target.value })} placeholder="Cân nặng (kg)" />
                      <select className="px-3 py-2 border border-gray-300 rounded-lg flex-1 outline-none focus:border-chloro" value={newPetForm.gender} onChange={e => setNewPetForm({ ...newPetForm, gender: e.target.value })}>
                        <option value="male">Đực</option><option value="female">Cái</option><option value="unknown">Chưa rõ</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button onClick={() => setIsAddingPet(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Hủy</button>
                    <button 
                      onClick={async () => {
                        if(!newPetForm.pet_name) return alert('Vui lòng nhập tên thú cưng');
                        try {
                          const newPet = await createPet({ ...newPetForm, customer_id: localCustomer.customer_id });
                          setLocalPets([newPet, ...localPets]);
                          setIsAddingPet(false);
                          setNewPetForm({ pet_name: '', species: 'dog', breed: '', weight: '', gender: 'unknown', health_record: { skin_condition: '', coat_condition: '', ear_condition: '', eye_condition: '', nail_condition: '', wound_description: '', recorded_at: new Date().toISOString().split('T')[0] } });
                          handleAction('Đã thêm thú cưng mới!');
                          if (onSuccess) onSuccess();
                        } catch(e) { alert('Lỗi: ' + e.message); }
                      }}
                      className="px-4 py-2 text-sm font-bold bg-chloro text-white hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                    >
                      Xác nhận thêm
                    </button>
                  </div>
                </div>
              )}

              {localPets.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">Khách hàng chưa có dữ liệu thú cưng.</div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {localPets.map(pet => {
                    const isEditing = editingPetId === pet.pet_id;
                    return (
                    <div key={pet.pet_id} className={`border p-6 rounded-xl shadow-sm transition-colors ${isEditing ? 'bg-understory text-white border-understory' : 'bg-white border-gray-200 hover:border-chloro/50'}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4 items-center flex-1">
                          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-sm shrink-0 overflow-hidden ${isEditing ? 'bg-[#dcfce7]/20 border border-white/20' : 'bg-xantho/10 border border-gray-100'}`}>
                            {pet.pet_ava ? <img src={pet.pet_ava} alt="Pet Avatar" className="w-full h-full object-cover" /> : (pet.species === 'cat' ? '🐈' : '🐕')}
                          </div>
                          <div className="flex-1 min-w-0">
                            {isEditing ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-3">
                                  <input className="px-3 py-1 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 text-xl font-bold w-40 focus:outline-none focus:bg-white/20 transition-colors" value={petForm.pet_name} onChange={e => setPetForm({ ...petForm, pet_name: e.target.value })} placeholder="Tên thú cưng" />
                                  <select className="px-3 py-1 text-sm font-bold bg-white/10 border border-white/20 rounded-lg text-white outline-none focus:bg-white/20" value={petForm.gender} onChange={e => setPetForm({ ...petForm, gender: e.target.value })}>
                                    <option value="male" className="text-gray-800">Đực</option><option value="female" className="text-gray-800">Cái</option><option value="unknown" className="text-gray-800">Chưa rõ</option>
                                  </select>
                                </div>
                                <div className="flex gap-2 text-sm items-center">
                                  <input className="px-3 py-1 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 w-32 focus:outline-none focus:bg-white/20 transition-colors" value={petForm.breed} onChange={e => setPetForm({ ...petForm, breed: e.target.value })} placeholder="Giống" />
                                  <div className="flex items-center gap-1 bg-white/10 rounded-lg border border-white/20 px-3 py-1 w-24">
                                    <input className="bg-transparent text-white placeholder-white/50 w-full focus:outline-none" type="number" step="0.1" value={petForm.weight} onChange={e => setPetForm({ ...petForm, weight: e.target.value })} placeholder="Nặng" />
                                    <span>kg</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-bold text-understory text-xl truncate">{pet.pet_name}</h3>
                                <p className="text-lacustral font-medium truncate">{pet.breed} · {pet.weight}kg</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                          {!isEditing && (
                            <span className="text-sm font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
                              {pet.gender === 'male' ? 'Đực' : (pet.gender === 'female' ? 'Cái' : pet.gender)}
                            </span>
                          )}

                          {isEditing ? (
                            <div className="flex gap-2">
                              <button onClick={() => setEditingPetId(null)} className="text-sm font-bold bg-white/10 text-white hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/20">Hủy</button>
                              <button onClick={async () => {
                                try {
                                  // Tách health_record ra để không gửi lên Supabase
                                  const { health_record, ...petDataToSave } = petForm;
                                  await updatePet(petForm.pet_id, petDataToSave);
                                  
                                  // Cập nhật state local bao gồm cả health_record để hiển thị UI
                                  setLocalPets(localPets.map(p => p.pet_id === petForm.pet_id ? petForm : p));
                                  setEditingPetId(null);
                                  handleAction('Đã lưu hồ sơ thú cưng!');
                                  if (onSuccess) onSuccess();
                                } catch (e) { alert('Lỗi: ' + e.message); }
                              }} className="text-sm font-bold bg-[#82c696] text-white hover:bg-[#68a87b] px-4 py-2 rounded-xl transition-colors shadow-sm">Lưu lại</button>
                            </div>
                          ) : (
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => {
                                  setPetForm({
                                    ...pet,
                                    health_record: pet.health_record || {
                                      skin_condition: '', coat_condition: '', ear_condition: '', eye_condition: '', nail_condition: '', wound_description: '', recorded_at: new Date().toISOString().split('T')[0]
                                    }
                                  });
                                  setEditingPetId(pet.pet_id);
                                }}
                                className="text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                Chỉnh sửa
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('Bạn có chắc chắn muốn xóa thú cưng này? Việc này có thể thất bại nếu đã có lịch sử đặt dịch vụ.')) {
                                    try {
                                      await deletePet(pet.pet_id);
                                      setLocalPets(localPets.filter(p => p.pet_id !== pet.pet_id));
                                      setEditingPetId(null);
                                      handleAction('Đã xóa hồ sơ thú cưng!');
                                      if (onSuccess) onSuccess();
                                    } catch (e) { alert('Lỗi xóa thú cưng: ' + e.message); }
                                  }
                                }}
                                className="text-sm font-bold bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`space-y-4 pt-5 border-t ${isEditing ? 'border-white/20' : 'border-gray-100'} text-sm`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className={`text-xs font-bold mb-1.5 uppercase tracking-wider ${isEditing ? 'text-white/70' : 'text-lacustral'}`}>Hành vi & Tích cách</p>
                            {isEditing ? (
                              <textarea rows={3} className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg resize-none focus:outline-none focus:bg-white/20 transition-colors" value={petForm.behavior_notes} onChange={e => setPetForm({ ...petForm, behavior_notes: e.target.value })} placeholder="Ví dụ: Sợ tiếng ồn..." />
                            ) : (
                              <p className="text-understory bg-gray-50 p-3 rounded-lg font-medium">{pet.behavior_notes || 'Chưa ghi nhận'}</p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className={`text-xs font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1 ${isEditing ? 'text-white/70' : 'text-lacustral'}`}>
                                <AlertTriangle size={14} className={isEditing ? 'text-orange-400' : 'text-orange-500'} /> Dị ứng
                              </p>
                              {isEditing ? (
                                <textarea rows={3} className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg resize-none focus:outline-none focus:bg-white/20 transition-colors" value={petForm.allergy_notes} onChange={e => setPetForm({ ...petForm, allergy_notes: e.target.value })} placeholder="Ví dụ: Thịt gà..." />
                              ) : (
                                <p className="text-understory font-semibold bg-orange-50/50 p-3 rounded-lg">{pet.allergy_notes || 'Không'}</p>
                              )}
                            </div>
                            <div>
                              <p className={`text-xs font-bold mb-1.5 uppercase tracking-wider ${isEditing ? 'text-white/70' : 'text-lacustral'}`}>Lưu ý đặc biệt</p>
                              {isEditing ? (
                                <textarea rows={3} className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white placeholder-white/50 rounded-lg resize-none focus:outline-none focus:bg-white/20 transition-colors" value={petForm.special_notes} onChange={e => setPetForm({ ...petForm, special_notes: e.target.value })} placeholder="Lưu ý..." />
                              ) : (
                                <p className="text-understory font-medium bg-gray-50 p-3 rounded-lg">{pet.special_notes || 'Không có'}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className={`mt-4 pt-4 border-t ${isEditing ? 'border-white/20' : 'border-gray-100'}`}>
                          <div className={`flex items-center gap-2 mb-3 ${isEditing ? 'text-white/80' : 'text-lacustral'}`}>
                            <Stethoscope size={18} className={isEditing ? 'text-white/90' : 'text-chloro'} />
                            <h4 className={`font-bold ${isEditing ? 'text-white' : 'text-understory'}`}>Bệnh án / Kiểm tra sức khỏe</h4>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-auto ${isEditing ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                              {isEditing ? (petForm.health_record?.recorded_at || 'Chưa cập nhật') : (pet.health_record?.recorded_at || 'Chưa cập nhật')}
                            </span>
                          </div>
                          <div className={`grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 p-4 rounded-xl border ${isEditing ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-100'}`}>
                            {[
                              { key: 'skin_condition', label: 'Tình trạng Da' },
                              { key: 'coat_condition', label: 'Tình trạng Lông' },
                              { key: 'ear_condition', label: 'Tình trạng Tai' },
                              { key: 'eye_condition', label: 'Tình trạng Mắt' },
                              { key: 'nail_condition', label: 'Tình trạng Móng' },
                              { key: 'wound_description', label: 'Mô tả Vết thương' }
                            ].map(field => {
                              const defaultVal = field.key === 'wound_description' ? 'Không' : 'Bình thường';
                              const displayVal = pet.health_record?.[field.key] || defaultVal;
                              return (
                                <div key={field.key}>
                                  <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isEditing ? 'text-white/60' : 'text-gray-400'}`}>{field.label}</p>
                                  {isEditing ? (
                                    <input
                                      className="w-full px-2 py-1 text-sm bg-white/10 border border-white/20 text-white rounded font-medium focus:outline-none focus:bg-white/20 transition-colors placeholder-white/50"
                                      placeholder={defaultVal}
                                      value={petForm.health_record?.[field.key] || ''}
                                      onChange={e => setPetForm({ ...petForm, health_record: { ...petForm.health_record, [field.key]: e.target.value } })}
                                    />
                                  ) : (
                                    <p className={`font-medium ${displayVal === 'Bình thường' || displayVal === 'Không' ? 'text-gray-700' : 'text-orange-600 font-bold'}`}>
                                      {displayVal}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'BOOKINGS' && (
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-10 text-gray-400">Chưa có lịch sử sử dụng dịch vụ.</div>
              ) : (
                bookings.map(bk => (
                  <div 
                    key={bk.booking_id} 
                    className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between cursor-pointer hover:border-chloro transition-colors group"
                    onClick={() => onViewBooking && onViewBooking(bk)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${bk.service_type === 'Hotel' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {bk.service_type === 'Hotel' ? <Home size={20} /> : <ClipboardCheck size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-understory">{bk.booking_id} - {bk.pet?.pet_name || '...'}</h4>
                        <p className="text-sm text-lacustral mt-0.5">
                          {new Date(bk.created_at).toLocaleString('vi-VN')} · {bk.booking_service?.[0]?.service?.service_name || bk.booking_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${bk.status === 'COMPLETED_SERVICE' || bk.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                          bk.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-gray-50 text-gray-600 border-gray-200'
                        }`}>
                        {getStatusText(bk.status, bk.service_type)}
                      </span>
                      <p className="font-bold text-understory mt-2">{formatVND(bk.total_bill || 0)}</p>
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
