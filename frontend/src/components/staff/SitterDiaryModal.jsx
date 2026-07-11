import { useState } from 'react';
import { X, AlertTriangle, Save, Camera } from 'lucide-react';
import ImageUpload from '@/components/ui/ImageUpload';

export default function SitterDiaryModal({ booking, initialMode = 'add', onClose, onConfirm, onReportIncident }) {
  const [viewMode, setViewMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    food: '',
    playtime: '',
    status: 'Bình thường',
    notes: '',
    issues: '',
    photos: []
  });

  const statusOptions = ['Bình thường', 'Vui vẻ', 'Buồn/Nhớ chủ', 'Căng thẳng', 'Không khỏe'];

  const handleSubmit = () => {
    // Basic validation
    if (!formData.food || !formData.playtime || !formData.notes) {
      alert("Vui lòng điền đầy đủ các trường bắt buộc (*)");
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newDiary = {
      date: today,
      food: formData.food,
      playtime: parseInt(formData.playtime),
      status: formData.status,
      notes: formData.notes,
      issues: formData.issues,
      photos: formData.photos,
      staff: "Nhân viên (Bạn)"
    };

    onConfirm(newDiary);
  };

  const extractWarning = (notes) => {
    if (!notes) return null;
    const match = notes.match(/Lưu ý:\s*(.*)/i);
    return match ? match[1] : null;
  };

  const warningText = extractWarning(booking.reception_notes);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-understory">Nhật ký chăm sóc — {booking.pet_name} · #{booking.booking_id}</h2>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('history')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'history' ? 'bg-white text-understory shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Toàn bộ lịch sử
              </button>
              <button
                onClick={() => setViewMode('add')}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${viewMode === 'add' ? 'bg-[#1a66cc] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Điền nhật ký hôm nay
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">

          {/* Left Column: Pet Info (and mini history in add mode) */}
          <div className="w-[380px] shrink-0 flex flex-col border-r border-gray-100 bg-gray-50/50">
            {/* Pet Info */}
            <div className={`p-4 shrink-0 w-full ${viewMode === 'add' ? 'border-b border-gray-200' : ''}`}>
              <div className="bg-[#f8faff] border border-blue-100 rounded-xl p-4 shadow-sm">
                <div className="flex gap-3 items-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl shadow-sm border border-white shrink-0 overflow-hidden">
                    {booking.pet?.pet_ava ? (
                      <img src={booking.pet.pet_ava} alt="Pet avatar" className="w-full h-full object-cover" />
                    ) : (
                      booking.pet?.species === 'cat' ? '🐈' : '🐕'
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1a3b5c]">{booking.pet_name}</h3>
                    <p className="text-[#3b82f6] text-xs font-medium mt-0.5">{booking.pet_type} · {booking.pet_breed} · Lớn</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 bg-white p-2 rounded-lg border border-blue-50">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Cân nặng</p>
                    <p className="font-semibold text-gray-800 text-xs">{booking.pet_weight} kg</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Tuổi</p>
                    <p className="font-semibold text-gray-800 text-xs">{booking.pet_age || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">Giới tính</p>
                    <p className="font-semibold text-gray-800 text-xs">{booking.pet_gender || 'N/A'}</p>
                  </div>
                </div>

                {warningText && (
                  <div className="bg-orange-50 border border-orange-200 text-orange-800 p-2 rounded-lg text-xs flex items-start gap-1.5 mb-3">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5 text-orange-500" />
                    <p><span className="font-bold">Lưu ý:</span> {warningText}</p>
                  </div>
                )}

                {/* Health Record block */}
                <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-3 py-1.5 border-b border-gray-100 font-bold text-xs text-understory">
                    🏥 Hồ sơ sức khỏe
                  </div>
                  <div className="p-2 space-y-1 text-xs">
                    <div className="grid grid-cols-2 gap-1 gap-x-2">
                      <p className="text-gray-500">Da:</p>
                      <p className="font-medium truncate" title={booking.health_record?.skin_condition || 'Bình thường'}>{booking.health_record?.skin_condition || 'Bình thường'}</p>
                      
                      <p className="text-gray-500">Lông:</p>
                      <p className="font-medium truncate" title={booking.health_record?.coat_condition || 'Bình thường'}>{booking.health_record?.coat_condition || 'Bình thường'}</p>
                      
                      <p className="text-gray-500">Tai:</p>
                      <p className="font-medium truncate" title={booking.health_record?.ear_condition || 'Bình thường'}>{booking.health_record?.ear_condition || 'Bình thường'}</p>

                      <p className="text-gray-500">Mắt:</p>
                      <p className="font-medium truncate" title={booking.health_record?.eye_condition || 'Bình thường'}>{booking.health_record?.eye_condition || 'Bình thường'}</p>

                      <p className="text-gray-500">Móng:</p>
                      <p className="font-medium truncate" title={booking.health_record?.nail_condition || 'Đã cắt gọn'}>{booking.health_record?.nail_condition || 'Đã cắt gọn'}</p>
                    </div>
                    {booking.health_record?.behavior_observed && (
                      <div className="pt-1.5 border-t border-gray-50 mt-1.5">
                        <p className="text-gray-500 text-[10px] mb-0.5">Hành vi quan sát được:</p>
                        <p className="font-medium leading-tight">{booking.health_record.behavior_observed}</p>
                      </div>
                    )}
                    {booking.health_record?.wound_description && (
                      <div className="pt-1.5 border-t border-gray-50 mt-1.5">
                        <p className="text-red-500 text-[10px] mb-0.5 flex items-center gap-1"><AlertTriangle size={10}/> Vết thương / Dị ứng:</p>
                        <p className="font-medium text-red-700 leading-tight">{booking.health_record.wound_description}</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Mini History in Add Mode */}
            {viewMode === 'add' && (
              <div className="px-5 py-4 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/30">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  Nhật ký các ngày trước ({booking.diaries?.length || 0})
                </h3>

                {(!booking.diaries || booking.diaries.length === 0) ? (
                  <div className="text-center py-6 bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">Chưa có nhật ký nào.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {booking.diaries.map((diary, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <div className="flex justify-between items-center mb-3 border-b border-gray-50 pb-2">
                          <p className="font-bold text-gray-800 text-sm">{diary.date}</p>
                          <p className="text-xs text-gray-500 font-medium">by {diary.staff}</p>
                        </div>
                        <div className="flex flex-col gap-2 mb-3">
                          <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 text-xs text-gray-700 font-medium">
                            <span>🥣</span> {diary.food}
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 text-xs text-gray-700 font-medium">
                            <span>🎾</span> Chơi: {diary.playtime} phút
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1 tracking-wider">Trạng thái & Ghi chú</p>
                          <p className="text-xs text-gray-700 line-clamp-2">{diary.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Form OR Full History */}
          <div className="flex-1 flex flex-col bg-white">
            {viewMode === 'add' ? (
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="mb-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-understory flex items-center gap-2 text-lg">
                    📝 Nhật ký hôm nay
                  </h3>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-200">
                    {new Date().toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Lượng thức ăn *</label>
                      <input
                        type="text"
                        placeholder="VD: 2 bát (150g/bát)"
                        value={formData.food}
                        onChange={e => setFormData({ ...formData, food: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3b82f6] outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian vui chơi (phút) *</label>
                      <input
                        type="number"
                        placeholder="30"
                        value={formData.playtime}
                        onChange={e => setFormData({ ...formData, playtime: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3b82f6] outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Trạng thái thú cưng *</label>
                    <div className="flex flex-wrap gap-2.5">
                      {statusOptions.map(st => (
                        <button
                          key={st}
                          onClick={() => setFormData({ ...formData, status: st })}
                          className={`px-4 py-2 rounded-lg text-sm transition-all border shadow-sm ${formData.status === st
                              ? 'bg-[#3b82f6] border-[#3b82f6] text-white font-bold ring-2 ring-[#3b82f6]/20'
                              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 font-medium'
                            }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hành vi & ghi chú *</label>
                    <textarea
                      rows={3}
                      placeholder="Thú cưng hợp tác tốt, ăn hết khẩu phần..."
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3b82f6] outline-none text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Vấn đề phát sinh (nếu có)</label>
                    <textarea
                      rows={2}
                      placeholder="Ho nhẹ, bỏ ăn, tiêu chảy nhẹ..."
                      value={formData.issues}
                      onChange={e => setFormData({ ...formData, issues: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 outline-none text-sm resize-none bg-gray-50 focus:bg-white transition-colors"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Ảnh sinh hoạt hôm nay</label>
                    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                      <ImageUpload
                        images={formData.photos}
                        onChange={(imgs) => setFormData({ ...formData, photos: imgs })}
                        label="Thêm ảnh/video"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
                <div className="mb-6 pb-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-bold text-understory flex items-center gap-2 text-lg">
                    📚 Lịch sử nhật ký
                  </h3>
                  <span className="text-gray-500 text-sm font-medium">Tổng cộng {booking.diaries?.length || 0} bản ghi</span>
                </div>

                {(!booking.diaries || booking.diaries.length === 0) ? (
                  <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400">Chưa có nhật ký nào.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-2">
                    {booking.diaries.map((diary, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
                          <p className="font-bold text-gray-800">{diary.date}</p>
                          <p className="text-xs text-gray-500 font-medium">by {diary.staff}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <span>🥣</span> {diary.food}
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <span>🎾</span> Chơi: {diary.playtime} phút
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase font-bold mb-1 tracking-wider">Trạng thái & Ghi chú</p>
                          <p className="text-sm text-gray-700 mb-2">{diary.notes}</p>
                        </div>
                        {diary.issues && (
                          <div className="mt-3 bg-red-50 text-red-700 p-2.5 rounded-lg text-sm flex items-start gap-2 border border-red-100">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-500" />
                            <p>{diary.issues}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 bg-white text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-sm"
          >
            Đóng
          </button>

          {viewMode === 'add' ? (
            <div className="flex gap-4">
              <button
                onClick={() => {
                  onClose();
                  if (onReportIncident) onReportIncident(booking);
                }}
                className="px-6 py-2.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <AlertTriangle size={18} /> Báo sự cố
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-2.5 bg-[#1a66cc] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-md shadow-blue-500/20"
              >
                <Save size={18} /> Lưu nhật ký
              </button>
            </div>
          ) : (
            <button
              onClick={() => setViewMode('add')}
              className="px-8 py-2.5 bg-[#1a66cc] hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              📝 Thêm nhật ký hôm nay
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
