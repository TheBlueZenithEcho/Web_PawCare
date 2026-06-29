import { useState, useEffect } from 'react';
import { fetchOrders, verifyOrder, updateShippingInfo, cancelOrder, formatVND } from '@/data/ordersApi';
import { Search, Filter, Phone, MapPin, XCircle, CheckCircle, Clock, Package, CheckSquare, Eye, RefreshCw } from 'lucide-react';

export default function OrdersList() {
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState(null); // 'VERIFY', 'EDIT_SHIPPING', 'CANCEL', 'HISTORY'
  
  // Form states
  const [verifyResult, setVerifyResult] = useState('SUCCESSED');
  const [verifyNote, setVerifyNote] = useState('');
  
  const [shippingData, setShippingData] = useState({});
  const [cancelReason, setCancelReason] = useState('CUSTOMER_CANCEL');
  const [cancelNote, setCancelNote] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  const TABS = [
    { id: 'ALL', label: 'TẤT CẢ' },
    { id: 'PENDING_PAYMENT', label: 'CHỜ THANH TOÁN' },
    { id: 'PAID', label: 'ĐÃ THANH TOÁN' },
    { id: 'PENDING_VERIFICATION', label: 'CHỜ XÁC MINH' },
    { id: 'CONFIRMED', label: 'ĐÃ XÁC NHẬN' },
    { id: 'COMPLETED', label: 'HOÀN TẤT' },
    { id: 'CANCELLED', label: 'ĐÃ HỦY' }
  ];

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch all orders
      const data = await fetchOrders({ status: 'ALL' });
      setAllOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    let result = [...allOrders];
    if (activeTab !== 'ALL') {
      result = result.filter(o => o.status === activeTab);
    }
    if (searchTerm) {
      const kw = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.order_id.toLowerCase().includes(kw) ||
        o.customer_name.toLowerCase().includes(kw) ||
        o.customer_phone.includes(kw)
      );
    }
    setOrders(result);
  }, [allOrders, activeTab, searchTerm]);

  const getStatusCount = (statusId) => {
    if (statusId === 'ALL') return allOrders.length;
    return allOrders.filter(o => o.status === statusId).length;
  };

  const handleAction = async (actionFn) => {
    try {
      setErrorMessage('');
      await actionFn();
      closeModal();
      await loadOrders();
    } catch (err) {
      if (err.name === 'ConcurrencyError' || err.message.includes('xử lý bởi nhân viên khác')) {
        setErrorMessage(err.message);
        setTimeout(() => {
          closeModal();
          loadOrders();
        }, 3000); // Tự động reload sau 3s
      } else {
        alert(err.message);
      }
    }
  };

  const onVerify = () => {
    handleAction(() => verifyOrder(selectedOrder.order_id, selectedOrder.status, {
      call_result: verifyResult,
      note: verifyNote
    }));
  };

  const onEditShipping = () => {
    handleAction(() => updateShippingInfo(selectedOrder.order_id, selectedOrder.status, shippingData));
  };

  const onCancel = () => {
    handleAction(() => cancelOrder(selectedOrder.order_id, selectedOrder.status, {
      reason_code: cancelReason,
      detail: cancelNote
    }));
  };

  const openModal = (order, type) => {
    setSelectedOrder(order);
    setModalType(type);
    setErrorMessage('');
    if (type === 'EDIT_SHIPPING') {
      setShippingData({ ...order.shipping_info });
    }
    if (type === 'VERIFY') {
      setVerifyResult('SUCCESSED');
      setVerifyNote('');
    }
    if (type === 'CANCEL') {
      setCancelReason('CUSTOMER_CANCEL');
      setCancelNote('');
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setModalType(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING_PAYMENT': <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">Chờ thanh toán</span>,
      'PAID': <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">Đã thanh toán</span>,
      'PENDING_VERIFICATION': <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap"><Phone size={12}/> Chờ xác minh</span>,
      'CONFIRMED': <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap"><CheckCircle size={12}/> Đã xác nhận</span>,
      'PREPARING': <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap"><Package size={12}/> Đang chuẩn bị</span>,
      'SHIPPING': <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">Đang giao</span>,
      'COMPLETED': <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">Hoàn tất</span>,
      'CANCELLED': <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">Đã hủy</span>,
      'FAILED_DELIVERY': <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap">Giao thất bại</span>,
    };
    return badges[status] || <span className="whitespace-nowrap">{status}</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Search & Tabs */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative w-full max-w-md mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo Mã đơn, Họ tên, SĐT..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-chloro focus:ring-1 focus:ring-chloro"
          />
        </div>
        {/* Dashboard Cards */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 mb-4">
          {TABS.filter(t => ['PENDING_PAYMENT', 'PAID', 'PENDING_VERIFICATION', 'CONFIRMED', 'CANCELLED'].includes(t.id)).map(tab => {
            const count = getStatusCount(tab.id);
            const isActive = activeTab === tab.id;
            
            // Map styles for cards
            let colorTheme = {
              bg: 'bg-gray-50', activeBg: 'bg-white',
              border: 'border-gray-200', activeBorder: 'border-gray-400',
              text: 'text-gray-600', activeText: 'text-gray-900',
              countText: 'text-gray-600', activeCountText: 'text-gray-900'
            };

            if (tab.id === 'PENDING_PAYMENT') {
              colorTheme = {
                bg: 'bg-yellow-50/50', activeBg: 'bg-white',
                border: 'border-yellow-200', activeBorder: 'border-yellow-400',
                text: 'text-gray-600', activeText: 'text-gray-700',
                countText: 'text-yellow-600', activeCountText: 'text-yellow-600'
              };
            } else if (tab.id === 'PAID') {
              colorTheme = {
                bg: 'bg-emerald-50/50', activeBg: 'bg-white',
                border: 'border-emerald-200', activeBorder: 'border-emerald-400',
                text: 'text-gray-600', activeText: 'text-gray-700',
                countText: 'text-emerald-600', activeCountText: 'text-emerald-600'
              };
            } else if (tab.id === 'PENDING_VERIFICATION') {
              colorTheme = {
                bg: 'bg-orange-50/50', activeBg: 'bg-white',
                border: 'border-orange-200', activeBorder: 'border-orange-400',
                text: 'text-gray-600', activeText: 'text-gray-700',
                countText: 'text-orange-500', activeCountText: 'text-orange-500'
              };
            } else if (tab.id === 'CONFIRMED') {
              colorTheme = {
                bg: 'bg-blue-50/30', activeBg: 'bg-white',
                border: 'border-blue-200', activeBorder: 'border-blue-400',
                text: 'text-gray-600', activeText: 'text-gray-700',
                countText: 'text-blue-600', activeCountText: 'text-blue-600'
              };
            } else if (tab.id === 'CANCELLED') {
              colorTheme = {
                bg: 'bg-red-50/30', activeBg: 'bg-white',
                border: 'border-red-200', activeBorder: 'border-red-400',
                text: 'text-gray-600', activeText: 'text-gray-700',
                countText: 'text-red-500', activeCountText: 'text-red-500'
              };
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 w-44 p-4 text-left rounded-xl border-2 transition-all shadow-sm flex flex-col ${
                  isActive 
                    ? `${colorTheme.activeBg} ${colorTheme.activeBorder}` 
                    : `${colorTheme.bg} ${colorTheme.border} opacity-80 hover:opacity-100`
                }`}
              >
                <div className={`text-2xl font-black mb-1 ${isActive ? colorTheme.activeCountText : colorTheme.countText}`}>
                  {count}
                </div>
                <div className={`text-sm font-semibold uppercase ${isActive ? colorTheme.activeText : colorTheme.text}`}>
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Text Tabs */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const count = getStatusCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 font-bold text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id ? 'border-chloro text-chloro' : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-chloro text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="text-center text-gray-400 py-10 flex flex-col items-center gap-2">
            <RefreshCw className="animate-spin" size={24}/>
            Đang tải dữ liệu...
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-400 py-10">Không tìm thấy đơn hàng nào.</div>
        ) : (
          <div className="flex flex-col gap-4 min-w-[800px]">
            {orders.map(order => {
              const isLocked = ['SHIPPING', 'COMPLETED'].includes(order.status);
              return (
                <div key={order.order_id} className="bg-white border border-gray-100 hover:border-chloro/50 transition-colors shadow-sm rounded-xl p-4 flex justify-between items-center group">
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-bold text-sm">#{order.order_id}</span>
                      <span className="font-bold text-gray-900">{order.customer_name}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-blue-600 font-medium">{order.customer_phone}</span>
                      <div className="ml-2">{getStatusBadge(order.status)}</div>
                    </div>
                    
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {order.items?.map(i => `${i.name} ${i.variant ? `(${i.variant})` : ''} ×${i.quantity}`).join(' · ')}
                    </div>
                    
                    <div className="text-sm text-gray-500 flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      {order.shipping_info.street}{order.shipping_info.ward ? `, ${order.shipping_info.ward}` : ''}{order.shipping_info.district ? `, ${order.shipping_info.district}` : ''}{order.shipping_info.province ? `, ${order.shipping_info.province}` : ''}
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between ml-4 gap-3">
                    <div className="text-right">
                      <div className="font-extrabold text-red-600 text-lg leading-none mb-1">{formatVND(order.total_amount)}</div>
                      <div className="text-xs text-gray-400">{order.created_at}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      {order.status === 'PENDING_VERIFICATION' && (
                        <button onClick={() => openModal(order, 'VERIFY')} className="px-4 py-2 bg-[#1a73e8] hover:bg-blue-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors">
                          <Phone size={14}/> Gọi xác minh
                        </button>
                      )}
                      
                      {order.status !== 'PENDING_VERIFICATION' && (
                        <>
                          <button 
                            onClick={() => openModal(order, 'EDIT_SHIPPING')} 
                            disabled={isLocked}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${isLocked ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                          >
                            <MapPin size={14}/> Sửa ĐC
                          </button>
                          <button 
                            onClick={() => openModal(order, 'CANCEL')} 
                            disabled={isLocked}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors ${isLocked ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-red-50 hover:bg-red-100 text-red-600'}`}
                          >
                            <XCircle size={14}/> Hủy
                          </button>
                        </>
                      )}
                      <button onClick={() => openModal(order, 'HISTORY')} className="px-3 py-1.5 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 rounded-lg flex items-center gap-1 font-bold text-sm transition-colors">
                        <Eye size={14}/> Lịch sử
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <XCircle size={24} />
            </button>
            
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-semibold flex gap-2">
                <AlertTriangle size={16} />
                {errorMessage}
              </div>
            )}

            {modalType === 'VERIFY' && (
              <>
                <h2 className="text-xl font-bold text-understory mb-4">Xác minh đơn hàng {selectedOrder?.order_id}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kết quả cuộc gọi</label>
                    <select value={verifyResult} onChange={e => setVerifyResult(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro">
                      <option value="SUCCESSED">Xác nhận thành công (Khách lấy hàng)</option>
                      <option value="NO_ANSWER">Không nghe máy</option>
                      <option value="REJECTED">Từ chối mua</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Ghi chú cuộc gọi</label>
                    <textarea value={verifyNote} onChange={e => setVerifyNote(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro h-24" placeholder="Ví dụ: Khách hẹn giao giờ hành chính..."></textarea>
                  </div>
                  <button onClick={onVerify} className="w-full bg-chloro text-white font-bold py-3 rounded-xl mt-4 hover:bg-green-700">Lưu kết quả xác minh</button>
                </div>
              </>
            )}

            {modalType === 'EDIT_SHIPPING' && (
              <>
                <h2 className="text-xl font-bold text-understory mb-4">Sửa thông tin giao hàng</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Họ tên người nhận</label>
                      <input type="text" value={shippingData.recipient_name} onChange={e => setShippingData({...shippingData, recipient_name: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại</label>
                      <input type="text" value={shippingData.recipient_phone} onChange={e => setShippingData({...shippingData, recipient_phone: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Địa chỉ chi tiết</label>
                    <input type="text" value={shippingData.street} onChange={e => setShippingData({...shippingData, street: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro"/>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Phường/Xã</label>
                      <input type="text" value={shippingData.ward} onChange={e => setShippingData({...shippingData, ward: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Quận/Huyện</label>
                      <input type="text" value={shippingData.district} onChange={e => setShippingData({...shippingData, district: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro"/>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Tỉnh/TP</label>
                      <input type="text" value={shippingData.province} onChange={e => setShippingData({...shippingData, province: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro"/>
                    </div>
                  </div>
                  <button onClick={onEditShipping} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-blue-700">Cập nhật địa chỉ</button>
                </div>
              </>
            )}

            {modalType === 'CANCEL' && (
              <>
                <h2 className="text-xl font-bold text-understory mb-4">Hủy đơn hàng {selectedOrder?.order_id}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Lý do hủy</label>
                    <select value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro">
                      <option value="CUSTOMER_CANCEL">Khách đổi ý / Không muốn mua nữa</option>
                      <option value="CANT_CONTACT">Không liên hệ được khách hàng</option>
                      <option value="OUT_OF_STOCK">Hết hàng phút chót</option>
                      <option value="OTHER">Lý do khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Chi tiết</label>
                    <textarea value={cancelNote} onChange={e => setCancelNote(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-chloro h-24" placeholder="Nhập chi tiết lý do hủy..."></textarea>
                  </div>
                  <button onClick={onCancel} className="w-full bg-red-600 text-white font-bold py-3 rounded-xl mt-4 hover:bg-red-700">Xác nhận hủy đơn</button>
                </div>
              </>
            )}

            {modalType === 'HISTORY' && (
              <>
                <h2 className="text-xl font-bold text-understory mb-4">Chi tiết Đơn {selectedOrder?.order_id}</h2>
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 mb-2">Sản phẩm</h3>
                  <div className="bg-gray-50 p-3 rounded-xl space-y-2">
                    {selectedOrder?.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name} ({item.variant})</span>
                        <span className="font-semibold text-chloro">{formatVND(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Lịch sử tác vụ (Logs)</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {selectedOrder?.history.slice().reverse().map((log, idx) => (
                      <div key={idx} className="bg-white border border-gray-100 p-3 rounded-xl shadow-sm text-sm">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold text-understory">{log.action}</span>
                          <span className="text-gray-400 text-xs">{log.timestamp}</span>
                        </div>
                        <p className="text-gray-600 mb-1">{log.details}</p>
                        <p className="text-xs text-lacustral font-semibold">Nhân viên: {log.staff_id}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

// Thêm AlertTriangle để dùng chung
function AlertTriangle(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  );
}
