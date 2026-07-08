import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search, User, Users, Phone, Mail, Dog, Activity, Clock, ShieldCheck, ChevronRight, Filter, ShieldAlert } from 'lucide-react';
import StaffLayout from '@/components/layout/StaffLayout';
import { formatVND } from '@/utils/format';
import UserProfileModal from '@/components/staff/UserProfileModal';
import CreateCustomerModal from '@/components/staff/CreateCustomerModal';
import PetProfileModal from '@/components/staff/PetProfileModal';
import ViewBookingModal from '@/components/staff/ViewBookingModal';
import { fetchCustomers, fetchPets } from '@/services/supabase/supabaseUsersApi';
import { fetchBookings } from '@/services/supabase/supabaseBookingApi';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredPets, setFilteredPets] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalData, setCreateModalData] = useState(null);
  const [mainTab, setMainTab] = useState('CUSTOMERS');

  const [customers, setCustomers] = useState([]);
  const [pets, setPets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBookingForView, setSelectedBookingForView] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);

  const loadData = async () => {
    try {
      let tempError = null;
      const custData = await fetchCustomers().catch(e => {
        console.error('Failed to load customers:', e);
        return [];
      });
      const petData = await fetchPets().catch(e => {
        console.error('Failed to load pets:', e);
        tempError = e.message || e.toString();
        return [];
      });
      const bookData = await fetchBookings().catch(e => {
        console.error('Failed to load bookings:', e);
        return [];
      });
      
      setCustomers(custData || []);
      setPets(petData || []);
      setBookings(bookData || []);
      if (tempError) setErrorMsg(tempError);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || e.toString());
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (mainTab === 'CUSTOMERS') {
      let results = customers;
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        results = results.filter(c =>
          c.phone?.includes(lower) ||
          `${c.last_name} ${c.first_name}`.toLowerCase().includes(lower) ||
          (c.email && c.email.toLowerCase().includes(lower))
        );
      }
      setFilteredCustomers(results);
    } else {
      let results = pets;
      if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        results = results.filter(p =>
          p.pet_name?.toLowerCase().includes(lower) ||
          p.breed?.toLowerCase().includes(lower) ||
          p.species?.toLowerCase().includes(lower)
        );
      }
      setFilteredPets(results);
    }
  }, [searchTerm, mainTab, customers, pets, bookings]);

  const getPetsCount = (customerId) => {
    return pets.filter(p => p.customer_id === customerId).length;
  };

  return (
    <StaffLayout>
      <Head>
        <title>PawCare - Tài khoản & Hồ sơ</title>
      </Head>
      <div className="p-4 md:p-6 w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-understory flex items-center gap-3">
            <Users size={28} className="text-lacustral" />
            Tài khoản & Hồ sơ
            <div className="ml-4 bg-gray-100/80 p-1 rounded-full flex text-sm font-semibold border border-gray-200/60">
              <button
                onClick={() => setMainTab('CUSTOMERS')}
                className={`px-4 py-1.5 rounded-full transition-all ${mainTab === 'CUSTOMERS' ? 'bg-white text-understory shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Khách hàng
              </button>
              <button
                onClick={() => setMainTab('PETS')}
                className={`px-4 py-1.5 rounded-full transition-all ${mainTab === 'PETS' ? 'bg-white text-understory shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Thú cưng
              </button>
            </div>
          </h1>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setCreateModalData(null);
                setIsCreateModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 bg-[#5e9e30] hover:bg-[#4d8227] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm w-full sm:w-auto"
            >
              <User size={20} /> Thêm khách hàng mới
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

          {/* Top Bar: Search */}
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50/50 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={mainTab === 'CUSTOMERS' ? "Tìm theo Số điện thoại, Tên, Email..." : "Tìm tên thú cưng, giống, loài..."}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1a66cc] w-72 sm:w-96"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1 p-4 bg-gray-50/30">
            {mainTab === 'CUSTOMERS' ? (
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-xs uppercase text-gray-400 bg-transparent">
                    <th className="px-6 py-3 font-bold">Khách hàng</th>
                    <th className="px-6 py-3 font-bold">Liên hệ</th>
                    <th className="px-6 py-3 font-bold">Thú cưng</th>
                    <th className="px-6 py-3 font-bold">Trạng thái Website</th>
                    <th className="px-6 py-3 font-bold">Tổng chi tiêu</th>
                    <th className="px-6 py-3 font-bold"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-gray-400">
                        Không tìm thấy khách hàng nào.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => (
                      <tr
                        key={customer.customer_id}
                        onClick={() => setSelectedUser(customer)}
                        className="bg-white hover:bg-gray-50/80 cursor-pointer transition-colors shadow-sm ring-1 ring-gray-100 rounded-xl group"
                      >
                        <td className="px-6 py-4 rounded-l-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-understory/5 text-understory flex items-center justify-center font-bold text-sm ring-1 ring-understory/10 overflow-hidden">
                              {customer.cus_ava ? (
                                <img src={customer.cus_ava} alt="Customer Avatar" className="w-full h-full object-cover" />
                              ) : (
                                customer.first_name.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 group-hover:text-chloro transition-colors">{customer.last_name} {customer.first_name}</p>
                              <p className="text-xs text-gray-500 font-medium">ID: {customer.customer_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                              <Phone size={14} className="text-gray-400" /> {customer.phone}
                            </p>
                            {customer.email && (
                              <p className="text-xs font-medium text-gray-500 flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" /> {customer.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Dog size={16} className="text-chloro" />
                            {getPetsCount(customer.customer_id)} bé
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {customer.user_id ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">
                              <ShieldCheck size={14} /> Khách có tài khoản
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                              <User size={14} /> Khách vãng lai
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-chloro">{formatVND(customer.total_spent)}</p>
                        </td>
                        <td className="px-6 py-4 text-right rounded-r-xl">
                          <ChevronRight className="inline text-gray-300 group-hover:text-chloro transition-transform group-hover:translate-x-1" size={20} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-xs uppercase text-gray-400 bg-transparent">
                    <th className="px-6 py-3 font-bold">Thú cưng</th>
                    <th className="px-6 py-3 font-bold">Chủ sở hữu</th>
                    <th className="px-6 py-3 font-bold">Cân nặng</th>
                    <th className="px-6 py-3 font-bold">Lưu ý / Tình trạng</th>
                    <th className="px-6 py-3 font-bold"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPets.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-gray-400">
                        {errorMsg ? (
                          <div className="text-red-500 font-bold">Lỗi tải dữ liệu: {errorMsg}</div>
                        ) : (
                          "Không tìm thấy thú cưng nào."
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredPets.map(pet => {
                      const owner = customers.find(c => c.customer_id === pet.customer_id);
                      return (
                        <tr
                          key={pet.pet_id}
                          onClick={() => setSelectedPet(pet)}
                          className="bg-white hover:bg-gray-50/80 cursor-pointer transition-colors shadow-sm ring-1 ring-gray-100 rounded-xl group"
                        >
                          <td className="px-6 py-4 rounded-l-xl">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-xl shadow-sm ring-1 ring-orange-100 overflow-hidden">
                                {pet.pet_ava ? (
                                  <img src={pet.pet_ava} alt={pet.pet_name} className="w-full h-full object-cover" />
                                ) : (
                                  pet.species === 'cat' ? '🐈' : '🐕'
                                )}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 group-hover:text-chloro transition-colors">{pet.pet_name}</p>
                                <p className="text-sm text-gray-500 font-medium">{pet.breed}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-1">
                              <span className="font-bold text-gray-900">{owner?.last_name} {owner?.first_name}</span>
                              <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Phone size={12} /> {owner?.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">{pet.weight} kg</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {pet.allergy_notes && pet.allergy_notes !== 'Không' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 shadow-sm">
                                  Dị ứng
                                </span>
                              )}
                              {pet.behavior_notes && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200 truncate max-w-[150px] shadow-sm" title={pet.behavior_notes}>
                                  {pet.behavior_notes}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right rounded-r-xl">
                            <ChevronRight className="inline text-gray-300 group-hover:text-chloro transition-transform group-hover:translate-x-1" size={20} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {selectedUser && (
        <UserProfileModal
          customer={selectedUser}
          pets={pets.filter(p => p.customer_id === selectedUser.customer_id)}
          bookings={bookings.filter(b => b.customer_id === selectedUser.customer_id)}
          onClose={() => setSelectedUser(null)}
          onSuccess={() => {
            loadData();
            // Cập nhật lại state selectedUser để giao diện Modal cũng tự động update mà không cần đóng mở lại (tuỳ chọn)
          }}
          onOpenCreateAccount={(customer) => {
            setSelectedUser(null);
            setCreateModalData(customer);
            setIsCreateModalOpen(true);
          }}
          onViewBooking={(bk) => setSelectedBookingForView(bk)}
        />
      )}

      {selectedPet && (
        <PetProfileModal
          pet={selectedPet}
          owner={customers.find(c => c.customer_id === selectedPet.customer_id)}
          bookings={bookings.filter(b => b.pet_id === selectedPet.pet_id)}
          onClose={() => setSelectedPet(null)}
          onSuccess={loadData}
          onViewBooking={(bk) => setSelectedBookingForView(bk)}
        />
      )}

      {isCreateModalOpen && (
        <CreateCustomerModal
          initialData={createModalData}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateModalData(null);
          }}
        />
      )}

      {selectedBookingForView && (
        <ViewBookingModal
          booking={selectedBookingForView}
          onClose={() => setSelectedBookingForView(null)}
        />
      )}
    </StaffLayout>
  );
}
