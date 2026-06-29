import { PRODUCTS } from './products';

// Helper: Format tiền
export const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Giả lập Database state in memory
let dbProducts = [...PRODUCTS];

let dbOrders = [
  {
    order_id: 'SP-00001',
    customer_name: 'Nguyễn Văn A',
    customer_phone: '0901234567',
    created_at: '2026-06-28 09:15:00',
    payment_method: 'COD',
    status: 'PENDING_VERIFICATION', // Chờ xác minh vì > 1tr
    total_amount: 1200000,
    shipping_info: {
      recipient_name: 'Nguyễn Văn A',
      recipient_phone: '0901234567',
      street: '123 Đường ABC',
      ward: 'Phường 1',
      district: 'Quận 1',
      province: 'TP.HCM'
    },
    items: [
      { product_id: 'P001', name: 'Hạt Royal Canin Mini Adult', variant: '3kg', quantity: 2, price: 600000 }
    ],
    history: [
      { timestamp: '2026-06-28 09:15:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Khách hàng đặt qua web' }
    ]
  },
  {
    order_id: 'SP-00002',
    customer_name: 'Trần Thị B',
    customer_phone: '0987654321',
    created_at: '2026-06-28 10:30:00',
    payment_method: 'Chuyển khoản',
    status: 'CONFIRMED', // Đã xác nhận
    total_amount: 350000,
    shipping_info: {
      recipient_name: 'Trần Thị B',
      recipient_phone: '0987654321',
      street: '456 Lê Lợi',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      province: 'TP.HCM'
    },
    items: [
      { product_id: 'P001', name: 'Hạt Royal Canin Mini Adult', variant: '1.5kg', quantity: 1, price: 350000 }
    ],
    history: [
      { timestamp: '2026-06-28 10:30:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Khách hàng đặt qua web' },
      { timestamp: '2026-06-28 10:35:00', staff_id: 'SYSTEM', action: 'Thanh toán thành công', details: 'VNPAY' }
    ]
  },
  {
    order_id: 'SP-00003',
    customer_name: 'Lê Văn C',
    customer_phone: '0912345678',
    created_at: '2026-06-27 15:20:00',
    payment_method: 'COD',
    status: 'PREPARING', // Đang chuẩn bị hàng
    total_amount: 150000,
    shipping_info: {
      recipient_name: 'Lê Văn C',
      recipient_phone: '0912345678',
      street: '789 Nguyễn Trãi',
      ward: 'Phường 11',
      district: 'Quận 5',
      province: 'TP.HCM'
    },
    items: [
      { product_id: 'P002', name: 'Pate Whiskas Vị Cá Ngừ', variant: '85g', quantity: 10, price: 15000 }
    ],
    history: [
      { timestamp: '2026-06-27 15:20:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Đơn COD < 1M tự động xác nhận' },
      { timestamp: '2026-06-28 08:00:00', staff_id: 'WH_STAFF_01', action: 'Xác nhận đóng gói', details: 'Bắt đầu lấy hàng' }
    ],
    carrier: '',
    tracking_code: ''
  },
  {
    order_id: 'SP-00004',
    customer_name: 'Phạm Thị D',
    customer_phone: '0933445566',
    created_at: '2026-06-26 09:00:00',
    payment_method: 'COD',
    status: 'FAILED_DELIVERY', // Giao thất bại
    total_amount: 185000,
    shipping_info: {
      recipient_name: 'Phạm Thị D',
      recipient_phone: '0933445566',
      street: '12 Võ Văn Ngân',
      ward: 'Bình Thọ',
      district: 'Thủ Đức',
      province: 'TP.HCM'
    },
    items: [
      { product_id: 'P003', name: 'Cát Đậu Nành Cature', variant: '7L', quantity: 1, price: 185000 }
    ],
    history: [
      { timestamp: '2026-06-26 09:00:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Đơn COD < 1M' },
      { timestamp: '2026-06-26 14:00:00', staff_id: 'WH_STAFF_01', action: 'Bàn giao vận chuyển', details: 'GHN - GHN1234567' },
      { timestamp: '2026-06-28 10:00:00', staff_id: 'SYSTEM', action: 'Giao hàng thất bại', details: 'Khách không nghe máy 3 lần' }
    ],
    carrier: 'GHN',
    tracking_code: 'GHN1234567'
  },
  {
    order_id: 'SP-00005',
    customer_name: 'Khách vãng lai',
    customer_phone: '0909090909',
    created_at: '2026-06-28 12:00:00',
    payment_method: 'Chuyển khoản',
    status: 'PENDING_PAYMENT',
    total_amount: 550000,
    shipping_info: {
      recipient_name: 'Khách vãng lai',
      recipient_phone: '0909090909',
      street: 'Nhận tại quầy',
      ward: '',
      district: '',
      province: ''
    },
    items: [
      { product_id: 'P004', name: 'Sữa tắm SOS', variant: '500ml', quantity: 2, price: 275000 }
    ],
    history: [
      { timestamp: '2026-06-28 12:00:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Khách hàng đặt qua web, chọn chuyển khoản' }
    ]
  },
  {
    order_id: 'SP-00006',
    customer_name: 'Lê Minh Tâm',
    customer_phone: '0988776655',
    created_at: '2026-06-27 08:30:00',
    payment_method: 'COD',
    status: 'SHIPPING',
    total_amount: 890000,
    shipping_info: {
      recipient_name: 'Lê Minh Tâm',
      recipient_phone: '0988776655',
      street: '15/2 Phạm Văn Đồng',
      ward: 'Hiệp Bình Chánh',
      district: 'Thủ Đức',
      province: 'TP.HCM'
    },
    items: [
      { product_id: 'P005', name: 'Lồng vận chuyển', variant: 'Size L', quantity: 1, price: 890000 }
    ],
    history: [
      { timestamp: '2026-06-27 08:30:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Khách hàng đặt qua web' },
      { timestamp: '2026-06-27 15:00:00', staff_id: 'WH_STAFF_01', action: 'Bàn giao vận chuyển', details: 'J&T - JT987654321' }
    ],
    carrier: 'J&T Express',
    tracking_code: 'JT987654321'
  },
  {
    order_id: 'SP-00007',
    customer_name: 'Hoàng Anh',
    customer_phone: '0911223344',
    created_at: '2026-06-25 10:15:00',
    payment_method: 'Ví MoMo',
    status: 'COMPLETED',
    total_amount: 125000,
    shipping_info: {
      recipient_name: 'Hoàng Anh',
      recipient_phone: '0911223344',
      street: '22 Nguyễn Huệ',
      ward: 'Bến Nghé',
      district: 'Quận 1',
      province: 'TP.HCM'
    },
    items: [
      { product_id: 'P006', name: 'Đồ chơi cần câu mèo', variant: 'Cơ bản', quantity: 5, price: 25000 }
    ],
    history: [
      { timestamp: '2026-06-25 10:15:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Khách hàng thanh toán qua MoMo' },
      { timestamp: '2026-06-25 14:00:00', staff_id: 'WH_STAFF_02', action: 'Bàn giao vận chuyển', details: 'AhaMove' },
      { timestamp: '2026-06-25 16:30:00', staff_id: 'SYSTEM', action: 'Giao hàng thành công', details: 'Khách đã nhận hàng' }
    ]
  },
  {
    order_id: 'SP-00008',
    customer_name: 'Võ Thị Yến',
    customer_phone: '0977665544',
    created_at: '2026-06-28 13:00:00',
    payment_method: 'COD',
    status: 'CANCELLED',
    total_amount: 3000000,
    shipping_info: {
      recipient_name: 'Võ Thị Yến',
      recipient_phone: '0977665544',
      street: '99 Lê Duẩn',
      ward: 'Hải Châu 1',
      district: 'Hải Châu',
      province: 'Đà Nẵng'
    },
    items: [
      { product_id: 'P007', name: 'Nhà cây cho mèo', variant: 'Cao 1.5m', quantity: 1, price: 3000000 }
    ],
    history: [
      { timestamp: '2026-06-28 13:00:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Khách hàng đặt qua web' },
      { timestamp: '2026-06-28 13:30:00', staff_id: 'SALES_02', action: 'Hủy đơn hàng', details: 'Khách đổi ý, không muốn mua nữa' }
    ]
  },
  {
    order_id: 'SP-00009',
    customer_name: 'Phạm Quang Minh',
    customer_phone: '0933445566',
    created_at: '2026-06-28 14:15:00',
    payment_method: 'Chuyển khoản',
    status: 'CONFIRMED',
    total_amount: 1550000,
    shipping_info: {
      recipient_name: 'Phạm Quang Minh',
      recipient_phone: '0933445566',
      street: '45 Võ Văn Tần',
      ward: 'Võ Thị Sáu',
      district: 'Quận 3',
      province: 'TP.HCM'
    },
    items: [
      { product_id: 'P008', name: 'Balo phi hành gia cho mèo', variant: 'Màu xám', quantity: 1, price: 550000 },
      { product_id: 'P009', name: 'Hạt Nutrience Subzero', variant: '5kg', quantity: 1, price: 1000000 }
    ],
    history: [
      { timestamp: '2026-06-28 14:15:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Thanh toán chuyển khoản thành công' },
      { timestamp: '2026-06-28 14:20:00', staff_id: 'SALES_01', action: 'Xác nhận đơn', details: 'Chuyển sang kho chờ đóng gói' }
    ]
  },
  {
    order_id: 'SP-00010',
    customer_name: 'Bùi Thị Hà',
    customer_phone: '0922334455',
    created_at: '2026-06-28 15:00:00',
    payment_method: 'COD',
    status: 'CONFIRMED',
    total_amount: 320000,
    shipping_info: {
      recipient_name: 'Bùi Thị Hà',
      recipient_phone: '0922334455',
      street: '12/5 Phan Văn Trị',
      ward: 'Phường 7',
      district: 'Gò Vấp',
      province: 'TP.HCM'
    },
    items: [
      { product_id: 'P010', name: 'Cát vệ sinh đậu nành', variant: 'Hương trà xanh', quantity: 4, price: 80000 }
    ],
    history: [
      { timestamp: '2026-06-28 15:00:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Đặt hàng qua Web' },
      { timestamp: '2026-06-28 15:15:00', staff_id: 'SALES_02', action: 'Xác nhận đơn', details: 'Đã gọi xác nhận' }
    ]
  },
  {
    order_id: 'SP-00011',
    customer_name: 'Đinh Công Đạt',
    customer_phone: '0988112233',
    created_at: '2026-06-28 10:30:00',
    payment_method: 'Ví MoMo',
    status: 'PREPARING',
    total_amount: 450000,
    shipping_info: {
      recipient_name: 'Đinh Công Đạt',
      recipient_phone: '0988112233',
      street: 'Tòa nhà Landmark 81',
      ward: 'Phường 22',
      district: 'Bình Thạnh',
      province: 'TP.HCM'
    },
    items: [
      { product_id: 'P011', name: 'Pate Wanpy', variant: 'Vị cá ngừ', quantity: 15, price: 30000 }
    ],
    history: [
      { timestamp: '2026-06-28 10:30:00', staff_id: 'SYSTEM', action: 'Tạo đơn hàng', details: 'Thanh toán MoMo' },
      { timestamp: '2026-06-28 10:45:00', staff_id: 'SALES_01', action: 'Xác nhận đơn', details: '' },
      { timestamp: '2026-06-28 11:20:00', staff_id: 'WH_STAFF', action: 'Đóng gói xong', details: 'Sẵn sàng giao cho ĐVVC' }
    ]
  }
];

