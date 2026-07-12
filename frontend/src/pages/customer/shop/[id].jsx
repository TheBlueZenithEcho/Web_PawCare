import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchProductById } from '@/services/supabase/supabaseShopApi';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    
    async function loadProduct() {
      setLoading(true);
      try {
        const data = await fetchProductById(id);
        setProduct(data);
        if (data.full_variants && data.full_variants.length > 0) {
          setSelectedVariant(data.full_variants[0]);
        }
      } catch (err) {
        console.error(err);
        toast.error('Không tìm thấy sản phẩm');
        router.push('/san_pham');
      } finally {
        setLoading(false);
      }
    }
    
    loadProduct();
  }, [id, router]);

  const handleQuantityChange = (type) => {
    if (!selectedVariant) return;
    
    if (type === 'inc') {
      if (quantity < selectedVariant.stock_quantity) {
        setQuantity(prev => prev + 1);
      } else {
        toast.error(`Sản phẩm này hiện chỉ còn ${selectedVariant.stock_quantity} sản phẩm trong kho`);
      }
    } else {
      if (quantity > 1) {
        setQuantity(prev => prev - 1);
      }
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    if (selectedVariant.stock_quantity < 1) {
      toast.error('Sản phẩm đã hết hàng');
      return;
    }
    
    if (quantity > selectedVariant.stock_quantity) {
      toast.error(`Sản phẩm này hiện chỉ còn ${selectedVariant.stock_quantity} sản phẩm trong kho`);
      return;
    }

    // Call addToCart but we pass a specialized product object that has the specific variant selected
    addToCart({
      ...product,
      image: product.images[0], // Keep backward compatibility for CartContext
      selectedVariantLabel: selectedVariant.capacity_label,
      quantityToAdd: quantity
    });
    
    // Reset quantity after adding
    setQuantity(1);
  };

  const formatPrice = (priceVal) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVal);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
        <Header activePath="/san_pham" />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B693C]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      <Head>
        <title>{product.name} | PawCare</title>
      </Head>
      
      <Header activePath="/san_pham" />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-8">
          <Link href="/" className="hover:text-understory transition-colors">Trang chủ</Link>
          <ChevronRightIcon />
          <Link href="/san_pham" className="hover:text-understory transition-colors">Cửa hàng</Link>
          <ChevronRightIcon />
          <span className="text-wood-bark">{product.category}</span>
          <ChevronRightIcon />
          <span className="text-[#362F22] font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Column: Images */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="w-full aspect-square rounded-3xl overflow-hidden bg-gray-50 border border-gray-100 relative select-none">
              <img 
                src={product.images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
              {selectedVariant?.stock_quantity === 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  HẾT HÀNG
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#1B693C] shadow-md opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#362F22] leading-tight tracking-tight mb-2">
              {product.name}
            </h1>
            
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-gray-500 mb-6">
              <span className="flex items-center gap-1.5">
                <span className="text-wood-bark/60">Thương hiệu:</span> 
                <span className="text-[#1B693C]">{product.brand}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current opacity-50" />
                <span className="text-gray-400 ml-1">(4.5/5)</span>
              </span>
            </div>

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-[#1B693C]">
                  {formatPrice(selectedVariant ? selectedVariant.price : product.price)}
                </span>
                {selectedVariant && (
                  <span className={`text-sm font-bold px-3 py-1 rounded-full mb-1 ${selectedVariant.stock_quantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {selectedVariant.stock_quantity > 0 ? `Còn ${selectedVariant.stock_quantity} sản phẩm` : 'Hết hàng'}
                  </span>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.full_variants && product.full_variants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-[#362F22] mb-3 uppercase tracking-wider">Chọn phân loại</h3>
                <div className="flex flex-wrap gap-3">
                  {product.full_variants.map((variant) => (
                    <button
                      key={variant.variant_id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1); // Reset quantity when changing variant
                      }}
                      className={`px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                        selectedVariant?.variant_id === variant.variant_id 
                          ? 'border-[#1B693C] bg-fresh-grown/10 text-[#1B693C] shadow-sm' 
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      } ${variant.stock_quantity === 0 ? 'opacity-50 line-through' : ''}`}
                    >
                      {variant.capacity_label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
              {/* Quantity */}
              <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shrink-0 h-14">
                <button 
                  onClick={() => handleQuantityChange('dec')}
                  className="px-4 h-full text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-[#362F22]">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange('inc')}
                  className="px-4 h-full text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Add to Cart */}
              <button 
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                className="flex-1 h-14 bg-[#1B693C] hover:bg-moss-green disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-understory/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <ShoppingBag size={20} />
                Thêm vào giỏ hàng
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="p-2 bg-white rounded-full shadow-sm text-understory">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#362F22]">Chính hãng 100%</h4>
                  <p className="text-xs text-gray-500">Đảm bảo nguồn gốc xuất xứ</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="p-2 bg-white rounded-full shadow-sm text-understory">
                  <Truck size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#362F22]">Giao hàng toàn quốc</h4>
                  <p className="text-xs text-gray-500">Hỗ trợ giao hàng hỏa tốc</p>
                </div>
              </div>
            </div>
            
            {/* Description */}
            {product.description && (
              <div className="mt-10">
                <h3 className="text-lg font-bold text-[#362F22] mb-4">Mô tả sản phẩm</h3>
                <div className="prose prose-sm prose-green max-w-none text-gray-600 leading-relaxed">
                  {/* Since description is likely text, we format it with line breaks */}
                  {product.description.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-3 h-3 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
