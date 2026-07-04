import { useState, useRef } from 'react';
import { X, Save, User, Mail, Phone, Clock, Briefcase, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfileModal({ user, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
    shift: user?.shift || '',
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setFormData(prev => ({ ...prev, avatar_url: url }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.phone) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    // Giả lập lưu
    onSave && onSave(formData);
    toast.success('Cập nhật hồ sơ thành công!');
    onClose();
  };

  if (!user) return null;

  const initials = user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'NV';

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-fresh-grown/30">
          <h2 className="font-bold text-lg text-understory">Hồ sơ cá nhân</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-azeitona text-white flex items-center justify-center text-3xl font-bold shadow-md border-4 border-white">
                  {initials}
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md text-lacustral hover:text-moss-green hover:bg-gray-50 border border-gray-100 transition-colors cursor-pointer">
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>
            <h3 className="mt-4 font-bold text-xl text-wood-bark">{user.full_name}</h3>
            <span className="px-3 py-1 bg-moss-green/10 text-moss-green text-xs font-semibold rounded-full mt-1 border border-moss-green/20">
              {user.role}
            </span>
          </div>

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User size={16} className="text-gray-400" /> Họ và tên *
                </label>
                <input 
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azeitona outline-none text-sm bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" /> Số điện thoại *
                </label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azeitona outline-none text-sm bg-white"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" /> Email *
                </label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-azeitona outline-none text-sm bg-white"
                  required
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Thông tin công việc</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" /> Vị trí
                  </label>
                  <input 
                    type="text"
                    value={formData.role}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    disabled
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" /> Ca làm việc
                  </label>
                  <input 
                    type="text"
                    value={formData.shift}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 font-medium rounded-lg transition-colors text-sm"
          >
            Hủy
          </button>
          <button 
            type="submit"
            form="profile-form"
            className="px-6 py-2 bg-moss-green hover:bg-fig-leaf text-white font-semibold rounded-lg flex items-center gap-2 transition-colors text-sm shadow-sm"
          >
            <Save size={16} /> Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
