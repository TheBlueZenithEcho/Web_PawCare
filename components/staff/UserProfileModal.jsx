import { useState } from 'react';
import { X, Phone, Mail, Dog, Calendar, ClipboardCheck, AlertTriangle, ShieldCheck, Tag, Home, Stethoscope, Camera } from 'lucide-react';
import { formatVND } from '@/data/api';

export default function UserProfileModal({ customer, pets, bookings, onClose, onOpenCreateAccount }) {
  const [activeTab, setActiveTab] = useState('PETS'); // 'PETS' | 'BOOKINGS'
  const [toastMessage, setToastMessage] = useState('');
  
  const [localCustomer, setLocalCustomer] = useState(customer);
  const [localPets, setLocalPets] = useState(pets);

  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState(null);

  const [editingPetId, setEditingPetId] = useState(null);
  const [petForm, setPetForm] = useState(null);


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
          <div className="flex gap-6 items-center">
            <div className="relative w-24 h-24 rounded-full bg-[#dcfce7] shadow-lg border-4 border-white/20 shrink-0 group overflow-hidden cursor-pointer">
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-understory">
                {customer.first_name.charAt(0)}
              </div>
              {isEditingCustomer && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={24} />
                  <span className="text-[10px] font-bold mt-1">Thay đổi</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                {isEditingCustomer ? (
                  <div className="flex gap-2">
                    <input className="px-3 py-1 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 text-xl font-bold w-32 focus:outline-none focus:bg-white/20 transition-colors" value={customerForm.last_name} onChange={e => setCustomerForm({...customerForm, last_name: e.target.value})} placeholder="Họ" />
                    <input className="px-3 py-1 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 text-xl font-bold w-32 focus:outline-none focus:bg-white/20 transition-colors" value={customerForm.first_name} onChange={e => setCustomerForm({...customerForm, first_name: e.target.value})} placeholder="Tên" />
                  </div>
                ) : (
                  <h2 className="text-2xl font-bold">{localCustomer.last_name} {localCustomer.first_name}</h2>
                )}
                {localCustomer.is_account_activated ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-chloro text-white border border-green-500">
                    <ShieldCheck size={12} /> Đã có tài khoản
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-gray-500 text-white border border-gray-400">
                    <AlertTriangle size={12} /> Khách vãng lai
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm mb-3">ID: {localCustomer.customer_id} · Tham gia: {localCustomer.created_at}</p>
              
              <div className="flex gap-6 text-sm font-medium">
                {isEditingCustomer ? (
                  <div className="flex gap-4 w-full">
                    <input className="px-3 py-1.5 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 text-sm w-32 focus:outline-none focus:bg-white/20 transition-colors" value={customerForm.phone} onChange={e => setCustomerForm({...customerForm, phone: e.target.value})} placeholder="SĐT" />
                    <input className="px-3 py-1.5 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 text-sm flex-1 max-w-[200px] focus:outline-none focus:bg-white/20 transition-colors" value={customerForm.email} onChange={e => setCustomerForm({...customerForm, email: e.target.value})} placeholder="Email" />
                  </div>
                ) : (
                  <>
                    <p className="flex items-center gap-2"><Phone size={16} className="text-xantho" /> {localCustomer.phone}</p>
                    {localCustomer.email && <p className="flex items-center gap-2"><Mail size={16} className="text-xantho" /> {localCustomer.email}</p>}
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-4 items-center mr-8">
              <div className="flex flex-col gap-2 relative">
                {isEditingCustomer ? (
                  <div className="flex gap-2">
                    <button onClick={() => setIsEditingCustomer(false)} className="text-xs font-semibold bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/20">Hủy</button>
                    <button onClick={() => { setLocalCustomer(customerForm); setIsEditingCustomer(false); handleAction('Đã lưu thông tin khách hàng!'); }} className="text-xs font-semibold bg-[#82c696] text-white hover:bg-[#68a87b] px-3 py-1.5 rounded-lg transition-colors shadow-sm">💾 Lưu lại</button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setCustomerForm(localCustomer); setIsEditingCustomer(true); }}
                    className="text-xs font-semibold bg-white/10 text-white hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors border border-white/20 flex items-center justify-center gap-1"
                  >
                    ✏️ Chỉnh sửa khách hàng
                  </button>
                )}
              {!customer.is_account_activated && (
                <div className="flex flex-col gap-2 relative">
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
            className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'PETS' ? 'border-chloro text-chloro' : 'border-transparent text-gray-500 hover:text-understory'
            }`}
          >
            <Dog size={18} /> Pet Profile ({pets.length})
          </button>
          <button 
            onClick={() => setActiveTab('BOOKINGS')}
            className={`px-6 py-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'BOOKINGS' ? 'border-chloro text-chloro' : 'border-transparent text-gray-500 hover:text-understory'
            }`}
          >
            <Calendar size={18} /> Lịch sử dịch vụ ({bookings.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-crown/30">
          
          {activeTab === 'PETS' && (
            <div className="space-y-6">
              {localPets.length === 0 ? (
                <div className="text-center py-10 text-gray-400">Khách hàng chưa có dữ liệu thú cưng.</div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {localPets.map(pet => (
                    <div key={pet.pet_id} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:border-chloro/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 bg-xantho/30 rounded-full flex items-center justify-center text-3xl border-2 border-white shadow-sm shrink-0">
                            {pet.species === 'Mèo' ? '🐈' : '🐕'}
                          </div>
                          <div>
                            {editingPetId === pet.pet_id ? (
                              <div className="flex flex-col gap-2">
                                <input className="px-2 py-1 border border-gray-300 rounded font-bold text-understory w-full" value={petForm.pet_name} onChange={e => setPetForm({...petForm, pet_name: e.target.value})} placeholder="Tên thú cưng" />
                                <div className="flex gap-2 text-sm">
                                  <input className="px-2 py-1 border border-gray-300 rounded w-32" value={petForm.breed} onChange={e => setPetForm({...petForm, breed: e.target.value})} placeholder="Giống" />
                                  <input className="px-2 py-1 border border-gray-300 rounded w-20" type="number" step="0.1" value={petForm.weight} onChange={e => setPetForm({...petForm, weight: e.target.value})} placeholder="Nặng" /> kg
                                </div>
                              </div>
                            ) : (
                              <>
                                <h3 className="font-bold text-understory text-xl">{pet.pet_name}</h3>
                                <p className="text-lacustral font-medium">{pet.breed} · {pet.weight}kg</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {editingPetId === pet.pet_id ? (
                            <select className="px-2 py-1.5 text-sm font-bold bg-gray-50 border border-gray-300 rounded-lg text-gray-700" value={petForm.gender} onChange={e => setPetForm({...petForm, gender: e.target.value})}>
                              <option value="Đực">Đực</option><option value="Cái">Cái</option><option value="Chưa rõ">Chưa rõ</option>
                            </select>
                          ) : (
                            <span className="text-sm font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
                              {pet.gender}
                            </span>
                          )}
                          
                          {editingPetId === pet.pet_id ? (
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => setEditingPetId(null)} className="text-xs font-semibold text-gray-500 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">Hủy</button>
                              <button onClick={() => { setLocalPets(localPets.map(p => p.pet_id === petForm.pet_id ? petForm : p)); setEditingPetId(null); handleAction('Đã lưu hồ sơ thú cưng!'); }} className="text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm">💾 Lưu</button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => { 
                                setPetForm({
                                  ...pet,
                                  health_record: pet.health_record || {
                                    skin_condition: 'Bình thường', coat_condition: 'Bình thường', ear_condition: 'Bình thường', eye_condition: 'Bình thường', nail_condition: 'Bình thường', wound_description: 'Không', recorded_at: new Date().toISOString().split('T')[0]
                                  }
                                }); 
                                setEditingPetId(pet.pet_id); 
                              }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              ✏️ Chỉnh sửa thông tin
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-5 border-t border-gray-100 text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-lacustral font-bold mb-1.5 uppercase tracking-wider">Hành vi & Tích cách</p>
                            {editingPetId === pet.pet_id ? (
                              <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-understory font-medium resize-none" value={petForm.behavior_notes} onChange={e => setPetForm({...petForm, behavior_notes: e.target.value})} placeholder="Nhập hành vi..." />
                            ) : (
                              <p className="text-understory bg-gray-50 p-3 rounded-lg font-medium">{pet.behavior_notes || 'Chưa ghi nhận'}</p>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-lacustral font-bold mb-1.5 uppercase tracking-wider flex items-center gap-1">
                                <AlertTriangle size={14} className="text-orange-500" /> Dị ứng
                              </p>
                              {editingPetId === pet.pet_id ? (
                                <textarea rows={3} className="w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg text-understory font-medium resize-none" value={petForm.allergy_notes} onChange={e => setPetForm({...petForm, allergy_notes: e.target.value})} placeholder="Ví dụ: Thịt gà..." />
                              ) : (
                                <p className="text-understory font-semibold bg-orange-50/50 p-3 rounded-lg">{pet.allergy_notes || 'Không'}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-lacustral font-bold mb-1.5 uppercase tracking-wider">Lưu ý đặc biệt</p>
                              {editingPetId === pet.pet_id ? (
                                <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-understory font-medium resize-none" value={petForm.special_notes} onChange={e => setPetForm({...petForm, special_notes: e.target.value})} placeholder="Lưu ý..." />
                              ) : (
                                <p className="text-understory font-medium bg-gray-50 p-3 rounded-lg">{pet.special_notes || 'Không có'}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {(pet.health_record || editingPetId === pet.pet_id) && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-lacustral mb-3">
                              <Stethoscope size={18} className="text-chloro" />
                              <h4 className="font-bold text-understory">Bệnh án / Kiểm tra sức khỏe</h4>
                              <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 ml-auto">
                                {editingPetId === pet.pet_id ? petForm.health_record?.recorded_at : pet.health_record?.recorded_at}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                              {[
                                { key: 'skin_condition', label: 'Tình trạng Da' },
                                { key: 'coat_condition', label: 'Tình trạng Lông' },
                                { key: 'ear_condition', label: 'Tình trạng Tai' },
                                { key: 'eye_condition', label: 'Tình trạng Mắt' },
                                { key: 'nail_condition', label: 'Tình trạng Móng' },
                                { key: 'wound_description', label: 'Mô tả Vết thương' }
                              ].map(field => (
                                <div key={field.key}>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{field.label}</p>
                                  {editingPetId === pet.pet_id ? (
                                    <input 
                                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded font-medium text-understory"
                                      value={petForm.health_record?.[field.key] || ''}
                                      onChange={e => setPetForm({...petForm, health_record: {...petForm.health_record, [field.key]: e.target.value}})}
                                    />
                                  ) : (
                                    <p className={`font-medium ${(pet.health_record?.[field.key] || '').includes('Bình thường') || (pet.health_record?.[field.key] || '').includes('Không') ? 'text-gray-700' : 'text-orange-600 font-bold'}`}>
                                      {pet.health_record?.[field.key]}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                  <div key={bk.booking_id} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${bk.service_type === 'Hotel' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                        {bk.service_type === 'Hotel' ? <Home size={20} /> : <ClipboardCheck size={20} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-understory">{bk.booking_id} - {bk.pet_name}</h4>
                        <p className="text-sm text-lacustral mt-0.5">
                          {bk.checkin_date || bk.booking_time} · {bk.service_name || bk.service_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        bk.status === 'COMPLETED_SERVICE' || bk.status === 'DONE' ? 'bg-green-50 text-green-700 border-green-200' :
                        bk.status === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {getStatusText(bk.status, bk.service_type)}
                      </span>
                      <p className="font-bold text-understory mt-2">{formatVND(bk.total_amount)}</p>
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
