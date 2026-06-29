import { useState } from 'react';
import Link from 'next/link';
import { Users, ClipboardCheck, ShoppingCart, PackageSearch, AlertTriangle, Home, LogOut, Scissors } from 'lucide-react';
import { useRouter } from 'next/router';
import GlobalHeader from '../shared/GlobalHeader';

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
      <div className="w-full max-w-[1440px] h-screen bg-fresh-grown flex flex-col relative shadow-xl overflow-hidden">
        
        {/* Global Header */}
        <GlobalHeader onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <div className="flex-1 flex relative overflow-hidden">
          {/* Sidebar */}
          <aside className={`absolute md:relative z-30 h-full w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg md:shadow-sm transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="px-4 py-6 flex-1 overflow-y-auto no-scrollbar">
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
                          ? 'bg-fig-leaf text-white shadow-md shadow-fig-leaf/20' 
                          : 'text-gray-600 hover:bg-fresh-grown hover:text-wood-bark'
                      }`}
                    >
                      <item.icon size={20} className={`mt-0.5 shrink-0 ${isActive ? 'text-white' : 'text-lacustral'}`} />
                      <div>
                        <p className={`font-semibold text-sm leading-tight ${isActive ? 'text-white' : 'text-wood-bark'}`}>{item.name}</p>
                        <p className={`text-[11px] mt-0.5 leading-tight ${isActive ? 'text-fresh-grown' : 'text-gray-500'}`}>{item.sub}</p>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="mt-auto p-4 border-t border-gray-100 flex items-center justify-between bg-white shrink-0">
              <span className="text-sm font-medium text-gray-500">Thoát phiên làm việc</span>
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
          <div className="flex-1 flex flex-col overflow-hidden bg-fresh-grown relative">
            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
