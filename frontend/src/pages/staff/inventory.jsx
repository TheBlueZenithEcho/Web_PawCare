import { useState, useEffect } from 'react';
import Head from 'next/head';
import StaffLayout from '@/components/layout/StaffLayout';
import { fetchOrders, packOrder, shipOrder, returnStock, mockWebhookUpdate, formatVND } from '@/services/mock/mockOrdersApi';
import { PackageSearch, PackageOpen, Truck, RotateCcw, XCircle, AlertTriangle, RefreshCw, Box, Clock, MapPin, Search } from 'lucide-react';

export default function InventoryPortal() {
  const [allOrders, setAllOrders] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('CONFIRMED');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType] = useState(null); // 'PACK', 'SHIP', 'RETURN', 'WEBHOOK'
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [carrier, setCarrier] = useState('GHN');
  const [trackingCode, setTrackingCode] = useState('');
  const [returnCondition, setReturnCondition] = useState('INTACT');

  const TABS = [
    { id: 'CONFIRMED', label: 'Chờ đóng gói' },
    { id: 'PREPARING', label: 'Chờ bàn giao' },
    { id: 'SHIPPING', label: 'Đang giao hàng' },
    { id: 'FAILED_DELIVERY', label: 'Giao thất bại' }
  ];

  const loadOrders = async () => {
    setIsLoading(true);
    try {
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
      if (activeTab === 'CONFIRMED') {
        result = result.filter(o => ['CONFIRMED', 'PAID'].includes(o.status));
      } else {
        result = result.filter(o => o.status === activeTab);
      }
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
    if (statusId === 'CONFIRMED') {
      return allOrders.filter(o => ['CONFIRMED', 'PAID'].includes(o.status)).length;
    }
    return allOrders.filter(o => o.status === statusId).length;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING_PAYMENT': <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">Chờ thanh toán</span>,
      'PAID': <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">Đã thanh toán</span>,
      'PENDING_VERIFICATION': <span className="bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">Chờ xác minh</span>,
      'CONFIRMED': <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">Đã xác nhận</span>,
      'PREPARING': <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">Đang chuẩn bị</span>,
      'SHIPPING': <span className="bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">Đang giao hàng</span>,
      'COMPLETED': <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">Hoàn tất</span>,
      'CANCELLED': <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">Đã hủy</span>,
      'FAILED_DELIVERY': <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap">Giao thất bại</span>,
    };
    return badges[status] || <span className="whitespace-nowrap">{status}</span>;
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
        }, 3000);
      } else {
        alert(err.message);
      }
    }
  };

  const onPack = () => {
    handleAction(() => packOrder(selectedOrder.order_id, selectedOrder.status));
  };

  const onShip = () => {
    if (!trackingCode.trim()) {
      alert("Vui lòng nhập mã vận đơn!");
      return;
    }
    handleAction(() => shipOrder(selectedOrder.order_id, selectedOrder.status, { carrier, tracking_code: trackingCode }));
  };

  const onReturn = () => {
    handleAction(() => returnStock(selectedOrder.order_id, selectedOrder.status, { condition: returnCondition }));
  };

  const onMockWebhook = (order, result) => {
    handleAction(() => mockWebhookUpdate(order.order_id, order.status, result));
  };

  const openModal = (order, type) => {
    setSelectedOrder(order);
    setModalType(type);
    setErrorMessage('');
    if (type === 'SHIP') {
      setCarrier('GHN');
      setTrackingCode('');
    }
    if (type === 'RETURN') {
      setReturnCondition('INTACT');
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setModalType(null);
  };

  return (
    <StaffLayout>
      <Head>
        <title>PawCare - Kho & Giao hàng</title>
      </Head>

      <div className="flex flex-col h-full bg-gray-50">
        <div className="bg-white p-4 md:p-6 border-b border-gray-200 z-10 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-understory mb-4 flex items-center gap-2">
            <PackageSearch size={28} className="text-chloro" />
            Kho & Giao hàng
          </h1>
          
          <div className="flex flex-col-reverse md:flex-row justify-between md:items-center gap-4">
            {/* Text Tabs */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar">
              {TABS.map(tab => {
                const count = getStatusCount(tab.id);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-2 font-bold text-sm whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
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

            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Tìm theo Mã đơn, Họ tên, SĐT..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 outline-none focus:border-chloro focus:ring-1 focus:ring-chloro transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6">
          {isLoading ? (
            <div className="text-center text-gray-400 py-20 flex flex-col items-center gap-2">
              <RefreshCw className="animate-spin" size={32}/>
              Đang tải danh sách đơn...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center text-gray-400 py-20 flex flex-col items-center gap-2">
              <Box size={48} className="opacity-50" />
              Không có đơn hàng nào cần xử lý.
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {orders.map(order => (
                <div key={order.order_id} className="bg-white border border-gray-100 hover:border-chloro/50 transition-colors shadow-sm rounded-xl p-5 flex gap-4 items-center group">
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-gray-400 font-bold text-sm">#{order.order_id}</span>
                      <span className="font-bold text-gray-900">{order.customer_name}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-blue-600 font-medium">{order.customer_phone}</span>
                      <div className="ml-2">{getStatusBadge(order.status)}</div>
                      <div className="ml-auto text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {order.created_at}</div>
                    </div>
                    
                    <div className="text-sm text-gray-600 flex items-center gap-1.5 mb-2">
                      <MapPin size={14} className="text-gray-400 shrink-0" />
                      <span className="line-clamp-1">{order.shipping_info.street}{order.shipping_info.ward ? `, ${order.shipping_info.ward}` : ''}{order.shipping_info.district ? `, ${order.shipping_info.district}` : ''}{order.shipping_info.province ? `, ${order.shipping_info.province}` : ''}</span>
                    </div>

                    <div className="mt-2 pt-3 border-t border-dashed border-gray-200 flex flex-col gap-2.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 shrink-0 rounded border border-chloro/20 bg-chloro/5 flex items-center justify-center font-bold text-chloro text-sm">
                              x{item.quantity}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800">{item.name}</span>
                              {item.variant && <span className="text-xs text-gray-500">Phân loại: {item.variant}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-md shrink-0">
                            <Box size={14} className="text-gray-400" /> Kệ: <span className="text-gray-800 font-bold">{item.product_id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end ml-4 gap-2 border-l border-gray-100 pl-6 min-w-[220px]">
                    <div className="font-extrabold text-red-600 text-lg leading-none mb-0.5">{formatVND(order.total_amount)}</div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">{order.payment_method}</div>
                    
                    <div className="w-full mt-auto">
                      {activeTab === 'CONFIRMED' && (
                        <button onClick={() => openModal(order, 'PACK')} className="w-full bg-[#1a73e8] hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm">
                          <PackageOpen size={16}/> Bắt đầu đóng gói
                        </button>
                      )}
                      {activeTab === 'PREPARING' && (
                        <button onClick={() => openModal(order, 'SHIP')} className="w-full bg-chloro hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm">
                          <Truck size={16}/> Bàn giao cho ĐVVC
                        </button>
                      )}
                      {activeTab === 'SHIPPING' && (
                        <div className="flex flex-col gap-2">
                          <button onClick={() => onMockWebhook(order, 'SUCCESS')} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm">
                            Giao thành công
                          </button>
                          <button onClick={() => onMockWebhook(order, 'FAILED')} className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm">
                            Giao thất bại
                          </button>
                        </div>
                      )}
                      {activeTab === 'FAILED_DELIVERY' && (
                        <button onClick={() => openModal(order, 'RETURN')} className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm text-sm">
                          <RotateCcw size={16}/> Nhận hàng hoàn
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {modalType && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                <XCircle size={24} />
              </button>

              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm font-semibold flex gap-2">
                  <AlertTriangle size={16} />
                  {errorMessage}
                </div>
              )}

              {modalType === 'PACK' && (
                <>
                  <h2 className="text-xl font-bold text-understory mb-4 text-center">Bắt đầu đóng gói</h2>
                  <p className="text-center text-gray-500 mb-6">Xác nhận bạn đã lấy đủ hàng từ kệ và đóng gói xong cho đơn <b>{selectedOrder?.order_id}</b>?</p>
                  <button onClick={onPack} className="w-full bg-understory hover:bg-black text-white font-bold py-3 rounded-xl transition-colors">Xác nhận đóng gói xong</button>
                </>
              )}

              {modalType === 'SHIP' && (
                <>
                  <h2 className="text-xl font-bold text-understory mb-4">Bàn giao vận chuyển</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Đơn vị vận chuyển</label>
                      <select value={carrier} onChange={e => setCarrier(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-chloro">
                        <option value="GHN">Giao Hàng Nhanh</option>
                        <option value="GHTK">Giao Hàng Tiết Kiệm</option>
                        <option value="ViettelPost">Viettel Post</option>
                        <option value="Ahamove">Ahamove (Nội thành)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Mã vận đơn (Tracking ID)</label>
                      <input 
                        type="text" 
                        value={trackingCode} 
                        onChange={e => setTrackingCode(e.target.value)} 
                        placeholder="Quét mã vạch hoặc nhập..." 
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-chloro"
                        autoFocus
                      />
                    </div>
                    <button onClick={onShip} className="w-full bg-chloro hover:bg-green-700 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Xác nhận đã giao cho Shipper</button>
                  </div>
                </>
              )}

              {modalType === 'RETURN' && (
                <>
                  <h2 className="text-xl font-bold text-understory mb-4">Nhận hàng hoàn trả</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Tình trạng hàng hóa</label>
                      <select value={returnCondition} onChange={e => setReturnCondition(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-chloro">
                        <option value="INTACT">Nguyên vẹn (Nhập lại kho)</option>
                        <option value="DAMAGED">Hư hỏng/Móp méo (Hủy hàng)</option>
                      </select>
                    </div>
                    {returnCondition === 'INTACT' ? (
                      <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-sm border border-blue-100">
                        Hệ thống sẽ cộng lại số lượng vào tồn kho khả dụng để tiếp tục bán.
                      </div>
                    ) : (
                      <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100">
                        Hàng hóa không đạt yêu cầu, sẽ ghi nhận hủy và không cộng lại vào tồn kho.
                      </div>
                    )}
                    <button onClick={onReturn} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl mt-4 transition-colors">Nhập kho & Hủy đơn</button>
                  </div>
                </>
              )}

            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
