import { useState } from 'react';
import Link from 'next/link';
import { Users, CalendarDays, ClipboardCheck, ShoppingCart, PackageSearch, AlertTriangle, Home, LogOut, Menu, X, Scissors } from 'lucide-react';
import { useRouter } from 'next/router';

export default function StaffLayout({ children }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Tài khoản & Hồ sơ', sub: 'Pet Profile, Quản lý KH', icon: Users, href: '/staff/users' },
    { name: 'Tiếp nhận & Đặt lịch', sub: 'Trạm điều phối, Đặt lịch', icon: ClipboardCheck, href: '/staff' },
    { name: 'Lưu trú', sub: 'Nhật ký, Cho ăn, Vui chơi', icon: Home, href: '/staff/sitter' },
    { name: 'Grooming/Spa', sub: 'Thực hiện Grooming/Spa', icon: Scissors, href: '/staff/groomer' },
    { name: 'Cửa hàng', sub: 'Bán lẻ, Đơn vị vận chuyển', icon: ShoppingCart, href: '/staff/shop' },
    { name: 'Kho & Giao hàng', sub: 'Xuất/Nhập kho, Đóng gói', icon: PackageSearch, href: '/staff/inventory' },
    { name: 'Khẩn cấp & Ngoại lệ', sub: 'Báo sự cố, Đổi lịch/Hoàn cọc', icon: AlertTriangle, href: '/staff/emergency' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex justify-center">
      {/* Container 1440px */}
      <div className="w-full max-w-[1440px] h-screen bg-crown flex relative shadow-xl overflow-hidden">
        
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`absolute md:relative z-30 h-full w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg md:shadow-sm transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-4 md:p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🐾</div>
              <div>
                <h1 className="font-bold text-lg leading-tight text-understory">PawCare</h1>
                <p className="text-xs text-lacustral">Staff Portal</p>
              </div>
            </div>
            <button 
              className="md:hidden text-gray-500 hover:text-gray-800"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          <div className="px-4 py-2 flex-1 overflow-y-auto no-scrollbar">
            <p className="text-xs font-semibold text-gray-400 mb-4 tracking-wider uppercase">Chức năng hệ thống</p>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = router.pathname === item.href || (item.href === '/staff' && router.pathname.startsWith('/staff/reception'));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-start gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive 
                        ? 'bg-chloro text-white shadow-md shadow-chloro/20' 
                        : 'text-gray-600 hover:bg-xantho/30 hover:text-understory'
                    }`}
                  >
                    <item.icon size={20} className={`mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-lacustral'}`} />
                    <div>
                      <p className={`font-semibold text-sm leading-tight ${isActive ? 'text-white' : 'text-understory'}`}>{item.name}</p>
                      <p className={`text-[11px] mt-0.5 leading-tight ${isActive ? 'text-xantho' : 'text-gray-500'}`}>{item.sub}</p>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto p-4 border-t border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-xantho text-understory flex items-center justify-center font-bold text-sm shadow-sm border-2 border-white shrink-0">
                NV
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-understory truncate">Nhân viên</p>
                <p className="text-xs font-medium text-lacustral truncate">Ca Sáng (08:00 - 16:00)</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/staff/login')}
              title="Đăng xuất"
              className="p-2 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-crown relative">
          {/* Mobile Header (Only visible on md-) */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="text-xl">🐾</div>
              <h1 className="font-bold text-lg text-understory">PawCare</h1>
            </div>
            <button 
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