// Helper: Lấy thời gian hiện tại
const getNow = () => {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
};

// Error: Lỗi xung đột dữ liệu (EF-01)
class ConcurrencyError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConcurrencyError';
  }
}

// Kiểm tra trạng thái đồng bộ
const checkConcurrency = (order, expectedStatus) => {
  if (order.status !== expectedStatus) {
    throw new ConcurrencyError('Đơn hàng này đã được xử lý bởi nhân viên khác hoặc trạng thái đã thay đổi.');
  }
};

// 1. GET Orders (Sales + Warehouse)
export const fetchOrders = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  let result = [...dbOrders];

  if (filters.status && filters.status !== 'ALL') {
    result = result.filter(o => o.status === filters.status);
  }

  if (filters.search_keyword) {
    const kw = filters.search_keyword.toLowerCase();
    result = result.filter(o => 
      o.order_id.toLowerCase().includes(kw) ||
      o.customer_name.toLowerCase().includes(kw) ||
      o.customer_phone.includes(kw)
    );
  }

  // Sắp xếp mới nhất lên đầu
  result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  return result;
};

// 1.5 Tạo đơn hàng mới (từ POS/Web)
export const createOrder = async (orderData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newOrder = {
    order_id: `SP-${String(dbOrders.length + 1).padStart(5, '0')}`,
    created_at: getNow(),
    ...orderData,
    history: [
      { timestamp: getNow(), staff_id: orderData.staff_id || 'SALES_01', action: 'Tạo đơn hàng', details: 'Nhân viên tạo đơn tại quầy' }
    ]
  };

  dbOrders.push(newOrder);
  return newOrder;
};

