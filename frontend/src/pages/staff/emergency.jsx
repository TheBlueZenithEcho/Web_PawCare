import { useState, useEffect } from 'react';
import Head from 'next/head';
import StaffLayout from '@/components/layout/StaffLayout';
import { AlertTriangle, Clock, CheckCircle, Search, Filter, Phone, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { fetchIncidents, updateIncidentStatus } from '@/services/mock/mockApi';

// Mock Data for Incidents
const mockIncidents = [
  {
    id: 'INC-0001',
    booking_id: 'HT-00002',
    pet_name: 'Buddy',
    pet_type: 'Chó',
    customer_name: 'Lê Thị Cẩm',
    customer_phone: '0923456789',
    incident_type: 'HEALTH_ISSUE',
    severity: 'HIGH',
    status: 'NEW',
    reported_at: '2026-06-29T10:15:00',
    description: 'Thú cưng có biểu hiện co giật nhẹ, bỏ ăn sáng và nôn mửa.',
    action_notes: 'Đã báo cho bác sĩ thú y gần đó nhưng chưa đưa đi. Chưa gọi cho khách.',
    actions_taken: { first_aid: true, vet_contacted: true, owner_contacted: false, isolated: true },
    reported_by: 'Nhân viên Ca Sáng',
  },
  {
    id: 'INC-0002',
    booking_id: 'GS-00001',
    pet_name: 'Mimi',
    pet_type: 'Mèo',
    customer_name: 'Trần Văn B',
    customer_phone: '0988776655',
    incident_type: 'AGGRESSIVE',
    severity: 'MEDIUM',
    status: 'HANDLING',
    reported_at: '2026-06-29T09:30:00',
    description: 'Bé mèo hoảng sợ và cắn vào tay nhân viên Grooming. Vết thương ngoài da.',
    action_notes: 'Đã nhốt bé lại lồng an toàn để bé bình tĩnh.',
    actions_taken: { first_aid: false, vet_contacted: false, owner_contacted: true, isolated: true },
    reported_by: 'Groomer 01',
    handler_notes: 'Đã sát trùng cho nhân viên. Chờ ý kiến khách hàng xem có tiếp tục cắt tỉa không.'
  },
  {
    id: 'INC-0003',
    booking_id: 'HT-00005',
    pet_name: 'Lu',
    pet_type: 'Chó',
    customer_name: 'Phạm C',
    customer_phone: '0909123456',
    incident_type: 'OTHER',
    severity: 'LOW',
    status: 'RESOLVED',
    reported_at: '2026-06-28T15:00:00',
    description: 'Thú cưng làm hỏng đệm ngủ trong phòng.',
    action_notes: '',
    actions_taken: { first_aid: false, vet_contacted: false, owner_contacted: true, isolated: false },
    reported_by: 'Nhân viên Ca Chiều',
    handler_notes: 'Đã thông báo cho khách hàng và khách đồng ý đền bù tiền đệm.'
  }
];

const INCIDENT_TYPES = {
  HEALTH_ISSUE: { label: 'Vấn đề sức khỏe', color: 'text-red-700 bg-red-100 border-red-200' },
  AGGRESSIVE: { label: 'Tấn công nhân viên', color: 'text-orange-700 bg-orange-100 border-orange-200' },
  LOST: { label: 'Thất lạc', color: 'text-purple-700 bg-purple-100 border-purple-200' },
  REFUND: { label: 'Hoàn cọc', color: 'text-blue-700 bg-blue-100 border-blue-200' },
  OTHER: { label: 'Sự cố khác', color: 'text-gray-700 bg-gray-100 border-gray-200' }
};

import { useRouter } from 'next/router';

export default function EmergencyPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState([]);
  const [activeTab, setActiveTab] = useState('NEW'); // NEW, HANDLING, RESOLVED
  const [searchTerm, setSearchTerm] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState({});

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  const loadData = async () => {
    try {
      const apiIncidents = await fetchIncidents();
      // Loại bỏ các API incident trùng booking_id với mock để tránh duplicate nếu code mock
      const mockFiltered = mockIncidents.filter(m => !apiIncidents.some(a => a.booking_id === m.booking_id));
      setIncidents([...mockFiltered, ...apiIncidents]);
    } catch (error) {
      console.error(error);
      setIncidents(mockIncidents);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartProcess = async (id, booking_id) => {
    try {
      if (id.startsWith('INC-01')) { // assuming API incidents start from INC-0100
        await updateIncidentStatus(booking_id, 'HANDLING');
      }
      setIncidents(incidents.map(inc => inc.id === id ? { ...inc, status: 'HANDLING' } : inc));
      toast.success('Đã tiếp nhận xử lý sự cố. Vui lòng liên hệ Thú y hoặc Khách hàng!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleResolve = async (id, booking_id) => {
    const note = resolutionNotes[id];
    if (!note || note.trim() === '') {
      toast.error('Vui lòng nhập hướng xử lý trước khi hoàn tất!');
      return;
    }
    try {
      if (id.startsWith('INC-01')) {
        await updateIncidentStatus(booking_id, 'RESOLVED', note);
      }
      setIncidents(incidents.map(inc => inc.id === id ? { ...inc, status: 'RESOLVED', handler_notes: note } : inc));
      toast.success('Sự cố đã được giải quyết và lưu trữ.');
    } catch (error) {
      console.error(error);
    }
  };

  const handleNoteChange = (id, value) => {
    setResolutionNotes(prev => ({ ...prev, [id]: value }));
  };

  const filteredIncidents = incidents.filter(inc => {
    if (inc.status !== activeTab) return false;
    if (searchTerm && !inc.pet_name.toLowerCase().includes(searchTerm.toLowerCase()) && !inc.booking_id.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const stats = {
    NEW: incidents.filter(i => i.status === 'NEW').length,
    HANDLING: incidents.filter(i => i.status === 'HANDLING').length,
    RESOLVED: incidents.filter(i => i.status === 'RESOLVED').length,
  };

  return (
    <StaffLayout>
      <Head>
        <title>PawCare - Khẩn cấp & Ngoại lệ</title>
      </Head>
      <div className="p-4 md:p-6 w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-understory flex items-center gap-2">
            <AlertTriangle size={28} className="text-[#4c9535]" /> Quản lý Khẩn cấp & Ngoại lệ
          </h1>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-50/50 border-b border-gray-100">
            {/* Tabs */}
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('NEW')}
                className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'NEW'
                    ? 'border-[#4c9535] text-[#4c9535] bg-white border shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                Chưa xử lý
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'NEW' ? 'bg-[#4c9535] text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {stats.NEW}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('HANDLING')}
                className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'HANDLING'
                    ? 'border-orange-500 text-orange-600 bg-white border shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                Đang xử lý
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'HANDLING' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {stats.HANDLING}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('RESOLVED')}
                className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'RESOLVED'
                    ? 'border-green-600 text-green-700 bg-white border shadow-sm'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                  }`}
              >
                Đã giải quyết
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'RESOLVED' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {stats.RESOLVED}
                </span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Tìm mã đơn, tên pet..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4c9535] outline-none text-sm w-full md:w-64 bg-white"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
          </div>
        </div>

        {/* Incident List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.length === 0 ? (
            <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed">
              <ShieldCheck size={48} className="mb-3 text-gray-300" />
              <p className="font-semibold">Không có sự cố nào trong mục này</p>
            </div>
          ) : (
            filteredIncidents.map(inc => {
              const typeConfig = INCIDENT_TYPES[inc.incident_type] || INCIDENT_TYPES.OTHER;
              return (
                <div key={inc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col">

                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        {inc.severity === 'HIGH' && (
                          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            <AlertTriangle size={12} /> KHẨN
                          </span>
                        )}
                        {inc.status === 'NEW' && (
                          <span className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            Chưa xử lý
                          </span>
                        )}
                        {inc.status === 'HANDLING' && (
                          <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            Đang xử lý
                          </span>
                        )}
                        {inc.status === 'RESOLVED' && (
                          <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                            Đã giải quyết
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-understory">{inc.pet_name} ({inc.pet_type})</h3>
                      <p className="text-xs text-lacustral font-medium mb-1">Đơn: <span className="font-bold text-gray-700">{inc.booking_id}</span></p>
                      <p className="text-xs text-lacustral font-medium">Khách: <span className="font-bold text-gray-700">{inc.customer_name}</span> - <span className="text-[#1a66cc] font-bold">{inc.customer_phone}</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-500 mb-1">{new Date(inc.reported_at).toLocaleTimeString('vi-VN')} - {new Date(inc.reported_at).toLocaleDateString('vi-VN')}</p>
                      <p className="text-xs text-gray-400">Báo cáo bởi: {inc.reported_by}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 mb-4 flex-1">
                    <p className="mb-2"><strong>Mô tả:</strong> {inc.description}</p>

                    {inc.actions_taken && Object.values(inc.actions_taken).some(v => v) && (
                      <div className="mb-2">
                        <strong className="text-xs text-gray-800">Đã xử lý ban đầu:</strong>
                        <ul className="list-disc pl-5 text-gray-600 text-xs mt-1">
                          {inc.actions_taken.first_aid && <li>Sơ cứu tại chỗ</li>}
                          {inc.actions_taken.vet_contacted && <li>Đưa đi thú y gần nhất</li>}
                          {inc.actions_taken.owner_contacted && <li>Đã gọi báo chủ</li>}
                          {inc.actions_taken.isolated && <li>Đã cách ly</li>}
                        </ul>
                      </div>
                    )}
                    {inc.action_notes && <p className="mb-2 text-xs text-gray-600 bg-white p-2 rounded border border-gray-200"><strong>Ghi chú từ NV:</strong> {inc.action_notes}</p>}

                    {inc.handler_notes && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-green-700"><strong>Hướng xử lý (Admin):</strong> {inc.handler_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {inc.status === 'NEW' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStartProcess(inc.id, inc.booking_id)}
                        className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold shadow-sm transition-colors"
                      >
                        Bắt đầu xử lý
                      </button>
                    </div>
                  )}

                  {inc.status === 'HANDLING' && (
                    <div className="mt-auto">
                      {inc.incident_type === 'REFUND' ? (
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
                          <Clock className="text-blue-500" size={20} />
                          <div>
                            <p className="text-sm font-bold text-blue-800">Đang chờ Admin xử lý</p>
                            <p className="text-xs text-blue-600 mt-0.5">Yêu cầu hoàn tiền đã được gửi đến bộ phận quản lý. Vui lòng chờ phản hồi.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <textarea
                            rows={2}
                            placeholder="Nhập hướng xử lý"
                            value={resolutionNotes[inc.id] || ''}
                            onChange={(e) => handleNoteChange(inc.id, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-green-300 bg-green-50 rounded-lg outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          />
                          <div className="flex gap-2">
                            <button 
                              onClick={() => toast.success('Đã gửi thông báo khẩn cấp cho Admin/Quản lý!')}
                              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                              title="Báo cáo Admin"
                            >
                              <AlertTriangle size={18} /> Báo Admin
                            </button>
                            <button
                              onClick={() => handleResolve(inc.id, inc.booking_id)}
                              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                            >
                              <CheckCircle size={18} /> Đánh dấu Đã xử lý
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>
      </div>
    </StaffLayout>
  );
}
