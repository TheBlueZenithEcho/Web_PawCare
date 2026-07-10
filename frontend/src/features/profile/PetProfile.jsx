import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { Loader2, Search, Plus, Calendar, Cake, X } from 'lucide-react';
// ĐÃ SỬA: Import đúng hàm lấy profile bằng ID từ service
import { getCustomerById } from '../../services/supabase/customerService'; 
import { getPetsByCustomer, getUpcomingCareForPet, createPet } from '../../services/supabase/customer/profile/petService';
import { calculateAge } from '../../utils/hotelRules';
import AccountLayout from '../../components/profile/ProfileSidebar'; // Đảm bảo đường dẫn này đúng với file ProfileSidebar của bạn

export default function MyPetsPage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  const [pets, setPets] = useState([]);
  const [upcomingByPet, setUpcomingByPet] = useState({});
  const [search, setSearch] = useState('');
  const [species, setSpecies] = useState('');
  const [loadingPets, setLoadingPets] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // ĐỒNG BỘ: Dùng localStorage giống hệt Header để nhận diện user
  useEffect(() => {
    const savedUserStr = localStorage.getItem('customer_user');
    
    if (!savedUserStr) {
      setNotLoggedIn(true);
      setLoading(false);
      return;
    }

    try {
      const savedUser = JSON.parse(savedUserStr);
      getCustomerById(savedUser.customer_id)
        .then((c) => {
          if (!c) {
            setNotLoggedIn(true);
            localStorage.removeItem('customer_user');
          } else {
            setCustomer(c);
          }
        })
        .catch((e) => {
          console.error(e);
          setNotLoggedIn(true);
        })
        .finally(() => setLoading(false));
    } catch (error) {
      setNotLoggedIn(true);
      setLoading(false);
    }
  }, []);

  const loadPets = useCallback(async () => {
    if (!customer) return;
    setLoadingPets(true);
    try {
      const list = await getPetsByCustomer(customer.customer_id, { search, species: species || undefined });
      setPets(list);
      const entries = await Promise.all(
        list.map((p) => getUpcomingCareForPet(p.pet_id).then((u) => [p.pet_id, u]))
      );
      setUpcomingByPet(Object.fromEntries(entries));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPets(false);
    }
  }, [customer, search, species]);

  useEffect(() => {
    if (customer) loadPets();
  }, [loadPets, customer]);

  return (
    <AccountLayout customer={customer} loading={loading} notLoggedIn={notLoggedIn}>
      {/* NỘI DUNG TRANG CHỈ HIỆN KHI ĐÃ ĐĂNG NHẬP */}
      {customer && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-wood-bark">My Pets</h1>
              <p className="text-wood-bark/60 mt-1">Quản lý thú cưng của bạn.</p>
            </div>
            {/* Các nút Search/Add... */}
          </div>
          {/* ... render danh sách pet ... */}
        </>
      )}
    </AccountLayout>
  );
}