// 2. Xác minh đơn COD >= 1.000.000
export const verifyOrder = async (orderId, expectedStatus, verifyData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const idx = dbOrders.findIndex(o => o.order_id === orderId);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');
  
  checkConcurrency(dbOrders[idx], expectedStatus);

  const { call_result, note, staff_id } = verifyData;
  const newStatus = call_result === 'SUCCESSED' ? 'CONFIRMED' : 'CANCELLED';

  const logEntry = {
    timestamp: getNow(),
    staff_id: staff_id || 'SALES_01',
    action: call_result === 'SUCCESSED' ? 'Xác nhận đơn hàng' : 'Hủy đơn hàng (Xác minh thất bại)',
    details: `Kết quả: ${call_result} - Ghi chú: ${note}`
  };

  dbOrders[idx] = {
    ...dbOrders[idx],
    status: newStatus,
    history: [...dbOrders[idx].history, logEntry]
  };

  return dbOrders[idx];
};

// 3. Chỉnh sửa thông tin giao hàng
export const updateShippingInfo = async (orderId, expectedStatus, shippingData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const idx = dbOrders.findIndex(o => o.order_id === orderId);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');
  
  // Không cho sửa nếu đang giao hoặc hoàn tất
  if (['SHIPPING', 'COMPLETED'].includes(dbOrders[idx].status)) {
    throw new Error('Không thể sửa địa chỉ khi đơn hàng đang giao hoặc đã hoàn tất.');
  }

  checkConcurrency(dbOrders[idx], expectedStatus);

  const logEntry = {
    timestamp: getNow(),
    staff_id: shippingData.staff_id || 'SALES_01',
    action: 'Sửa thông tin giao hàng',
    details: `Đổi địa chỉ thành: ${shippingData.street}, ${shippingData.ward}`
  };

  dbOrders[idx] = {
    ...dbOrders[idx],
    shipping_info: {
      ...dbOrders[idx].shipping_info,
      ...shippingData
    },
    history: [...dbOrders[idx].history, logEntry]
  };

  return dbOrders[idx];
};

