import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductSidebar from '@/components/layout/ProductSidebar';

export default function TestHeaderPage() {
  const [cartCount, setCartCount] = useState(0);
  const [filters, setFilters] = useState({
    species: 'dog',
    brand: '',
    categories: ['Tất cả'],
    price: 150,
    rating: 4
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col justify-between">
      <div>
        {/* Reusable Header component */}
        <Header activePath="/san-pham" cartCount={cartCount} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Sidebar Column */}
            <div className="w-full md:w-auto shrink-0 flex justify-center md:justify-start">
              <ProductSidebar 
                onFilterChange={handleFilterChange} 
                initialSpecies={filters.species}
                initialBrand={filters.brand}
                initialCategories={filters.categories}
                initialMaxPrice={filters.price}
                initialRating={filters.rating}
              />
            </div>

            {/* Main Shop Demo Content */}
            <div className="flex-1 w-full bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="mb-6 pb-4 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-wood-bark">
                  Cửa Hàng Thú Cưng PawCare
                </h1>
                <p className="text-gray-500 text-sm">
                  Giao diện demo bộ lọc và liên kết Header/Footer/Sidebar
                </p>
              </div>

              {/* Filter state preview */}
              <div className="bg-fresh-grown/20 p-4 rounded-2xl mb-6 text-xs space-y-2 border border-fresh-grown/30">
                <h3 className="font-bold text-understory uppercase tracking-wide">Trạng thái bộ lọc (Filter State):</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-wood-bark">
                  <div><strong>Loài:</strong> {filters.species}</div>
                  <div><strong>Thương hiệu:</strong> {filters.brand || 'Tất cả'}</div>
                  <div><strong>Danh mục:</strong> {filters.categories.join(', ')}</div>
                  <div><strong>Giá tối đa:</strong> ${filters.price}</div>
                  <div><strong>Đánh giá tối thiểu:</strong> {filters.rating} sao</div>
                </div>
              </div>

              {/* Interactive Controls */}
              <div className="flex flex-wrap gap-3 items-center">
                <button 
                  onClick={() => setCartCount(prev => prev + 1)}
                  className="px-4 py-2 bg-understory text-white font-semibold rounded-full hover:bg-moss-green transition-all text-xs"
                >
                  Thêm 1 sản phẩm vào giỏ
                </button>
                <button 
                  onClick={() => setCartCount(0)}
                  className="px-4 py-2 bg-gray-100 text-gray-600 font-semibold rounded-full hover:bg-gray-200 transition-all text-xs"
                >
                  Reset giỏ hàng
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Reusable Footer component */}
      <Footer />
    </div>
  );
}
