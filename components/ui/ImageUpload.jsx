import { useState, useRef } from 'react';
import { Camera, X, UploadCloud } from 'lucide-react';

export default function ImageUpload({ images = [], onChange, maxImages = 5, label = "Upload ảnh" }) {
  const fileInputRef = useRef(null);
  
  const imageArray = Array.isArray(images) ? images : (images ? [images] : []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Đảm bảo không quá số lượng tối đa
      if (imageArray.length >= maxImages) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        onChange((prevImages) => {
          const prevArray = Array.isArray(prevImages) ? prevImages : (prevImages ? [prevImages] : []);
          if (prevArray.length >= maxImages) return prevArray;
          return [...prevArray, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input value to allow selecting the same file again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove) => {
    onChange(imageArray.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="w-full">
      {/* File Input */}
      <input 
        type="file" 
        accept="image/*" 
        multiple 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      {/* Nút Upload / Preview List */}
      <div className="flex flex-wrap gap-4">
        {imageArray.map((imgSrc, idx) => (
          <div key={idx} className="relative w-[140px] h-[140px] rounded-xl border border-gray-200 shadow-sm overflow-hidden group shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {imageArray.length < maxImages && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-w-[200px] h-[140px] border-2 border-dashed border-gray-300 rounded-xl text-lacustral hover:text-chloro hover:border-chloro hover:bg-chloro/5 transition-colors flex flex-col items-center justify-center gap-2 bg-white shrink-0"
          >
            <Camera size={20} />
            <span className="text-[12px] font-semibold text-center px-2">{label}</span>
          </button>
        )}
      </div>
      
      {images.length === 0 && (
        <p className="text-xs text-gray-400 mt-2">Chưa có ảnh nào được tải lên (Tối đa {maxImages} ảnh).</p>
      )}
    </div>
  );
}
