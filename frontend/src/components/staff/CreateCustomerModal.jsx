import { useState } from 'react';
import { X, User, Phone, Mail, Dog, Activity, CheckCircle2, Loader2 } from 'lucide-react';
import { createCustomer, updateCustomer, createPet } from '@/services/supabase/supabaseUsersApi';

export default function CreateCustomerModal({ onClose, onSuccess, initialData }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    last_name: initialData?.last_name || '',
    first_name: initialData?.first_name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    create_account: true,
    pet_name: '',
    species: 'Chó',
    breed: '',
    weight: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isUpdateMode = !!initialData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1 && !isUpdateMode) {
      setStep(2); // Go to pet info only if creating new
    } else {
      setLoading(true);
      try {
        if (isUpdateMode) {
          await updateCustomer(initialData.customer_id, formData);
        } else {
          const newCust = await createCustomer({
            last_name: formData.last_name,
            first_name: formData.first_name,
            phone: formData.phone,
            email: formData.email,
            is_account_activated: formData.create_account
          });

          if (formData.pet_name) {
            await createPet({
              customer_id: newCust.customer_id,
              pet_name: formData.pet_name,
              species: formData.species,
              breed: formData.breed,
              weight: parseFloat(formData.weight) || 0
            });
          }
        }
        setIsSuccess(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          else onClose();
        }, 1500);
      } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl animate-in fade-in zoom-in duration-200">
          <CheckCircle2 size={64} className="text-chloro mb-4" />
          <h2 className="text-2xl font-bold text-understory mb-2">Thành công!</h2>
          <p className="text-gray-500 text-center">
            {isUpdateMode ? 'Đã cấp tài khoản thành công cho khách hàng.' : 'Khách hàng và thú cưng đã được lưu vào hệ thống.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-understory">
              {isUpdateMode ? 'Cấp tài khoản Website' : 'Thêm khách hàng mới'}
            </h2>
            {!isUpdateMode && (
              <p className="text-sm text-gray-500 mt-1">
                Bước {step}/2: {step === 1 ? 'Thông tin khách hàng' : 'Thông tin thú cưng (Tùy chọn)'}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {step === 1 ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-lacustral mb-1.5">Họ & tên đệm *</label>
                  <input
                    type="text" required
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="VD: Nguyễn Văn"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chloro/20 focus:border-chloro outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-lacustral mb-1.5">Tên *</label>
                  <input
                    type="text" required
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="VD: A"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chloro/20 focus:border-chloro outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-lacustral mb-1.5">Số điện thoại *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel" required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chloro/20 focus:border-chloro outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-lacustral mb-1.5">Email {isUpdateMode ? '*' : '(Tùy chọn)'}</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required={isUpdateMode}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nhập địa chỉ email"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chloro/20 focus:border-chloro outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-4 border border-green-100 bg-green-50/50 rounded-xl cursor-pointer hover:bg-green-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.create_account}
                    onChange={e => setFormData({ ...formData, create_account: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-chloro focus:ring-chloro"
                  />
                  <div>
                    <p className="font-semibold text-understory text-sm">Cấp tài khoản Website cho khách ngay</p>
                    <p className="text-xs text-lacustral mt-0.5">Hệ thống sẽ tạo mật khẩu ngẫu nhiên và gửi SMS/Email cho khách.</p>
                  </div>
                </label>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-lacustral mb-1.5">Tên thú cưng</label>
                <div className="relative">
                  <Dog size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={formData.pet_name}
                    onChange={e => setFormData({ ...formData, pet_name: e.target.value })}
                    placeholder="VD: Miu Miu, Corgi béo..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chloro/20 focus:border-chloro outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-lacustral mb-1.5">Loài</label>
                  <select
                    value={formData.species}
                    onChange={e => setFormData({ ...formData, species: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chloro/20 focus:border-chloro outline-none transition-all bg-white"
                  >
                    <option value="Chó">Chó</option>
                    <option value="Mèo">Mèo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-lacustral mb-1.5">Giống</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={e => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="VD: Poodle, Corgi..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chloro/20 focus:border-chloro outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-lacustral mb-1.5">Cân nặng (kg)</label>
                <div className="relative">
                  <Activity size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="number" step="0.1"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="VD: 4.5"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chloro/20 focus:border-chloro outline-none transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Quay lại
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-chloro text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md shadow-chloro/20 disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {step === 1 && !isUpdateMode ? 'Tiếp tục' : 'Hoàn tất'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
