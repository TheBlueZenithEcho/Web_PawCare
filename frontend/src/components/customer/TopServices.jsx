import React, { useState } from 'react';
import { Sparkles, Home, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const getServiceCardClassName = (isHovered) => {
    const baseClassName = 'relative overflow-hidden rounded-[2rem] bg-white border border-[#EFF4BD] shadow-sm transition-all duration-500 cursor-pointer group flex flex-col';
    return isHovered
        ? `${baseClassName} shadow-xl ring-2 ring-[#556F30]/20 transform -translate-y-1`
        : baseClassName;
};

export default function TopServices() {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const services = [
        {
            title: 'Dịch vụ chăm sóc',
            description: 'Spa & Grooming toàn diện cho bé cưng luôn thơm tho và lộng lẫy.',
            image: '/images/grooming.png',
            icon: Sparkles,
            path: '/dich-vu-cham-soc',
            buttonText: 'ĐẶT LỊCH TRẢI NGHIỆM NGAY',
            priceDetails: [
                { name: 'Tắm vệ sinh chuyên sâu', price: 'từ 200.000đ' },
                { name: 'Cắt tỉa & Tạo kiểu nghệ thuật', price: 'từ 250.000đ' },
                { name: 'Combo Cạo lông & Thư giãn', price: 'từ 300.000đ' }
            ]
        },
        {
            title: 'Dịch vụ lưu trú',
            description: 'Khách sạn chuẩn 5 sao, không gian riêng tư, camera 24/7 theo dõi.',
            image: '/images/hotel.png',
            icon: Home,
            path: '/dich-vu-luu-tru',
            buttonText: 'ĐẶT LỊCH TRẢI NGHIỆM NGAY',
            priceDetails: [
                { name: 'Phòng Tiêu chuẩn (Standard)', price: 'từ 150.000đ/đêm' },
                { name: 'Phòng Hoàng gia (Deluxe)', price: 'từ 250.000đ/đêm' },
                { name: 'Dịch vụ đưa đón tận nơi', price: 'Chỉ từ 50.000đ' }
            ]
        },
        {
            title: 'Cửa hàng sản phẩm',
            description: 'Cung cấp hạt dinh dưỡng, pate cao cấp và phụ kiện sành điệu cho Pet.',
            image: '/images/shop.png',
            icon: ShoppingBag,
            path: '/san-pham',
            buttonText: 'KHÁM PHÁ SẢN PHẨM NGAY',
            priceDetails: [
                { name: 'Hạt dinh dưỡng nhập khẩu', price: 'Giá cạnh tranh' },
                { name: 'Pate, bánh thưởng các loại', price: 'Nhiều ưu đãi' },
                { name: 'Đồ chơi & Phụ kiện đi kèm', price: 'Chỉ từ 45.000đ' }
            ]
        }
    ];

    return (
        <section id="top-services" className="relative py-20 px-6 lg:px-16 w-full overflow-hidden">
            {/* Decorative background blob (top-right corner) */}
            <div className="pointer-events-none absolute -top-20 -right-20 w-[420px] h-[420px] rounded-full bg-[#569930] blur-[100px] opacity-20" />

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <div>
                    <span className="text-[#556F30] font-bold tracking-wider text-sm uppercase block mb-2">🐾 LỰA CHỌN TỐT NHẤT</span>
                    <h2 className="text-4xl lg:text-5xl font-black [font-family:'Lora',serif] text-[#362F22]">Dịch vụ hàng đầu</h2>
                </div>
                <p className="text-sm font-medium text-gray-500 max-w-xs mt-4 md:mt-0 italic">
                    * Bảng giá thực tế sẽ phụ thuộc linh hoạt vào chủng loại và cân nặng của từng bé cưng.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Khối ảnh cố định/Đại diện bên trái giống file gốc mẫu */}
                <div className="hidden lg:block relative rounded-[3rem] overflow-hidden">
                    <img
                        src="/images/cat_landing_yellow.png"
                        alt="Cat Decorative"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Danh sách dịch vụ tương tác Hover */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-1 gap-6">
                    {services.map((svc, idx) => {
                        const Icon = svc.icon;
                        const isHovered = hoveredIndex === idx;

                        return (
                            <Link
                                href={svc.path}
                                key={idx}
                                className={getServiceCardClassName(isHovered)}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="flex flex-col md:flex-row items-stretch min-h-[160px]">
                                    {/* Hình ảnh */}
                                    <div className="md:w-1/3 relative min-h-[160px] md:min-h-0">
                                        <img
                                            src={svc.image}
                                            alt={svc.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Nội dung thay đổi khi hover */}
                                    <div className="md:w-2/3 p-6 flex flex-col justify-center relative">
                                        {/* View gốc khi KHÔNG Hover */}
                                        <div className={`transition-all duration-300 ${isHovered ? 'opacity-0 -translate-y-2 pointer-events-none absolute' : 'opacity-100 translate-y-0'}`}>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-[#EFF4BD] text-[#556F30] rounded-xl">
                                                    <Icon size={18} />
                                                </div>
                                                <h3 className="font-bold text-xl text-[#362F22]">{svc.title}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500 leading-relaxed pr-6">{svc.description}</p>
                                        </div>

                                        {/* View chi tiết bảng giá khi HOVER */}
                                        <div className={`transition-all duration-300 flex flex-col justify-between h-full ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none absolute'}`}>
                                            <div>
                                                <h4 className="font-bold text-[#556F30] text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <Icon size={14} /> Bảng giá tham khảo dịch vụ
                                                </h4>
                                                <div className="space-y-1.5">
                                                    {svc.priceDetails.map((p, pIdx) => (
                                                        <div key={pIdx} className="flex justify-between items-center text-sm border-b border-dashed border-[#EFF4BD] pb-1">
                                                            <span className="font-medium text-[#362F22]">{p.name}</span>
                                                            <span className="font-bold text-[#23361A] bg-[#EFF4BD]/50 px-2.5 py-0.5 rounded-full text-xs">{p.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="mt-4 flex items-center gap-1.5 font-bold text-xs text-[#556F30] hover:text-[#23361A]">
                                                {svc.buttonText} <ArrowRight size={14} className="animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}