import { useState } from 'react';
import { ChevronDown, Star } from 'lucide-react';

// Custom Paw icon matching the brand identity
const PawIcon = ({ className = "w-4 h-4" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Main Pad */}
    <path d="M12 14c-1.8 0-3.2 1.4-3.2 3.2 0 1.8 1.4 3.2 3.2 3.2s3.2-1.4 3.2-3.2c0-1.8-1.4-3.2-3.2-3.2z" />
    {/* Toes (left to right) */}
    <circle cx="6" cy="11.5" r="1.8" />
    <circle cx="9.5" cy="7.5" r="1.8" />
    <circle cx="14.5" cy="7.5" r="1.8" />
    <circle cx="18" cy="11.5" r="1.8" />
  </svg>
);

export default function ProductSidebar({ 
  onFilterChange,
  initialSpecies = 'dog',
  initialBrand = '',
  initialCategories = ['Tất cả'],
  initialMaxPrice = 150,
  initialRating = 4
}) {
  // Local state so the component is fully functional out-of-the-box
  const [species, setSpecies] = useState(initialSpecies);
  const [brand, setBrand] = useState(initialBrand);
  const [categories, setCategories] = useState(initialCategories);
  const [price, setPrice] = useState(initialMaxPrice);
  const [rating, setRating] = useState(initialRating);

  const notifyChange = (updatedFilters) => {
    if (onFilterChange) {
      onFilterChange({
        species,
        brand,
        categories,
        price,
        rating,
        ...updatedFilters
      });
    }
  };

  const handleSpeciesChange = (value) => {
    setSpecies(value);
    notifyChange({ species: value });
  };

  const handleBrandChange = (e) => {
    const value = e.target.value;
    setBrand(value);
    notifyChange({ brand: value });
  };

  const handleCategoryChange = (categoryName) => {
    let updated;
    if (categoryName === 'Tất cả') {
      updated = ['Tất cả'];
    } else {
      // Remove 'Tất cả' if selected another category
      const filtered = categories.filter(c => c !== 'Tất cả');
      if (filtered.includes(categoryName)) {
        updated = filtered.filter(c => c !== categoryName);
        if (updated.length === 0) updated = ['Tất cả'];
      } else {
        updated = [...filtered, categoryName];
      }
    }
    setCategories(updated);
    notifyChange({ categories: updated });
  };

  const handlePriceChange = (e) => {
    const value = Number(e.target.value);
    setPrice(value);
    notifyChange({ price: value });
  };

  const handleRatingChange = (value) => {
    setRating(value);
    notifyChange({ rating: value });
  };

  const brandOptions = [
    { value: '', label: 'Tất cả thương hiệu' },
    { value: 'royal-canin', label: 'Royal Canin' },
    { value: 'whiskas', label: 'Whiskas' },
    { value: 'pedigree', label: 'Pedigree' },
    { value: 'ciao', label: 'Ciao Churu' }
  ];

  const categoryList = [
    'Tất cả',
    'Thức ăn',
    'Vệ sinh',
    'Đồ chơi & Phụ kiện'
  ];

  return (
    <aside className="w-full max-w-[280px] bg-wood-bark text-white p-6 rounded-3xl shadow-lg flex flex-col gap-6 font-sans">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-fresh-grown tracking-tight">Bộ lọc</h2>
        <p className="text-white/60 text-xs mt-1 font-light">Thu hẹp phạm vi tìm kiếm</p>
      </div>

      {/* Section 1: Loài (Species) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fresh-grown/90 uppercase tracking-wider">
          Loài
        </h3>
        <div className="flex flex-col gap-2">
          {/* Dog Button */}
          <button
            onClick={() => handleSpeciesChange('dog')}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              species === 'dog'
                ? 'bg-fresh-grown text-understory shadow-md transform scale-[1.02]'
                : 'bg-transparent text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <PawIcon className={`w-4 h-4 ${species === 'dog' ? 'text-understory' : 'text-white'}`} />
            Dog
          </button>
          
          {/* Cat Button */}
          <button
            onClick={() => handleSpeciesChange('cat')}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
              species === 'cat'
                ? 'bg-fresh-grown text-understory shadow-md transform scale-[1.02]'
                : 'bg-transparent text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <PawIcon className={`w-4 h-4 ${species === 'cat' ? 'text-understory' : 'text-white'}`} />
            Cat
          </button>
        </div>
      </div>

      {/* Section 2: Thương hiệu (Brand) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fresh-grown/90 uppercase tracking-wider">
          Thương hiệu
        </h3>
        <div className="relative">
          <select
            value={brand}
            onChange={handleBrandChange}
            className="w-full bg-white text-gray-700 py-2.5 px-4 pr-10 rounded-xl text-sm font-medium border-none outline-none appearance-none cursor-pointer shadow-sm focus:ring-2 focus:ring-fresh-grown/50"
          >
            {brandOptions.map(option => (
              <option key={option.value} value={option.value} className="text-gray-700">
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Section 3: Danh mục (Category) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fresh-grown/90 uppercase tracking-wider">
          Danh mục
        </h3>
        <div className="flex flex-col gap-3">
          {categoryList.map((cat) => {
            const isChecked = categories.includes(cat);
            return (
              <label 
                key={cat} 
                className="flex items-center gap-3 cursor-pointer group text-sm select-none"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryChange(cat)}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
                    isChecked 
                      ? 'bg-fresh-grown border-fresh-grown' 
                      : 'border-white/40 group-hover:border-white'
                  }`}>
                    {isChecked && (
                      <svg className="w-3.5 h-3.5 text-understory fill-current" viewBox="0 0 20 20">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className={`transition-colors ${isChecked ? 'text-fresh-grown font-medium' : 'text-white/80 group-hover:text-white'}`}>
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Section 4: Mức giá (Price range) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fresh-grown/90 uppercase tracking-wider">
          Mức giá
        </h3>
        <div className="flex flex-col gap-2">
          <input
            type="range"
            min="0"
            max="150"
            value={price}
            onChange={handlePriceChange}
            className="w-full accent-fresh-grown bg-white/20 h-1.5 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/70 font-medium">
            <span>$0</span>
            <span className="text-fresh-grown font-bold">${price}+</span>
          </div>
        </div>
      </div>

      {/* Section 5: Đánh giá (Rating) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-fresh-grown/90 uppercase tracking-wider">
          Đánh giá
        </h3>
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => handleRatingChange(rating === 4 ? 5 : 4)}>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-white/30'
                }
              />
            ))}
          </div>
          <span className="text-xs text-fresh-grown group-hover:underline font-medium">
            & up
          </span>
        </div>
      </div>

    </aside>
  );
}
