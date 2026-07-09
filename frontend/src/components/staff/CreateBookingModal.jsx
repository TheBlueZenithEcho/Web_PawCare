import { useState, useEffect } from 'react';
import { X, Search, CheckCircle, ChevronRight, UserPlus, Calendar, Clock, MapPin } from 'lucide-react';
import { createRealBooking, searchCustomerWithPetsByPhone, fetchGroomingServices, fetchActiveRooms, fetchGroomingTables } from '@/services/supabase/supabaseBookingApi';

export default function CreateBookingModal({ onClose, onConfirm }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -- DB DATA --
  const [dbServices, setDbServices] = useState([]);
  const [dbRooms, setDbRooms] = useState([]);
  const [dbTables, setDbTables] = useState([]);

  // -- STEP 1 STATE: CUSTOMER & PET --
  const [phoneSearch, setPhoneSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isCustomerFound, setIsCustomerFound] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    customer_id: '',
    name: '',
    phone: '',
    pet_name: '',
    pet_type: 'Chó',
    pet_breed: '',
    pet_weight: ''
  });

  const [customerPets, setCustomerPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('new');
  const [isSearching, setIsSearching] = useState(false);

  // -- STEP 2 STATE: SERVICE & SCHEDULE --
  const [bookingType, setBookingType] = useState('Grooming');
  // For Grooming
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [selectedGroomingTable, setSelectedGroomingTable] = useState(null); // { table_id, table_code }
  const [selectedGroomingServices, setSelectedGroomingServices] = useState([]); // [{ service_id, price }]
  const availableSlots = ['09:00', '10:30', '14:00', '15:30', '17:00'];
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('QR');

  // Fetch real services, tables & rooms from DB on mount
  useEffect(() => {
    fetchGroomingServices().then(setDbServices).catch(console.error);
    fetchActiveRooms().then(setDbRooms).catch(console.error);
    fetchGroomingTables().then(setDbTables).catch(console.error);
  }, []);

  const getServicePrice = (service) => {
    // Tính giá theo cân nặng pet (S <= 5kg, M <= 15kg, L > 15kg)
    const weight = parseFloat(customerInfo.pet_weight) || 0;
    // Service chưa có giá phân loại → dùng price_s/price_m/price_l nếu có, hoặc flat price
    if (service.price_s !== undefined && service.price_m !== undefined && service.price_l !== undefined) {
      if (weight <= 5) return service.price_s;
      if (weight <= 15) return service.price_m;
      return service.price_l;
    }
    // Fallback: giá cố định hoặc ước tính theo size
    const baseMap = {
      'SER00001': { S: 200000, M: 250000, L: 300000 },
      'SER00002': { S: 250000, M: 300000, L: 350000 },
      'SV01': { S: 250000, M: 300000, L: 400000 },
      'SV02': { S: 200000, M: 250000, L: 300000 },
      'SV03': { S: 250000, M: 300000, L: 380000 },
    };
    const priceMap = baseMap[service.service_id];
    if (priceMap) {
      if (weight <= 5) return priceMap.S;
      if (weight <= 15) return priceMap.M;
      return priceMap.L;
    }
    return service.price || 100000; // Default
  };

  const handleSearchCustomer = async () => {
    if (!phoneSearch) return;
    setIsSearching(true);
    setHasSearched(true);

    try {
      const data = await searchCustomerWithPetsByPhone(phoneSearch);
      if (data) {
        setIsCustomerFound(true);
        setCustomerPets(data.pets || []);

        const firstPet = data.pets && data.pets.length > 0 ? data.pets[0] : null;
        if (firstPet) setSelectedPetId(firstPet.pet_id);
        else setSelectedPetId('new');

        setCustomerInfo({
          customer_id: data.customer_id,
          name: `${data.last_name || ''} ${data.first_name || ''}`.trim(),
          phone: data.phone || phoneSearch,
          pet_name: firstPet ? firstPet.pet_name : '',
          pet_type: firstPet ? (firstPet.species === 'cat' ? 'Mèo' : 'Chó') : 'Chó',
          pet_breed: firstPet ? firstPet.breed : '',
          pet_weight: firstPet ? firstPet.weight : ''
        });
      } else {
        setIsCustomerFound(false);
        setCustomerPets([]);
        setSelectedPetId('new');
        setCustomerInfo(prev => ({
          ...prev,
          customer_id: '',
          phone: phoneSearch,
          name: '',
          pet_name: '',
          pet_breed: '',
          pet_weight: ''
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePetSelectChange = (e) => {
    const val = e.target.value;
    setSelectedPetId(val);
    if (val === 'new') {
      setCustomerInfo(prev => ({ ...prev, pet_name: '', pet_type: 'Chó', pet_breed: '', pet_weight: '' }));
    } else {
      const pet = customerPets.find(p => p.pet_id === val);
      if (pet) {
        setCustomerInfo(prev => ({
          ...prev,
          pet_name: pet.pet_name,
          pet_type: pet.species === 'cat' ? 'Mèo' : 'Chó',
          pet_breed: pet.breed || '',
          pet_weight: pet.weight || ''
        }));
      }
    }
  };

  const toggleService = (service) => {
    setSelectedGroomingServices(prev => {
      const exists = prev.find(s => s.service_id === service.service_id);
      if (exists) return prev.filter(s => s.service_id !== service.service_id);
      return [...prev, { service_id: service.service_id, price: getServicePrice(service) }];
    });
  };

  const isServiceSelected = (serviceId) => selectedGroomingServices.some(s => s.service_id === serviceId);

  const calculateTotal = () => {
    if (bookingType === 'Grooming') {
      return selectedGroomingServices.reduce((sum, s) => sum + s.price, 0);
    } else {
      const room = dbRooms.find(r => r.room_id === selectedRoom);
      if (!room || !checkInDate || !checkOutDate) return 0;
      const diffTime = Math.abs(new Date(checkOutDate) - new Date(checkInDate));
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return room.price_per_night * diffDays;
    }
  };

  const getMatchedRooms = () => {
    const weight = parseFloat(customerInfo.pet_weight) || 0;
    const species = customerInfo.pet_type === 'Mèo' ? 'cat' : 'dog';
    return dbRooms.filter(r =>
      r.max_weight >= weight &&
      (r.suitable_species === 'both' || r.suitable_species === species)
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      const deposit = total > 1000000 ? total * 0.3 : 0;

      const bookingDataPayload = {
        customerData: {
          customer_id: customerInfo.customer_id,
          first_name: customerInfo.name.split(' ').slice(-1).join(' '),
          last_name: customerInfo.name.split(' ').slice(0, -1).join(' '),
          phone: customerInfo.phone
        },
        petData: {
          pet_id: selectedPetId === 'new' ? null : selectedPetId,
          pet_name: customerInfo.pet_name,
          species: customerInfo.pet_type === 'Mèo' ? 'cat' : 'dog',
          breed: customerInfo.pet_breed,
          weight: parseFloat(customerInfo.pet_weight) || 0
        },
        bookingType,
        staffId: 'STF00002',
        bookingDetails: {
          total_bill: total,
          deposit_amount: deposit,
          booking_service: bookingType === 'Grooming' ? selectedGroomingServices.map(s => ({
            service_id: s.service_id,
            slot_start: `${bookingDate}T${bookingTime}:00`,
            table_id: selectedGroomingTable?.table_id || null,
            price: s.price
          })) : null,
          booking_room: bookingType === 'Hotel' ? [{
            check_in_date: checkInDate,
            check_out_date: checkOutDate,
            room_id: selectedRoom,
            price_per_night: dbRooms.find(r => r.room_id === selectedRoom)?.price_per_night || 0
          }] : null
        }
      };

      await createRealBooking(bookingDataPayload);
      onConfirm();
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra: ' + (e.message || JSON.stringify(e)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep1 = () => customerInfo.name && customerInfo.phone && customerInfo.pet_name;

  const validateStep2 = () => {
    if (bookingType === 'Grooming') return bookingDate && bookingTime && selectedGroomingTable && selectedGroomingServices.length > 0;
    return checkInDate && checkOutDate && selectedRoom;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-understory">Tạo Booking Mới (Walk-in / Phone)</h2>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className={`font-semibold ${step >= 1 ? 'text-[#1a66cc]' : 'text-gray-400'}`}>1. Khách hàng & Thú cưng</span>
              <ChevronRight size={16} className="text-gray-300" />
              <span className={`font-semibold ${step >= 2 ? 'text-[#1a66cc]' : 'text-gray-400'}`}>2. Dịch vụ & Đặt chỗ</span>
              <ChevronRight size={16} className="text-gray-300" />
              <span className={`font-semibold ${step >= 3 ? 'text-[#1a66cc]' : 'text-gray-400'}`}>3. Xác nhận Booking</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">

          {/* STEP 1: KHÁCH HÀNG & THÚ CƯNG */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nhập SĐT để tra cứu Khách hàng</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={phoneSearch}
                      onChange={e => setPhoneSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearchCustomer()}
                      placeholder="Nhập số điện thoại..."
                      className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={handleSearchCustomer}
                      disabled={isSearching}
                      className="bg-[#1a66cc] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isSearching ? <span className="animate-spin text-xl leading-none">⏳</span> : <Search size={18} />}
                      {isSearching ? 'Đang tìm...' : 'Tra cứu'}
                    </button>
                  </div>
                </div>
              </div>

              {hasSearched && (
                <div className="border border-gray-200 rounded-xl p-5 mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    {isCustomerFound ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1"><CheckCircle size={14} /> Tìm thấy khách hàng cũ</span>
                    ) : (
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1"><UserPlus size={14} /> Tạo khách hàng mới</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên khách (*)</label>
                      <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">SĐT (*)</label>
                      <input type="text" value={customerInfo.phone} onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                    <div className="col-span-2 border-t border-gray-100 my-2 pt-4 flex items-center justify-between">
                      <h4 className="font-bold text-gray-800">Thông tin thú cưng</h4>
                      <span className="text-xs text-gray-400 font-normal">Dùng để gợi ý slot/phòng</span>
                    </div>
                    {customerPets.length > 0 && (
                      <div className="col-span-2 mb-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Chọn thú cưng đã lưu</label>
                        <select
                          value={selectedPetId}
                          onChange={handlePetSelectChange}
                          className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc] bg-blue-50/30"
                        >
                          {customerPets.map(pet => (
                            <option key={pet.pet_id} value={pet.pet_id}>
                              {pet.pet_name} - {pet.species === 'cat' ? 'Mèo' : 'Chó'} ({pet.breed || 'Không rõ'}, {pet.weight ? pet.weight + 'kg' : 'Không rõ kg'})
                            </option>
                          ))}
                          <option value="new">+ Thêm thú cưng mới cho khách này</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Pet (*)</label>
                      <input type="text" value={customerInfo.pet_name} onChange={e => setCustomerInfo({ ...customerInfo, pet_name: e.target.value })} disabled={selectedPetId !== 'new'} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc] disabled:bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Loài</label>
                      <select value={customerInfo.pet_type} onChange={e => setCustomerInfo({ ...customerInfo, pet_type: e.target.value })} disabled={selectedPetId !== 'new'} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc] disabled:bg-gray-100">
                        <option>Chó</option>
                        <option>Mèo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Giống</label>
                      <input type="text" value={customerInfo.pet_breed} onChange={e => setCustomerInfo({ ...customerInfo, pet_breed: e.target.value })} disabled={selectedPetId !== 'new'} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc] disabled:bg-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Cân nặng (kg)</label>
                      <input type="number" value={customerInfo.pet_weight} onChange={e => setCustomerInfo({ ...customerInfo, pet_weight: e.target.value })} disabled={selectedPetId !== 'new'} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc] disabled:bg-gray-100" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DỊCH VỤ & ĐẶT CHỖ */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Lựa chọn dịch vụ</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setBookingType('Grooming')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${bookingType === 'Grooming' ? 'border-[#1a66cc] bg-blue-50/50 ring-4 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <h3 className="font-bold text-gray-900 mb-1">Grooming & Spa ✂️</h3>
                    <p className="text-sm text-gray-500">Cắt tỉa, tắm gội, vệ sinh</p>
                  </button>
                  <button
                    onClick={() => setBookingType('Hotel')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${bookingType === 'Hotel' ? 'border-[#1a66cc] bg-blue-50/50 ring-4 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <h3 className="font-bold text-gray-900 mb-1">Pet Hotel 🏨</h3>
                    <p className="text-sm text-gray-500">Lưu trú ngày đêm</p>
                  </button>
                </div>
              </div>

              {bookingType === 'Grooming' ? (
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar size={18} /> Lịch Grooming</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày thực hiện</label>
                      <input type="date" value={bookingDate} onChange={e => { setBookingDate(e.target.value); setBookingTime(''); setSelectedGroomingTable(''); setSelectedGroomingServices([]); }} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                  </div>

                  {bookingDate && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Slot trống</label>
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map(slot => (
                          <button key={slot} onClick={() => { setBookingTime(slot); setSelectedGroomingTable(''); setSelectedGroomingServices([]); }}
                            className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors ${bookingTime === slot ? 'bg-[#1a66cc] text-white border-[#1a66cc]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a66cc]'}`}>
                            <Clock size={14} className="inline mr-1 mb-0.5" /> {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {bookingDate && bookingTime && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bàn Grooming</label>
                      <div className="flex flex-wrap gap-2">
                        {dbTables.length === 0 ? (
                          <p className="text-gray-400 text-sm">Đang tải bàn...</p>
                        ) : dbTables.map(table => (
                          <button key={table.table_id} onClick={() => setSelectedGroomingTable(table)}
                            className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors ${selectedGroomingTable?.table_id === table.table_id ? 'bg-[#1a66cc] text-white border-[#1a66cc]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a66cc]'}`}>
                            <MapPin size={14} className="inline mr-1 mb-0.5" /> {table.table_code}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {bookingDate && bookingTime && selectedGroomingTable && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><CheckCircle size={18} /> Dịch vụ muốn làm</h4>
                      {dbServices.length === 0 ? (
                        <p className="text-gray-400 text-sm">Đang tải dịch vụ...</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {dbServices.map(srv => {
                            const price = getServicePrice(srv);
                            const selected = isServiceSelected(srv.service_id);
                            return (
                              <div key={srv.service_id} onClick={() => toggleService(srv)}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors flex justify-between items-center ${selected ? 'bg-blue-50 border-[#1a66cc]' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                                <div className="flex items-center gap-2">
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${selected ? 'bg-[#1a66cc] border-[#1a66cc] text-white' : 'border-gray-300 bg-white'}`}>
                                    {selected && <CheckCircle size={14} />}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900">{srv.service_name}</div>
                                    {srv.description && <div className="text-xs text-gray-400">{srv.description}</div>}
                                  </div>
                                </div>
                                <div className="font-bold text-[#1a66cc]">{price.toLocaleString('vi-VN')}đ</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={18} /> Đặt phòng Lưu trú</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày Check-in</label>
                      <input type="date" value={checkInDate} onChange={e => setCheckInDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày Check-out</label>
                      <input type="date" value={checkOutDate} onChange={e => setCheckOutDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                  </div>
                  {checkInDate && checkOutDate && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phòng trống phù hợp ({customerInfo.pet_type}, {customerInfo.pet_weight}kg)
                      </label>
                      <div className="flex flex-col gap-2">
                        {getMatchedRooms().length > 0 ? getMatchedRooms().map(room => (
                          <div key={room.room_id} onClick={() => setSelectedRoom(room.room_id)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-colors flex justify-between items-center ${selectedRoom === room.room_id ? 'bg-blue-50 border-[#1a66cc]' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                            <div>
                              <div className="font-bold text-gray-900">{room.room_id}</div>
                              <div className="text-xs text-gray-500">
                                {room.suitable_species === 'dog' ? '🐕 Chó' : room.suitable_species === 'cat' ? '🐈 Mèo' : '🐾 Cả hai'} • Tối đa {room.max_weight}kg
                              </div>
                            </div>
                            <div className="font-bold text-[#1a66cc]">{room.price_per_night?.toLocaleString('vi-VN')}đ/đêm</div>
                          </div>
                        )) : (
                          <div className="p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm font-medium text-center">
                            Không có phòng trống phù hợp. Vui lòng chọn ngày khác!
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: XÁC NHẬN */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-[#f8faff] border border-blue-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#1a3b5c] mb-6 border-b border-blue-200 pb-4">Xác nhận thông tin Booking</h3>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Khách hàng</p>
                    <p className="font-semibold text-gray-900">{customerInfo.name} ({customerInfo.phone})</p>
                    {customerInfo.customer_id && <p className="text-xs text-gray-400">ID: {customerInfo.customer_id}</p>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Thú cưng</p>
                    <p className="font-semibold text-gray-900">{customerInfo.pet_name} · {customerInfo.pet_type} {customerInfo.pet_breed} · {customerInfo.pet_weight}kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dịch vụ</p>
                    <p className="font-semibold text-lg text-[#1a66cc]">{bookingType === 'Grooming' ? 'Grooming & Spa' : 'Pet Hotel'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Thời gian & Địa điểm</p>
                    {bookingType === 'Grooming' ? (
                      <p className="font-semibold text-gray-900">{bookingDate} lúc {bookingTime} · {selectedGroomingTable?.table_code || selectedGroomingTable}</p>
                    ) : (
                      <p className="font-semibold text-gray-900">{checkInDate} → {checkOutDate} · {selectedRoom}</p>
                    )}
                  </div>
                  {bookingType === 'Grooming' && selectedGroomingServices.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500 mb-2">Dịch vụ chọn</p>
                      <ul className="space-y-1">
                        {selectedGroomingServices.map(s => {
                          const srv = dbServices.find(d => d.service_id === s.service_id);
                          return (
                            <li key={s.service_id} className="flex justify-between items-center text-sm bg-gray-50/50 p-2 rounded border border-gray-100">
                              <span className="font-semibold text-gray-700 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                {srv?.service_name}
                              </span>
                              <span className="text-gray-600 font-medium">
                                {(s.price || 0).toLocaleString('vi-VN')}đ
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-white p-5 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Tổng tạm tính:</span>
                    <span className="text-xl font-bold text-gray-900">{calculateTotal().toLocaleString('vi-VN')}đ</span>
                  </div>
                  {calculateTotal() > 1000000 && (
                    <div className="pt-4 border-t border-gray-200 mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 font-semibold">Cần đặt cọc (30%):</span>
                        <span className="text-xl font-bold text-red-600">{(calculateTotal() * 0.3).toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm font-semibold text-gray-800 mb-3">Phương thức thu tiền cọc</p>
                        <div className="flex gap-2 mb-4">
                          <button onClick={() => setPaymentMethod('QR')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${paymentMethod === 'QR' ? 'bg-[#1a66cc] text-white border-[#1a66cc]' : 'bg-white text-gray-600 border-gray-300'}`}>
                            Mã QR (Chuyển khoản)
                          </button>
                          <button onClick={() => setPaymentMethod('CASH')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${paymentMethod === 'CASH' ? 'bg-[#1a66cc] text-white border-[#1a66cc]' : 'bg-white text-gray-600 border-gray-300'}`}>
                            Tiền mặt tại quầy
                          </button>
                        </div>
                        {paymentMethod === 'QR' ? (
                          <div className="flex items-center gap-4 bg-white p-3 border border-gray-200 rounded-lg">
                            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PawCareDeposit" alt="QR" className="w-full h-full object-cover rounded" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm mb-1">Mã QR Thanh Toán</p>
                              <p className="text-xs text-gray-500 mb-2">Đưa cho khách quét trực tiếp hoặc gửi qua Zalo/SMS.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-white border border-gray-200 rounded-lg">
                            <p className="font-bold text-gray-800">Nhận tiền mặt</p>
                            <p className="text-sm text-gray-500">Thu {(calculateTotal() * 0.3).toLocaleString('vi-VN')}đ từ khách hàng.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between">
          <button onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-white transition-colors">
            {step === 1 ? 'Hủy' : 'Quay lại'}
          </button>

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && !validateStep1()) { alert("Vui lòng điền đầy đủ thông tin bắt buộc (*)"); return; }
                if (step === 2 && !validateStep2()) { alert("Vui lòng chọn đầy đủ thời gian và dịch vụ/phòng trống"); return; }
                setStep(step + 1);
              }}
              className="px-6 py-2.5 bg-[#1a66cc] hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              Tiếp tục <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting}
              className="px-8 py-2.5 bg-[#82c696] hover:bg-[#6fa880] text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
              {isSubmitting ? 'Đang tạo...' : <><CheckCircle size={20} /> Xác nhận Booking</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
