import { useState } from 'react';
import { X, Search, CheckCircle, ChevronRight, UserPlus, Calendar, Clock, MapPin } from 'lucide-react';
import { createBooking } from '@/services/mock/mockApi';

export default function CreateBookingModal({ onClose, onConfirm }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // -- STEP 1 STATE: CUSTOMER & PET --
  const [phoneSearch, setPhoneSearch] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isCustomerFound, setIsCustomerFound] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    pet_name: '',
    pet_type: 'Chó',
    pet_breed: '',
    pet_weight: ''
  });

  // -- STEP 2 STATE: SERVICE & SCHEDULE --
  const [bookingType, setBookingType] = useState('Grooming');
  // For Grooming
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedGroomingTable, setSelectedGroomingTable] = useState('');
  const [selectedGroomingServices, setSelectedGroomingServices] = useState([]);
  const groomingTables = ['Bàn 1', 'Bàn 2', 'Bàn 3'];
  // For Hotel
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  // Mock available slots/rooms
  const availableSlots = ['09:00', '10:30', '14:00', '15:30', '17:00'];
  const physicalRooms = [
    { id: 'ROOM-S01', name: 'Phòng S01', max_weight: 5, price: 150000 },
    { id: 'ROOM-S02', name: 'Phòng S02', max_weight: 5, price: 150000 },
    { id: 'ROOM-M01', name: 'Phòng M01', max_weight: 15, price: 250000 },
    { id: 'ROOM-M02', name: 'Phòng M02', max_weight: 15, price: 250000 },
    { id: 'ROOM-L01', name: 'Phòng L01', max_weight: 40, price: 400000 },
    { id: 'ROOM-L02', name: 'Phòng L02', max_weight: 40, price: 400000 }
  ];
  
  const groomingServiceOptions = [
    { id: 'bath', name: 'Tắm vệ sinh', prices: { S: 200000, M: 250000, L: 300000 } },
    { id: 'cut', name: 'Cắt Tỉa Lông', prices: { S: 250000, M: 300000, L: 350000 } },
  ];

  const getGroomingPrice = (service) => {
    const weight = parseFloat(customerInfo.pet_weight) || 0;
    if (weight <= 5) return service.prices.S;
    if (weight <= 15) return service.prices.M;
    return service.prices.L;
  };

  const [paymentMethod, setPaymentMethod] = useState('QR');

  const handleSearchCustomer = () => {
    setHasSearched(true);
    if (phoneSearch === '0912345678') {
      setIsCustomerFound(true);
      setCustomerInfo({
        name: 'Lê Đức Tuấn',
        phone: '0912345678',
        pet_name: 'Corgi Béo',
        pet_type: 'Chó',
        pet_breed: 'Corgi',
        pet_weight: '12'
      });
    } else {
      setIsCustomerFound(false);
      setCustomerInfo(prev => ({ ...prev, phone: phoneSearch, name: '', pet_name: '', pet_breed: '', pet_weight: '' }));
    }
  };

  const calculateTotal = () => {
    if (bookingType === 'Grooming') {
      let total = 0;
      selectedGroomingServices.forEach(id => {
        const srv = groomingServiceOptions.find(s => s.id === id);
        if (srv) total += getGroomingPrice(srv);
      });
      return total;
    } else {
      const room = physicalRooms.find(r => r.id === selectedRoom);
      if (!room || !checkInDate || !checkOutDate) return 0;
      
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); 
      return room.price * diffDays;
    }
  };

  const getMatchedRooms = () => {
    const weight = parseFloat(customerInfo.pet_weight) || 0;
    return physicalRooms.filter(r => r.max_weight >= weight);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const total = calculateTotal();
      await createBooking({
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        pet_name: customerInfo.pet_name,
        pet_type: customerInfo.pet_type,
        pet_breed: customerInfo.pet_breed,
        pet_weight: parseFloat(customerInfo.pet_weight) || 0,
        service_type: bookingType,
        service_category: bookingType,
        booking_time: bookingType === 'Grooming' ? `${bookingDate} ${bookingTime}` : `${checkInDate} to ${checkOutDate}`,
        total_amount: total,
        deposit_amount: total > 1000000 ? total * 0.3 : 0,
        room_or_slot_id: bookingType === 'Grooming' ? 'SLOT-01' : selectedRoom
      });
      onConfirm();
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const validateStep1 = () => {
    return customerInfo.name && customerInfo.phone && customerInfo.pet_name;
  };

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
                      placeholder="Nhập 0912345678 để test..."
                      className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button 
                      onClick={handleSearchCustomer}
                      className="bg-[#1a66cc] text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      <Search size={18}/> Tra cứu
                    </button>
                  </div>
                </div>
              </div>

              {hasSearched && (
                <div className="border border-gray-200 rounded-xl p-5 mt-4">
                  <div className="flex items-center gap-2 mb-4">
                    {isCustomerFound ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1"><CheckCircle size={14}/> Tìm thấy khách hàng cũ</span>
                    ) : (
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 flex items-center gap-1"><UserPlus size={14}/> Tạo khách hàng mới</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên khách (*)</label>
                      <input type="text" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">SĐT (*)</label>
                      <input type="text" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                    <div className="col-span-2 border-t border-gray-100 my-2 pt-4 flex items-center justify-between">
                      <h4 className="font-bold text-gray-800">Thông tin thú cưng sơ bộ</h4>
                      <span className="text-xs text-gray-400 font-normal">Dùng để gợi ý slot/phòng</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Pet (*)</label>
                      <input type="text" value={customerInfo.pet_name} onChange={e => setCustomerInfo({...customerInfo, pet_name: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Loài</label>
                      <select value={customerInfo.pet_type} onChange={e => setCustomerInfo({...customerInfo, pet_type: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]">
                        <option>Chó</option>
                        <option>Mèo</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Giống</label>
                      <input type="text" value={customerInfo.pet_breed} onChange={e => setCustomerInfo({...customerInfo, pet_breed: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Kích thước/Cân nặng (kg)</label>
                      <input type="number" value={customerInfo.pet_weight} onChange={e => setCustomerInfo({...customerInfo, pet_weight: e.target.value})} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
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
                    <h3 className="font-bold text-gray-900 mb-1">Grooming & Spa</h3>
                    <p className="text-sm text-gray-500">Cắt tỉa, tắm gội, vệ sinh</p>
                  </button>
                  <button 
                    onClick={() => setBookingType('Hotel')}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${bookingType === 'Hotel' ? 'border-[#1a66cc] bg-blue-50/50 ring-4 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <h3 className="font-bold text-gray-900 mb-1">Pet Hotel</h3>
                    <p className="text-sm text-gray-500">Lưu trú ngày đêm</p>
                  </button>
                </div>
              </div>

              {bookingType === 'Grooming' ? (
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar size={18}/> Lịch trống Grooming</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày thực hiện</label>
                      <input type="date" value={bookingDate} onChange={e => {setBookingDate(e.target.value); setBookingTime(''); setSelectedGroomingTable(''); setSelectedGroomingServices([]);}} className="w-full p-2 border border-gray-300 rounded-md outline-none focus:border-[#1a66cc]" />
                    </div>
                  </div>
                  
                  {bookingDate && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Slot trống khả dụng</label>
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map(slot => (
                          <button 
                            key={slot}
                            onClick={() => {setBookingTime(slot); setSelectedGroomingTable(''); setSelectedGroomingServices([]);}}
                            className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors ${bookingTime === slot ? 'bg-[#1a66cc] text-white border-[#1a66cc]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a66cc]'}`}
                          >
                            <Clock size={14} className="inline mr-1 mb-0.5" /> {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {bookingDate && bookingTime && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bàn Grooming còn trống</label>
                      <div className="flex flex-wrap gap-2">
                        {groomingTables.map(table => (
                          <button 
                            key={table}
                            onClick={() => setSelectedGroomingTable(table)}
                            className={`px-4 py-2 rounded-lg font-semibold border-2 transition-colors ${selectedGroomingTable === table ? 'bg-[#1a66cc] text-white border-[#1a66cc]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#1a66cc]'}`}
                          >
                            <MapPin size={14} className="inline mr-1 mb-0.5" /> {table}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {bookingDate && bookingTime && selectedGroomingTable && (
                    <div className="mt-6 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><CheckCircle size={18}/> Các dịch vụ muốn làm</h4>
                      <div className="flex flex-col gap-2 mb-2">
                        {groomingServiceOptions.map(srv => {
                          const price = getGroomingPrice(srv);
                          const isSelected = selectedGroomingServices.includes(srv.id);
                          return (
                            <div 
                              key={srv.id} 
                              onClick={() => {
                                if(isSelected) setSelectedGroomingServices(prev => prev.filter(id => id !== srv.id));
                                else setSelectedGroomingServices(prev => [...prev, srv.id]);
                              }}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors flex justify-between items-center ${isSelected ? 'bg-blue-50 border-[#1a66cc]' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${isSelected ? 'bg-[#1a66cc] border-[#1a66cc] text-white' : 'border-gray-300 bg-white'}`}>
                                  {isSelected && <CheckCircle size={14} />}
                                </div>
                                <div className="font-bold text-gray-900">{srv.name}</div>
                              </div>
                              <div className="font-bold text-[#1a66cc]">{price.toLocaleString('vi-VN')}đ</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin size={18}/> Đặt phòng Lưu trú</h4>
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phòng trống phù hợp với thú cưng ({customerInfo.pet_weight}kg)</label>
                      <div className="flex flex-col gap-2">
                        {getMatchedRooms().length > 0 ? (
                          getMatchedRooms().map(room => (
                            <div 
                              key={room.id}
                              onClick={() => setSelectedRoom(room.id)}
                              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors flex justify-between items-center ${selectedRoom === room.id ? 'bg-blue-50 border-[#1a66cc]' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                            >
                              <div>
                                <div className="font-bold text-gray-900">{room.name}</div>
                                <div className="text-xs text-gray-500">Sức chứa: Phù hợp {customerInfo.pet_type} tối đa {room.max_weight}kg</div>
                              </div>
                              <div className="font-bold text-[#1a66cc]">
                                {room.price.toLocaleString('vi-VN')}đ/đêm
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-sm font-medium text-center">
                            Không có phòng trống phù hợp với thú cưng ({customerInfo.pet_weight}kg) trong thời gian này. Vui lòng chọn ngày khác!
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
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Thú cưng</p>
                    <p className="font-semibold text-gray-900">{customerInfo.pet_name} · {customerInfo.pet_type} {customerInfo.pet_breed} · {customerInfo.pet_weight}kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Dịch vụ</p>
                    <p className="font-semibold text-lg text-[#1a66cc]">{bookingType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Thời gian & Địa điểm</p>
                    {bookingType === 'Grooming' ? (
                      <p className="font-semibold text-gray-900">{bookingDate} lúc {bookingTime}</p>
                    ) : (
                      <p className="font-semibold text-gray-900">{checkInDate} đến {checkOutDate} (Phòng: {selectedRoom})</p>
                    )}
                  </div>
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
                          <button 
                            onClick={() => setPaymentMethod('QR')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${paymentMethod === 'QR' ? 'bg-[#1a66cc] text-white border-[#1a66cc]' : 'bg-white text-gray-600 border-gray-300'}`}
                          >
                            Mã QR (Chuyển khoản)
                          </button>
                          <button 
                            onClick={() => setPaymentMethod('CASH')}
                            className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${paymentMethod === 'CASH' ? 'bg-[#1a66cc] text-white border-[#1a66cc]' : 'bg-white text-gray-600 border-gray-300'}`}
                          >
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
                              <button className="text-[#1a66cc] hover:underline text-sm font-semibold">Gửi QR qua Zalo</button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-white border border-gray-200 rounded-lg">
                            <p className="font-bold text-gray-800">Nhận tiền mặt</p>
                            <p className="text-sm text-gray-500">Vui lòng thu {((calculateTotal() * 0.3)).toLocaleString('vi-VN')}đ từ khách hàng.</p>
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
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-white transition-colors"
          >
            {step === 1 ? 'Hủy' : 'Quay lại'}
          </button>

          {step < 3 ? (
            <button 
              onClick={() => {
                if (step === 1 && !validateStep1()) {
                  alert("Vui lòng điền đầy đủ thông tin bắt buộc (*)");
                  return;
                }
                if (step === 2 && !validateStep2()) {
                  alert("Vui lòng chọn đầy đủ thời gian và dịch vụ/phòng trống");
                  return;
                }
                setStep(step + 1);
              }}
              className="px-6 py-2.5 bg-[#1a66cc] hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              Tiếp tục <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-[#82c696] hover:bg-[#6fa880] text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Đang tạo...' : <><CheckCircle size={20} /> Xác nhận Booking</>}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
