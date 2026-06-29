import { useState, useEffect } from 'react';
import Head from 'next/head';
import StaffLayout from '@/components/layout/StaffLayout';
import { fetchProducts, formatVND } from '@/data/api';
import { createOrder } from '@/data/ordersApi';
import { Search, ShoppingCart, Plus, Minus, Trash2, Tag, CreditCard, Banknote, MapPin, Package, CheckCircle2, Store, ShoppingBag } from 'lucide-react';
import OrdersList from '@/components/staff/OrdersList';

export default function ShopPOS() {
  const [activeMainTab, setActiveMainTab] = useState('POS'); // 'POS' | 'ORDERS'
  
  // POS State
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');
  const [petTypeFilter, setPetTypeFilter] = useState('Tất cả');

  // Cart
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Tiền mặt');
  const [deliveryMethod, setDeliveryMethod] = useState('Tại quầy');
  
  // Order status
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const CATEGORIES = ['Tất cả', 'Thức ăn', 'Đồ chơi', 'Vệ sinh', 'Phụ kiện'];
  const PET_TYPES = ['Tất cả', 'Chó', 'Mèo'];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterData();
  }, [products, searchTerm, categoryFilter, petTypeFilter]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let result = products;
    if (categoryFilter !== 'Tất cả') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (petTypeFilter !== 'Tất cả') {
      result = result.filter(p => p.pet_type.includes(petTypeFilter));
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(lower) || p.brand.toLowerCase().includes(lower) || p.id.toLowerCase().includes(lower));
    }
    setFilteredProducts(result);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, variant: product.variants[0] || '' }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.product.stock) {
            alert(`Chỉ còn ${item.product.stock} sản phẩm trong kho!`);
            return item;
          }
          if (newQty < 1) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'GIAM10K') {
      setDiscountValue(10000);
      alert('Đã áp dụng mã giảm giá 10k!');
    } else if (discountCode.toUpperCase() === 'GIAM10%') {
      const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      setDiscountValue(subtotal * 0.1);
      alert('Đã áp dụng mã giảm giá 10%!');
    } else {
      setDiscountValue(0);
      alert('Mã giảm giá không hợp lệ!');
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Tạo đơn hàng thật vào DB mock thay vì chỉ bật modal
    const orderItems = cart.map(item => ({
      product_id: item.product.id,
      name: item.product.name,
      variant: item.variant || '',
      quantity: item.quantity,
      price: item.product.price
    }));

    try {
      const newOrder = await createOrder({
        customer_name: 'Khách mua tại quầy',
        customer_phone: '',
        payment_method: paymentMethod,
        status: deliveryMethod === 'Giao hàng' ? 'CONFIRMED' : 'COMPLETED',
        total_amount: total,
        shipping_info: {
          recipient_name: 'Khách mua tại quầy',
          recipient_phone: '',
          street: deliveryMethod,
          ward: '',
          district: '',
          province: ''
        },
        items: orderItems
      });
      setCreatedOrder(newOrder);
      setIsSuccessModalOpen(true);
    } catch (err) {
      alert("Có lỗi khi tạo đơn hàng: " + err.message);
    }
  };

  const resetOrder = () => {
    setCart([]);
    setDiscountCode('');
    setDiscountValue(0);
    setPaymentMethod('Tiền mặt');
    setDeliveryMethod('Tại quầy');
    setIsSuccessModalOpen(false);
    setCreatedOrder(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discountValue);

  return (
    <StaffLayout>
      <Head>
        <title>PawCare - Cửa hàng (POS)</title>
      </Head>
      
      <div className="flex flex-col h-full bg-gray-50">
        
        {/* Main Tabs Navigation */}
        <div className="bg-white px-4 md:px-6 pt-4 border-b border-gray-200 z-10 shrink-0">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveMainTab('POS')}
              className={`pb-3 font-bold flex items-center gap-2 border-b-2 transition-all ${activeMainTab === 'POS' ? 'border-chloro text-chloro' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <Store size={20} /> POS (Bán tại quầy)
            </button>
            <button 
              onClick={() => setActiveMainTab('ORDERS')}
              className={`pb-3 font-bold flex items-center gap-2 border-b-2 transition-all ${activeMainTab === 'ORDERS' ? 'border-chloro text-chloro' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              <ShoppingBag size={20} /> Đơn hàng Online (Sales)
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeMainTab === 'POS' ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left: Product List */}
            <div className="flex-1 flex flex-col h-full lg:h-[calc(100vh-130px)] overflow-hidden">
              {/* Top Header & Filters */}
              <div className="bg-white p-4 md:p-6 border-b border-gray-200 z-10 shrink-0 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Tìm sản phẩm, mã vạch..." 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-xl outline-none focus:border-chloro focus:ring-1 focus:ring-chloro transition-all bg-gray-50/50"
                    />
                  </div>
                  <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0 items-center">
                    <select 
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl font-bold outline-none focus:border-chloro bg-white hover:bg-gray-50 shrink-0"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select 
                      value={petTypeFilter}
                      onChange={e => setPetTypeFilter(e.target.value)}
                      className="border border-gray-200 text-gray-700 px-3 py-2.5 rounded-xl font-bold outline-none focus:border-chloro bg-white hover:bg-gray-50 shrink-0"
                    >
                      {PET_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button 
                      onClick={() => setIsCartOpen(!isCartOpen)}
                      className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shrink-0 transition-colors ${isCartOpen ? 'bg-understory text-white' : 'bg-chloro text-white hover:bg-green-700'}`}
                    >
                      <ShoppingCart size={20} />
                      <span className="hidden sm:inline">Giỏ hàng</span>
                      {cart.length > 0 && (
                        <span className="bg-white text-chloro text-xs px-2 py-0.5 rounded-full">{cart.reduce((a,c)=>a+c.quantity, 0)}</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Grid */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32 lg:pb-6">
                {isLoading ? (
                  <div className="flex justify-center items-center h-64 text-gray-400">Đang tải sản phẩm...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <Package size={48} className="mb-4 opacity-50" />
                    <p>Không tìm thấy sản phẩm nào.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id} 
                        onClick={() => addToCart(product)}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-chloro/50 transition-all cursor-pointer group flex flex-col overflow-hidden"
                      >
                        <div className="relative aspect-square bg-gray-50 p-4 flex items-center justify-center">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" />
                          {product.stock <= 5 && (
                            <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">
                              Sắp hết ({product.stock})
                            </div>
                          )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-xs text-lacustral font-semibold mb-1 uppercase tracking-wider">{product.brand}</p>
                          <h3 className="font-bold text-understory leading-tight text-sm line-clamp-2 mb-2 flex-1">{product.name}</h3>
                          <div className="flex items-end justify-between mt-auto">
                            <p className="font-extrabold text-chloro">{formatVND(product.price)}</p>
                            <button className="w-8 h-8 rounded-full bg-green-50 text-chloro flex items-center justify-center group-hover:bg-chloro group-hover:text-white transition-colors">
                              <Plus size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Cart & Checkout */}
            {isCartOpen && (
              <div className="w-full lg:w-[400px] xl:w-[450px] bg-white border-l border-gray-200 flex flex-col h-[calc(100vh-130px)] shrink-0 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.02)] z-20 transition-transform">
              {/* Cart Header */}
              <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0">
                <h2 className="text-xl font-bold text-understory flex items-center gap-2">
                  <ShoppingCart size={24} className="text-chloro" /> 
                  Giỏ hàng
                  {cart.length > 0 && (
                    <span className="bg-xantho text-understory text-sm px-2 py-0.5 rounded-full ml-1">{cart.reduce((a,c) => a + c.quantity, 0)}</span>
                  )}
                </h2>
                {cart.length > 0 && (
                  <button 
                    onClick={() => setCart([])}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={16} /> Xóa tất cả
                  </button>
                )}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
                      <ShoppingCart size={40} className="text-gray-300" />
                    </div>
                    <p>Giỏ hàng trống</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cart.map(item => (
                      <div key={item.product.id} className="flex gap-4 items-center bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded-xl bg-gray-50" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-understory truncate">{item.product.name}</h4>
                          <p className="text-xs text-lacustral mt-0.5">Kho: {item.product.stock} • Phân loại: {item.variant}</p>
                          <p className="font-bold text-chloro text-sm mt-1">{formatVND(item.product.price)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button onClick={() => removeFromCart(item.product.id)} className="text-gray-300 hover:text-red-500">
                            <XCircle2 size={18} />
                          </button>
                          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                            <button 
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-500 hover:text-chloro"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-6 h-6 flex items-center justify-center bg-white rounded shadow-sm text-gray-500 hover:text-chloro"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Checkout Footer */}
              <div className="p-4 md:p-6 border-t border-gray-200 bg-white">
                {/* Promo Code */}
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Mã giảm giá..." 
                      value={discountCode}
                      onChange={e => setDiscountCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-chloro"
                    />
                  </div>
                  <button 
                    onClick={applyDiscount}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>

                {/* Methods */}
                <div className="flex gap-2 mb-4">
                  <select 
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="flex-1 border border-gray-200 text-sm py-2 px-3 rounded-xl outline-none focus:border-chloro bg-gray-50 font-medium"
                  >
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="Chuyển khoản">Chuyển khoản / Quẹt thẻ</option>
                    <option value="COD">Thu hộ (COD)</option>
                  </select>
                  <select 
                    value={deliveryMethod}
                    onChange={e => setDeliveryMethod(e.target.value)}
                    className="flex-1 border border-gray-200 text-sm py-2 px-3 rounded-xl outline-none focus:border-chloro bg-gray-50 font-medium"
                  >
                    <option value="Tại quầy">Nhận tại quầy</option>
                    <option value="Giao hàng">Giao tận nơi</option>
                  </select>
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Tạm tính ({cart.length} món)</span>
                    <span className="font-semibold">{formatVND(subtotal)}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giảm giá</span>
                      <span className="font-semibold">-{formatVND(discountValue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                    <span className="text-gray-900 font-bold">Thành tiền</span>
                    <span className="text-2xl font-extrabold text-chloro leading-none">{formatVND(total)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    cart.length > 0 
                      ? 'bg-gradient-to-r from-chloro to-[#6fa880] hover:from-green-700 hover:to-chloro text-white shadow-chloro/20 hover:shadow-chloro/40' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {paymentMethod === 'Tiền mặt' ? <Banknote size={20} /> : <CreditCard size={20} />}
                  Thanh toán & Tạo đơn
                </button>
              </div>
            </div>
            )}
          </div>
        ) : (
          <div className="flex-1 p-4 md:p-6 overflow-hidden h-[calc(100vh-130px)]">
            <OrdersList />
          </div>
        )}
      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-extrabold text-understory mb-2">Thành công!</h2>
            <p className="text-gray-500 mb-6">Đơn hàng đã được tạo và thanh toán thành công.</p>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mã đơn:</span>
                <span className="font-bold text-understory">{createdOrder?.order_id || 'SP-...'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Thanh toán:</span>
                <span className="font-bold text-understory">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tổng tiền:</span>
                <span className="font-bold text-chloro">{formatVND(total)}</span>
              </div>
            </div>

            <button 
              onClick={resetOrder}
              className="w-full bg-understory hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              Tạo đơn mới
            </button>
          </div>
        </div>
      )}

    </StaffLayout>
  );
}

// Thay thế <X /> bằng XCircle2 vì import bị thiếu
function XCircle2(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  )
}

