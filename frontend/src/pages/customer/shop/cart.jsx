import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/context/CartContext';
import { createOrder, getOrCreateGuestCustomer } from '@/services/supabase/supabaseShopApi';
import { 
  Trash2, Plus, Minus, ArrowRight, ShieldCheck, 
  CheckCircle2, Lock, Tag, MapPin, X, ShoppingBag, ShoppingCart 
} from 'lucide-react';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart, user, loading } = useCart();
  
  // Track which items are checked/selected for checkout (by variant_id)
  const [checkedItems, setCheckedItems] = useState([]);
  
  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [discountAmountState, setDiscountAmountState] = useState(0);
  const [discountLabel, setDiscountLabel] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');
  const [appliedVoucherId, setAppliedVoucherId] = useState(null);
  
  // Shipping fee
  const shippingFee = 25000;

  // Checkout modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  
  // Checkout form fields
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    ward: '',
    district: '',
    province: '',
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Default all items to checked on load
  useEffect(() => {
    if (cartItems.length > 0 && checkedItems.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckedItems(cartItems.map(item => item.variant_id));
    }
  }, [cartItems]);

  // Sync user info to checkout form if logged in
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(prev => ({
        ...prev,
        fullName: `${user.last_name || ''} ${user.first_name || ''}`.trim(),
        phone: user.phone || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Calculations
  const selectedCartItems = cartItems.filter(item => checkedItems.includes(item.variant_id));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Handle select/deselect all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setCheckedItems(cartItems.map(item => item.variant_id));
    } else {
      setCheckedItems([]);
    }
  };

  // Handle individual toggle
  const handleToggleItem = (variantId) => {
    if (checkedItems.includes(variantId)) {
      setCheckedItems(checkedItems.filter(id => id !== variantId));
    } else {
      setCheckedItems([...checkedItems, variantId]);
    }
  };

  // Promo code logic
  const { validateVoucher } = require('@/services/supabase/supabaseShopApi');
  
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    try {
      const voucher = await validateVoucher(promoCode, subtotal);
      
      let calculatedDiscount = 0;
      if (voucher.discount_type === 'percentage') {
        calculatedDiscount = subtotal * (Number(voucher.discount_value) / 100);
        if (voucher.max_discount_amount) {
          calculatedDiscount = Math.min(calculatedDiscount, Number(voucher.max_discount_amount));
        }
      } else {
        calculatedDiscount = Number(voucher.discount_value);
      }
      
      setDiscountAmountState(calculatedDiscount);
      setDiscountLabel(`Giảm giá (${voucher.discount_type === 'percentage' ? voucher.discount_value + '%' : formatPrice(voucher.discount_value)})`);
      setAppliedPromo(voucher.code);
      setAppliedVoucherId(voucher.voucher_id);
      toast.success('Áp dụng mã giảm giá thành công!');
    } catch (error) {
      toast.error(error.message || 'Mã giảm giá không hợp lệ');
    }
  };

  const handleRemovePromo = () => {
    setDiscountAmountState(0);
    setDiscountLabel('');
    setAppliedPromo('');
    setAppliedVoucherId(null);
    setPromoCode('');
    toast.info('Đã hủy áp dụng mã giảm giá');
  };

  const discountAmount = discountAmountState;
  const grandTotal = subtotal > 0 ? subtotal - discountAmount + shippingFee : 0;

  // Handle Checkout submission
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (selectedCartItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.street.trim() || !formData.province.trim()) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc (*)');
      return;
    }

    setSubmittingOrder(true);
    try {
      let finalCustomerId = user?.customer_id || null;
      if (!finalCustomerId) {
        // Create or find guest customer in database to link order
  const guestResult = await getOrCreateGuestCustomer({
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          street: formData.street,
          ward: formData.ward,
          district: formData.district,
          province: formData.province
        });
        finalCustomerId = guestResult?.customerId ?? guestResult;
      }

      const orderData = {
        total_amount: grandTotal,
        subtotal: subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        customer_id: finalCustomerId,
        voucher_id: appliedVoucherId,
        items: selectedCartItems.map(item => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_info: {
          street: formData.street,
          ward: formData.ward,
          district: formData.district,
          province: formData.province
        }
      };

      const result = await createOrder(orderData);
      setCreatedOrderId(result.order_id);
      setCheckoutSuccess(true);
      
      // Remove checked items from cart
      for (const item of selectedCartItems) {
        await removeFromCart(item.variant_id);
      }
      setCheckedItems([]);
      toast.success('Đặt hàng thành công!');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const formatPrice = (priceVal) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVal);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between font-sans">
      <div>
        <Header activePath="/customer/shop/cart" />

        <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-10 max-w-[1440px] mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8">
            <Link href="/" className="hover:text-understory transition-colors">Trang chủ</Link>
            <ChevronRightIcon />
            <Link href="/san_pham" className="hover:text-understory transition-colors">Cửa hàng</Link>
            <ChevronRightIcon />
            <span className="text-[#362F22] font-bold">Giỏ hàng</span>
          </nav>

          <h1 className="text-3xl font-extrabold text-wood-bark tracking-tight mb-8">
            Giỏ hàng của bạn
          </h1>

          {loading ? (
            /* Loading State */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-4 animate-pulse">
                {[1, 2].map(n => (
                  <div key={n} className="bg-white rounded-3xl p-6 h-40 border border-gray-100"></div>
                ))}
              </div>
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 h-80 border border-gray-100 animate-pulse"></div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
              <div className="p-4 bg-fresh-grown/30 text-fig-leaf rounded-full mb-4">
                <ShoppingCart size={48} />
              </div>
              <h3 className="text-xl font-bold text-[#362F22] mb-2">Giỏ hàng của bạn đang trống</h3>
              <p className="text-gray-400 text-sm max-w-sm mb-6">
                Hãy ghé cửa hàng để tìm mua các sản phẩm dinh dưỡng, phụ kiện sành điệu cho bé cưng của bạn.
              </p>
              <Link 
                href="/san_pham"
                className="px-6 py-3 bg-[#1B693C] text-white font-bold text-sm rounded-full hover:bg-moss-green transition-all shadow-md shadow-understory/10"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            /* Cart Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-4">
                {/* Select All Checkbox Header */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={checkedItems.length === cartItems.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-gray-300 text-understory focus:ring-understory focus:ring-offset-0 focus:outline-none"
                    />
                    <span className="text-sm font-semibold text-[#362F22]">
                      Chọn tất cả ({cartItems.length} sản phẩm)
                    </span>
                  </label>
                  
                  {checkedItems.length > 0 && (
                    <button 
                      onClick={clearCart}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={14} /> Xóa tất cả
                    </button>
                  )}
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div 
                      key={item.variant_id}
                      className={`bg-white rounded-3xl p-5 border shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        checkedItems.includes(item.variant_id) ? 'border-fresh-grown/80 bg-fresh-grown/5' : 'border-slate-100'
                      }`}
                    >
                      {/* Checkbox & Product Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <input 
                          type="checkbox"
                          checked={checkedItems.includes(item.variant_id)}
                          onChange={() => handleToggleItem(item.variant_id)}
                          className="w-5 h-5 rounded border-gray-300 text-understory focus:ring-understory focus:ring-offset-0 focus:outline-none shrink-0"
                        />
                        
                        {/* Image */}
                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Details */}
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-[#362F22] hover:text-understory transition-colors leading-snug">
                            {item.name}
                          </h4>
                          {item.capacity_label && (
                            <p className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                              Phân loại: {item.capacity_label}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-400 block">
                            Thương hiệu: {item.brand}
                          </p>
                        </div>
                      </div>

                      {/* Quantity & Price Panel */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <button 
                            onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                            aria-label="Giảm số lượng"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 text-xs font-bold text-[#362F22] w-8 text-center select-none">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                            className="p-2 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
                            aria-label="Tăng số lượng"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="block font-extrabold text-sm text-[#1B693C]">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-gray-400 block font-semibold">
                              {formatPrice(item.price)} / sản phẩm
                            </span>
                          )}
                        </div>

                        {/* Delete Button */}
                        <button 
                          onClick={() => removeFromCart(item.variant_id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="lg:col-span-4 bg-[#1e293b] rounded-[2rem] p-6 text-white shadow-xl sticky top-24">
                <h3 className="text-lg font-bold tracking-tight mb-6 pb-4 border-b border-slate-700">
                  Tóm tắt đơn hàng
                </h3>

                <div className="space-y-4 text-sm font-medium">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Tạm tính ({selectedCartItems.length} sản phẩm)</span>
                    <span className="font-bold text-white">{formatPrice(subtotal)}</span>
                  </div>

                  {/* Discount */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-400">
                      <span>{discountLabel}</span>
                      <span className="font-bold">- {formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  {/* Shipping Fee */}
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Phí vận chuyển</span>
                    <span className="font-bold text-white">
                      {subtotal > 0 ? formatPrice(shippingFee) : formatPrice(0)}
                    </span>
                  </div>

                  {/* Promo Code Input */}
                  <div className="pt-2 border-t border-slate-700">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Mã giảm giá
                    </label>
                    {appliedPromo ? (
                      <div className="flex items-center justify-between bg-slate-800 px-3 py-2 rounded-xl border border-green-500/30">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-green-400" />
                          <span className="font-bold text-xs text-green-400">{appliedPromo}</span>
                        </div>
                        <button 
                          onClick={handleRemovePromo}
                          className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyPromo} className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Nhập mã (PAWCARE5...)"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-understory"
                        />
                        <button 
                          type="submit"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 transition-colors font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Áp dụng
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Grand Total */}
                  <div className="pt-4 border-t border-slate-700 space-y-1">
                    <div className="flex justify-between items-end">
                      <span className="text-base font-bold">Tổng cộng</span>
                      <span className="text-2xl font-black text-emerald-400">
                        {formatPrice(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button 
                    onClick={() => {
                      if (selectedCartItems.length === 0) {
                        toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
                        return;
                      }

                      const selectedIds = selectedCartItems.map((item) => item.variant_id).join(',');
                      router.push({
                        pathname: '/customer/shop/checkout',
                        query: { ids: selectedIds }
                      });
                    }}
                    disabled={selectedCartItems.length === 0}
                    className="w-full mt-4 py-4 bg-[#F2994A] hover:bg-[#e28a38] text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:hover:bg-[#F2994A] cursor-pointer"
                  >
                    Tiến hành thanh toán <ArrowRight size={16} />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-3 text-center">
                    <Lock size={12} className="text-slate-400" />
                    <span>Quy trình thanh toán được bảo mật & mã hóa</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </main>
      </div>

      {/* Checkout Information Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#362F22] flex items-center gap-2">
                  <MapPin className="text-understory" /> Thông tin nhận hàng
                </h3>
                <p className="text-xs text-gray-400 mt-1">Vui lòng điền thông tin để chúng tôi giao hàng sớm nhất</p>
              </div>
              <button 
                onClick={() => {
                  setShowCheckoutModal(false);
                  setCheckoutSuccess(false);
                }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {checkoutSuccess ? (
                /* Success screen */
                <div className="text-center py-10 space-y-4">
                  <div className="inline-flex p-4 bg-green-50 text-green-600 rounded-full mb-2">
                    <CheckCircle2 size={56} />
                  </div>
                  <h4 className="text-2xl font-black text-[#362F22]">Đặt hàng thành công!</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Đơn hàng mã <span className="font-bold text-understory">{createdOrderId}</span> đã được ghi nhận. Hệ thống sẽ liên hệ tới bạn để xác nhận trong thời gian sớm nhất.
                  </p>
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        setShowCheckoutModal(false);
                        setCheckoutSuccess(false);
                        router.push('/san_pham');
                      }}
                      className="px-6 py-3 bg-understory text-white font-bold text-sm rounded-full hover:bg-moss-green transition-all shadow-md shadow-understory/10 cursor-pointer"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                </div>
              ) : (
                /* Checkout Form */
                <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">Họ và tên *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Nguyễn Văn A"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-understory focus:bg-white transition-all text-slate-800 font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">Số điện thoại *</label>
                      <input 
                        type="tel"
                        required
                        placeholder="09xxxxxxxx"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-understory focus:bg-white transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">Địa chỉ Email (nếu có)</label>
                    <input 
                      type="email"
                      placeholder="customer@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-understory focus:bg-white transition-all text-slate-800 font-medium"
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <h5 className="font-bold text-sm text-[#362F22] mb-3">Địa chỉ nhận hàng</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block">Tỉnh / Thành phố *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Hà Nội"
                          value={formData.province}
                          onChange={(e) => setFormData({...formData, province: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-understory focus:bg-white transition-all text-slate-800 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block">Quận / Huyện *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Cầu Giấy"
                          value={formData.district}
                          onChange={(e) => setFormData({...formData, district: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-understory focus:bg-white transition-all text-slate-800 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block">Phường / Xã *</label>
                        <input 
                          type="text"
                          required
                          placeholder="Dịch Vọng"
                          value={formData.ward}
                          onChange={(e) => setFormData({...formData, ward: e.target.value})}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-understory focus:bg-white transition-all text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">Số nhà, tên đường *</label>
                      <input 
                        type="text"
                        required
                        placeholder="Số 10, ngõ 20 Cầu Giấy"
                        value={formData.street}
                        onChange={(e) => setFormData({...formData, street: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-understory focus:bg-white transition-all text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Summary recap inside form */}
                  <div className="bg-[#f8fafc] rounded-2xl p-4 space-y-2.5 border border-slate-100">
                    <h6 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Đơn hàng thanh toán</h6>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>Sản phẩm ({selectedCartItems.length}):</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                      <span>Phí giao hàng:</span>
                      <span>{formatPrice(shippingFee)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between items-center text-xs font-bold text-green-600">
                        <span>Giảm giá:</span>
                        <span>- {formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm font-black text-slate-800 pt-2 border-t border-slate-200">
                      <span>Tổng số tiền:</span>
                      <span className="text-[#1B693C] text-base">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Checkout Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm text-slate-600 font-bold transition-all cursor-pointer"
                    >
                      Quay lại
                    </button>
                    <button 
                      type="submit"
                      disabled={submittingOrder}
                      className="px-6 py-2.5 bg-understory hover:bg-moss-green text-white rounded-xl text-sm font-bold shadow-md shadow-understory/15 flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                    >
                      {submittingOrder ? 'Đang tạo đơn hàng...' : 'Xác nhận đặt hàng'} <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

// Breadcrumb separator icon helper
function ChevronRightIcon() {
  return (
    <svg className="w-3 h-3 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
