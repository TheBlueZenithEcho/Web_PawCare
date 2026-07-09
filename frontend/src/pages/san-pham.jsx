import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductSidebar from '@/components/layout/ProductSidebar';
import { fetchProducts } from '@/services/supabase/supabaseShopApi';
import { Search, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Sidebar filters state
  const [filters, setFilters] = useState({
    species: 'dog',
    brand: '',
    categories: ['Tất cả'],
    price: 150,
    rating: 4
  });

  // Load products from Supabase on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
        toast.error('Lỗi khi tải danh sách sản phẩm');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Compute filtered products dynamically during render (removes need for separate state & useEffect)
  const filteredProducts = products.filter(p => {
    // Filter by Species (Dog/Cat)
    if (filters.species) {
      const matchWord = filters.species === 'dog' ? 'Chó' : 'Mèo';
      if (!p.pet_type || !p.pet_type.includes(matchWord)) return false;
    }

    // Filter by Brand
    if (filters.brand) {
      if (p.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
    }

    // Filter by Categories
    if (filters.categories && !filters.categories.includes('Tất cả')) {
      if (!filters.categories.includes(p.category)) return false;
    }

    // Filter by Price range
    if (filters.price !== undefined) {
      const vndLimit = filters.price * 25000;
      if (Number(p.price) > vndLimit) return false;
    }

    return true;
  });

  // Handle sidebar filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  // Add product to cart logic
  const handleAddToCart = (productName) => {
    setCartCount(prev => prev + 1);
    toast.success(`Đã thêm "${productName}" vào giỏ hàng!`);
  };

  // Pagination calculation
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const formatPrice = (priceVal) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceVal);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      <div>
        {/* Header layout component */}
        <Header activePath="/san-pham" cartCount={cartCount} />

        {/* Main Grid Shop Container */}
        <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-10">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Sidebar column */}
            <div className="w-full lg:w-auto shrink-0 flex justify-center lg:justify-start lg:sticky lg:top-24">
              <ProductSidebar 
                onFilterChange={handleFilterChange} 
                initialSpecies={filters.species}
                initialBrand={filters.brand}
                initialCategories={filters.categories}
                initialMaxPrice={filters.price}
                initialRating={filters.rating}
              />
            </div>

            {/* Right Products column */}
            <div className="flex-1 w-full">
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-wood-bark tracking-tight">
                  Cửa hàng
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Chăm sóc toàn diện cho người bạn bốn chân.
                </p>
              </div>

              {loading ? (
                /* Loading skeleton */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <div key={n} className="bg-gray-50 rounded-3xl p-4 border border-gray-100 animate-pulse h-80"></div>
                  ))}
                </div>
              ) : currentProducts.length === 0 ? (
                /* Empty state */
                <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100">
                  <p className="text-gray-500 font-medium">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
                  <button 
                    onClick={() => setFilters({ species: 'dog', brand: '', categories: ['Tất cả'], price: 150, rating: 4 })}
                    className="mt-4 px-5 py-2.5 bg-understory text-white font-semibold text-xs rounded-full hover:bg-moss-green transition-all"
                  >
                    Đặt lại bộ lọc
                  </button>
                </div>
              ) : (
                /* Products Grid */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentProducts.map((p) => (
                      <div 
                        key={p.id} 
                        className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-fresh-grown transition-all duration-300 p-4 flex flex-col justify-between group"
                      >
                        {/* Image wrapper */}
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4 select-none">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>

                        {/* Product details */}
                        <div className="space-y-2 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            {/* Stars rating */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                              <span className="text-[10px] text-gray-400 font-semibold ml-1">
                                (4.5/5)
                              </span>
                            </div>
                            
                            {/* Name */}
                            <h3 className="text-sm font-bold text-wood-bark line-clamp-2 leading-snug group-hover:text-understory transition-colors">
                              {p.name}
                            </h3>
                            
                            {/* Brand/Category Tag */}
                            <p className="text-[11px] text-gray-400 font-medium">
                              Thương hiệu: {p.brand}
                            </p>
                          </div>

                          {/* Price & Cart actions */}
                          <div className="pt-2">
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <span className="text-base font-extrabold text-[#1B693C]">
                                {formatPrice(p.price)}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                              </span>
                            </div>

                            {/* Actions buttons */}
                            <div className="flex gap-2">
                              {/* Cart icon button */}
                              <button 
                                onClick={() => handleAddToCart(p.name)}
                                className="p-2 rounded-xl bg-azeitona/10 text-azeitona hover:bg-azeitona hover:text-white transition-all duration-200"
                                aria-label="Thêm vào giỏ hàng"
                              >
                                <ShoppingBag size={18} />
                              </button>
                              
                              {/* Buy button */}
                              <button 
                                onClick={() => handleAddToCart(p.name)}
                                className="flex-1 py-2 px-3 rounded-xl bg-[#1B693C] text-white font-bold text-xs hover:bg-moss-green transition-all"
                              >
                                Mua hàng
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Pagination Section */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-10">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-2.5 rounded-full border border-gray-200 hover:border-understory hover:bg-gray-50 text-wood-bark disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all"
                        aria-label="Trang trước"
                      >
                        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-sm font-semibold text-gray-500">
                        {currentPage} / {totalPages}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-2.5 rounded-full border border-gray-200 hover:border-understory hover:bg-gray-50 text-wood-bark disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:border-gray-200 transition-all"
                        aria-label="Trang sau"
                      >
                        <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Footer layout component */}
      <Footer />
    </div>
  );
}
