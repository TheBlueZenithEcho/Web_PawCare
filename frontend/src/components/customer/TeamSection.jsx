import { ArrowRight } from 'lucide-react';

export default function TeamSection() {
  return (
    <section className="py-20 px-6 lg:px-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <div className="lg:col-span-5 grid grid-cols-2 gap-4">
        <img src="/images/cat_hood.png" alt="Team Support 1" className="rounded-[2rem] w-full h-48 object-cover border border-[#EFF4BD]" />
        <img src="/images/pet-hat.png" alt="Team Support 2" className="rounded-[2rem] w-full h-48 object-cover border border-[#EFF4BD]" />
        <div className="col-span-2 relative rounded-[2rem] overflow-hidden shadow-md">
          <img src="/images/pet-grooming.png" alt="Professional Vet/Groomer" className="w-full h-64 object-cover" />
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col gap-6">
        <span className="text-[#556F30] font-bold tracking-wider text-sm uppercase">🐾 ĐỘI NGŨ TẬN TÂM</span>
        <h2 className="text-4xl lg:text-5xl font-black text-[#362F22] font-serif">Đội ngũ nhân viên chuyên nghiệp</h2>
        <p className="text-base text-gray-600 leading-relaxed">
          Đội ngũ chuyên viên và nhân viên tại PawCare được đào tạo bài bản, giàu kinh nghiệm thực tế và trên hết là lòng yêu thương động vật sâu sắc. Chúng tôi luôn mong muốn đem đến một không gian an toàn, dễ chịu tối đa cho các bé, đồng thời luôn sát sao theo dõi tâm lý, sức khỏe của bé để cập nhật liên tục cho ba mẹ yên tâm.
        </p>
        <div>
          <button className="bg-[#556F30] hover:bg-[#23361A] text-white font-bold px-6 py-3 rounded-full text-sm inline-flex items-center gap-2 transition-all">
            Giới thiệu chi tiết <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
