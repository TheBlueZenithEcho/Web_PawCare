import { Star } from 'lucide-react';

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#EFF4BD]/20 px-6 lg:px-16 w-full text-center">
      <div className="max-w-3xl mx-auto mb-12 flex flex-col gap-3">
        <span className="text-[#556F30] font-bold tracking-wider text-sm uppercase">🐾 KHÁCH HÀNG CHIA SẺ</span>
        <h2 className="text-4xl font-black text-[#362F22] font-serif">Nhận xét từ khách hàng</h2>
        <p className="text-sm text-gray-500">PawCare luôn ghi nhận những đóng góp quý báu đến từ khách hàng để nâng tầm chất lượng dịch vụ mỗi ngày.</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white border border-[#EFF4BD] rounded-[2.5rem] p-8 lg:p-12 shadow-sm relative">
        <div className="flex justify-center gap-1 text-orange-400 mb-6">
          {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
        </div>
        <p className="text-base text-[#362F22] italic font-medium leading-relaxed mb-6">
          "Dịch vụ vô cùng chuyên nghiệp, các bạn nhân viên cắt tỉa lông siêu tỉ mỉ và mát tay. Bé cưng nhà mình mỗi khi tới đây đều rất phấn khích, chạy nhảy thoải mái chứ không hề sợ sệt. Chắc chắn sẽ lựa chọn PawCare làm điểm đến quen thuộc lâu dài!"
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#556F30] text-white font-bold flex items-center justify-center text-sm shadow-inner">
            VT
          </div>
          <div className="text-left">
            <h4 className="font-bold text-[#362F22]">Văn Trường</h4>
            <p className="text-xs text-gray-400 font-medium">Ba của bé Golden tinh nghịch</p>
          </div>
        </div>
      </div>
    </section>
  );
}
