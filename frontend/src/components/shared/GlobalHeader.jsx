import { useState } from 'react';
import { Search, Bell, Settings, User, Menu } from 'lucide-react';
import UserProfileModal from './UserProfileModal';
import { STAFF_USERS } from '@/services/mock/mockUsers';

export default function GlobalHeader({ onMenuClick }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(STAFF_USERS[0]); // Lấy mock user đầu tiên làm ví dụ

  const handleSaveProfile = (updatedData) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
  };

  const initials = currentUser?.full_name ? currentUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NV';

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm shrink-0">
        {/* Left: Menu (Mobile) & Logo */}
        <div className="flex items-center gap-2 md:w-64 flex-shrink-0">
          <button 
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={onMenuClick}
          >
            <Menu size={24} />
          </button>
          <div className="hidden md:block text-2xl mr-2">🐾</div>
          <h1 className="text-xl md:text-2xl font-bold text-moss-green tracking-tight">PawCare</h1>
        </div>

        {/* Center: Global Search */}
        <div className="hidden md:flex flex-1 max-w-2xl px-4 justify-center">
          <div className="w-full max-w-xl relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-moss-green transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng, thú cưng, hóa đơn..."
              className="w-full py-2 pl-10 pr-4 bg-fresh-grown/30 border border-transparent rounded-full focus:bg-white focus:border-azeitona focus:ring-2 focus:ring-azeitona/20 outline-none transition-all text-sm text-gray-700 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4 flex-shrink-0 justify-end w-64">
          <button className="text-gray-400 hover:text-moss-green p-2 rounded-full hover:bg-fresh-grown/30 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          
          <button className="text-gray-400 hover:text-moss-green p-2 rounded-full hover:bg-fresh-grown/30 transition-colors">
            <Settings size={20} />
          </button>

          <div className="h-8 w-px bg-gray-200 mx-1"></div>

          <button 
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-full transition-colors group"
          >
            {currentUser?.avatar_url ? (
              <img src={currentUser.avatar_url} alt="Profile" className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-azeitona transition-colors" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-azeitona text-white flex items-center justify-center text-sm font-bold shadow-sm border-2 border-white group-hover:border-moss-green transition-colors">
                {initials}
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Render Modal conditionally */}
      {showProfileModal && (
        <UserProfileModal 
          user={currentUser} 
          onClose={() => setShowProfileModal(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
}
