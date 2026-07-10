import { Loader2 } from 'lucide-react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import ProfileSidebar from './ProfileSidebar';

export default function AccountLayout({ customer, loading, notLoggedIn, children }) {
  return (
    <div className="min-h-screen bg-[#F7F8E3] flex flex-col">
      <Header cartCount={0} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex items-center gap-2 text-wood-bark/50 text-sm py-20 justify-center">
            <Loader2 size={16} className="animate-spin" /> Đang tải...
          </div>
        ) : notLoggedIn ? (
          <NotLoggedIn />
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <ProfileSidebar customer={customer} />
            <div className="flex-1 flex flex-col gap-6">{children}</div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function NotLoggedIn() {
  return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-wood-bark mb-2">Bạn cần đăng nhập</h2>
      <p className="text-wood-bark/60 mb-6">
        Đăng nhập để xem trang này. (Trang đăng nhập chưa được xây — cần làm riêng.)
      </p>
      <a href="/login" className="rounded-full bg-understory text-white px-6 py-3 text-sm font-bold hover:bg-wood-bark transition-colors">
        Đến trang đăng nhập
      </a>
    </div>
  );
}