// 4. Hủy đơn hàng
export const cancelOrder = async (orderId, expectedStatus, cancelData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const idx = dbOrders.findIndex(o => o.order_id === orderId);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');

  // Không cho hủy nếu đang giao hoặc hoàn tất
  if (['SHIPPING', 'COMPLETED'].includes(dbOrders[idx].status)) {
    throw new Error('Không thể hủy khi đơn hàng đang giao hoặc đã hoàn tất.');
  }

  checkConcurrency(dbOrders[idx], expectedStatus);

  const { reason_code, detail, staff_id } = cancelData;

  const logEntry = {
    timestamp: getNow(),
    staff_id: staff_id || 'SALES_01',
    action: 'Hủy đơn hàng',
    details: `Lý do: ${reason_code} - ${detail}`
  };

  dbOrders[idx] = {
    ...dbOrders[idx],
    status: 'CANCELLED',
    history: [...dbOrders[idx].history, logEntry]
  };

  // Hoàn lại kho (mock)
  // Thực tế sẽ update dbProducts ở đây
  return dbOrders[idx];
};

// 5. Xác nhận đóng gói (Warehouse)
export const packOrder = async (orderId, expectedStatus, staff_id = 'WH_STAFF_01') => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const idx = dbOrders.findIndex(o => o.order_id === orderId);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');
  
  checkConcurrency(dbOrders[idx], expectedStatus);

  const logEntry = {
    timestamp: getNow(),
    staff_id,
    action: 'Xác nhận đóng gói',
    details: 'Đã nhặt hàng và đóng gói xong'
  };

  dbOrders[idx] = {
    ...dbOrders[idx],
    status: 'PREPARING',
    history: [...dbOrders[idx].history, logEntry]
  };

  return dbOrders[idx];
};

