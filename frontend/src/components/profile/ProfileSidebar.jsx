import Link from 'next/link';
import { useRouter } from 'next/router';
import { User, PawPrint, CalendarClock, Settings, HelpCircle, LogOut, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase/client';
import Header from '../layout/Header'

const NAV_ITEMS = [
  { label: 'My Profile', href: '/customer/profile/tai-khoan', icon: User },
  { label: 'My Pets', href: '/customer/profile/thu-cung', icon: PawPrint },
  { label: 'Booking History', href: '/customer/profile/lich-su-dat', icon: CalendarClock },
];

export default function ProfileSidebar({ customer, loading, notLoggedIn, children }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/dang-nhap'); // Sửa lại route trang đăng nhập nếu cần
  };

  // 1. Xử lý trạng thái đang tải
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8E3] flex flex-col items-center justify-center text-wood-bark/50">
        <Loader2 size={32} className="animate-spin mb-3 text-understory" />
        <p className="font-semibold text-sm">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  // 2. Xử lý trạng thái chưa đăng nhập
  if (notLoggedIn || !customer) {
    return (
      <div className="min-h-screen bg-[#F7F8E3] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-wood-bark/30 mb-2">
          <User size={32} />
        </div>
        <h2 className="text-2xl font-bold text-wood-bark">Bạn chưa đăng nhập</h2>
        <p className="text-wood-bark/60 text-sm max-w-sm mb-2">
          Vui lòng đăng nhập để xem thông tin hồ sơ, quản lý thú cưng và lịch sử đặt chỗ.
        </p>
        <button 
          onClick={() => router.push('/dang-nhap')} 
          className="rounded-full bg-understory text-white px-8 py-3 text-sm font-bold hover:bg-wood-bark transition-colors"
        >
          Đến trang Đăng nhập
        </button>
      </div>
    );
  }

  // 3. Layout chính khi đã có dữ liệu
  return (
    <div className="min-h-screen bg-[#F7F8E3] flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8 lg:gap-12 flex-1">
        
        {/* Cột trái: Sidebar Menu */}
        <aside className="w-full lg:w-64 flex flex-col gap-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-fresh-grown/80 overflow-hidden flex items-center justify-center text-understory font-bold text-lg">
              {customer?.cus_ava ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customer.cus_ava} alt="" className="w-full h-full object-cover" />
              ) : (
                (customer?.first_name?.[0] || '?').toUpperCase()
              )}
            </div>
            <div>
              <p className="font-bold text-wood-bark leading-tight">
                {customer.first_name} {customer.last_name}
              </p>
              <p className="text-xs text-wood-bark/60 font-medium mt-0.5">
                Thành viên từ {new Date(customer.created_at).getFullYear()}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = router.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-understory text-white shadow-sm' 
                      : 'text-wood-bark/70 hover:bg-white hover:text-wood-bark hover:shadow-sm'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-col gap-1 mt-auto pt-6 border-t border-wood-bark/10">
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold text-wood-bark/70 hover:bg-white hover:text-wood-bark transition-colors text-left">
              <Settings size={18} /> Settings
            </button>
            <button className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold text-wood-bark/70 hover:bg-white hover:text-wood-bark transition-colors text-left">
              <HelpCircle size={18} /> Support
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors text-left mt-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        {/* Cột phải: Nội dung trang (children) */}
        <main className="flex-1 flex flex-col gap-6">
          {children}
        </main>

      </div>

      {/* GỢI Ý: Bạn có thể import <Footer /> vào đây */}
    </div>
  );
}