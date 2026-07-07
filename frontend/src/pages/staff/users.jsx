import { useState, useEffect } from 'react';
import { Search, User, Users, Phone, Mail, Dog, Activity, Clock, ShieldCheck, ChevronRight, Filter, ShieldAlert } from 'lucide-react';
import StaffLayout from '@/components/layout/StaffLayout';
import { BOOKINGS } from '@/services/mock/mockBookings';
import { formatVND } from '@/services/mock/mockApi';
import { CUSTOMERS, PETS } from '@/services/mock/mockUsers';
import UserProfileModal from '@/components/staff/UserProfileModal';
import CreateCustomerModal from '@/components/staff/CreateCustomerModal';
import PetProfileModal from '@/components/staff/PetProfileModal';
import { fetchCustomers } from '@/services/supabase/supabaseUsersApi';

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCustomers();
        setCustomers(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (mainTab === 'CUSTOMERS') {
      let results = customers.map(c => {
        const completedBookings = BOOKINGS.filter(b => b.customer_phone === c.phone && (b.status === 'DONE' || b.status === 'PAID'));
        const calculatedTotal = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        return { ...c, total_spent: calculatedTotal };
      });
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
  }, [searchTerm, mainTab, customers, pets]);

  const getPetsCount = (customerId) => {
    return PETS.filter(p => p.customer_id === customerId).length;
  };

  return (
    <StaffLayout>
      <div className="p-4 md:p-6 w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-understory mb-1 flex items-center gap-3">
              <Users size={28} className="text-lacustral" />
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => setMainTab('CUSTOMERS')}
                  className={`transition-colors ${mainTab === 'CUSTOMERS' ? 'text-understory' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Khách hàng
                </button>
                <span className="text-gray-300 font-light">|</span>
                <button
                  onClick={() => setMainTab('PETS')}
                  className={`transition-colors ${mainTab === 'PETS' ? 'text-understory' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Thú cưng
                </button>
              </div>
            </h1>
            <p className="text-lacustral text-sm ml-[40px]">Quản lý thông tin khách hàng và hồ sơ thú cưng</p>
          </div>
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
                            <div className="w-10 h-10 rounded-full bg-understory/5 text-understory flex items-center justify-center font-bold text-sm ring-1 ring-understory/10">
                              {customer.first_name.charAt(0)}
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
                          {customer.is_account_activated ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">
                              <ShieldCheck size={14} /> Đã kích hoạt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                              <User size={14} /> Điểm bán / Walk-in
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
                        Không tìm thấy thú cưng nào.
                      </td>
                    </tr>
                  ) : (
                    filteredPets.map(pet => {
                      const owner = CUSTOMERS.find(c => c.customer_id === pet.customer_id);
                      return (
                        <tr
                          key={pet.pet_id}
                          onClick={() => setSelectedPet(pet)}
                          className="bg-white hover:bg-gray-50/80 cursor-pointer transition-colors shadow-sm ring-1 ring-gray-100 rounded-xl group"
                        >
                          <td className="px-6 py-4 rounded-l-xl">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-xl shadow-sm ring-1 ring-orange-100">
                                {pet.species === 'Mèo' ? '🐈' : '🐕'}
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
          pets={PETS.filter(p => p.customer_id === selectedUser.customer_id)}
          bookings={BOOKINGS.filter(b => b.customer_phone === selectedUser.phone)}
          onClose={() => setSelectedUser(null)}
          onOpenCreateAccount={(customer) => {
            setSelectedUser(null);
            setCreateModalData(customer);
            setIsCreateModalOpen(true);
          }}
        />
      )}

      {selectedPet && (
        <PetProfileModal
          pet={selectedPet}
          owner={CUSTOMERS.find(c => c.customer_id === selectedPet.customer_id)}
          bookings={BOOKINGS.filter(b => b.pet_name === selectedPet.pet_name && b.customer_phone === CUSTOMERS.find(c => c.customer_id === selectedPet.customer_id)?.phone)}
          onClose={() => setSelectedPet(null)}
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
    </StaffLayout>
  );
}