// 6. Bàn giao vận chuyển (Warehouse)
export const shipOrder = async (orderId, expectedStatus, shipData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const idx = dbOrders.findIndex(o => o.order_id === orderId);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');
  
  checkConcurrency(dbOrders[idx], expectedStatus);

  const { carrier, tracking_code, staff_id } = shipData;

  const logEntry = {
    timestamp: getNow(),
    staff_id: staff_id || 'WH_STAFF_01',
    action: 'Bàn giao vận chuyển',
    details: `ĐVVC: ${carrier} - Mã vận đơn: ${tracking_code}`
  };

  dbOrders[idx] = {
    ...dbOrders[idx],
    status: 'SHIPPING',
    carrier,
    tracking_code,
    history: [...dbOrders[idx].history, logEntry]
  };

  return dbOrders[idx];
};

// 7. Hoàn kho (Warehouse)
export const returnStock = async (orderId, expectedStatus, returnData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const idx = dbOrders.findIndex(o => o.order_id === orderId);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');
  
  checkConcurrency(dbOrders[idx], expectedStatus);

  const { condition, staff_id } = returnData;

  const logEntry = {
    timestamp: getNow(),
    staff_id: staff_id || 'WH_STAFF_01',
    action: 'Nhận hàng hoàn',
    details: `Tình trạng hàng: ${condition} - ${condition === 'INTACT' ? 'Đã hoàn kho bãi' : 'Hàng hư hỏng, đã hủy'}`
  };

  dbOrders[idx] = {
    ...dbOrders[idx],
    status: 'CANCELLED', // Trở về Đã hủy theo logic mới
    history: [...dbOrders[idx].history, logEntry]
  };

  return dbOrders[idx];
};

// 8. Cập nhật trạng thái giao hàng thủ công (Thay thế Webhook)
export const mockWebhookUpdate = async (orderId, expectedStatus, result) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const idx = dbOrders.findIndex(o => o.order_id === orderId);
  if (idx === -1) throw new Error('Không tìm thấy đơn hàng');

  checkConcurrency(dbOrders[idx], expectedStatus);

  let newStatus = '';
  let action = '';
  let details = '';

  if (result === 'SUCCESS') {
    newStatus = 'COMPLETED';
    action = 'Giao hàng thành công';
    details = 'Cập nhật thủ công: Khách đã nhận hàng và thanh toán COD (nếu có)';
  } else if (result === 'FAILED') {
    newStatus = 'FAILED_DELIVERY';
    action = 'Giao hàng thất bại';
    details = 'Cập nhật thủ công: Khách không nhận hàng / Sai địa chỉ. Bắt đầu hoàn về kho.';
  }

  const logEntry = {
    timestamp: getNow(),
    staff_id: 'WH_STAFF_01',
    action,
    details
  };

  dbOrders[idx] = {
    ...dbOrders[idx],
    status: newStatus,
    history: [...dbOrders[idx].history, logEntry]
  };

  return dbOrders[idx];
};
