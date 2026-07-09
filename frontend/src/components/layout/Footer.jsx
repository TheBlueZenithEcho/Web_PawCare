import Link from 'next/link';

// Custom Paw icon matching the brand identity (white version)
const PawIconWhite = ({ className = "w-6 h-6" }) => (
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

// Custom Social Icons to avoid missing imports in different lucide versions
const InstagramIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const MessageIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

export default function Footer() {
  const companyLinks = [
    { name: 'Về chúng tôi', path: '/ve-chung-toi' },
    { name: 'Sứ mệnh', path: '/su-menh' },
    { name: 'Liên hệ', path: '/lien-he' },
    { name: 'Tuyển dụng', path: '/tuyen-dung' }
  ];

  const supportLinks = [
    { name: 'FAQ', path: '/faq' },
    { name: 'Giao hàng & Đổi trả', path: '/giao-hang-doi-tra' },
    { name: 'Theo dõi đơn hàng', path: '/theo-doi-don-hang' },
    { name: 'Chính sách bảo mật', path: '/chinh-sach-bao-mat' }
  ];

  const resourceLinks = [
    { name: 'Hướng dẫn chăm sóc', path: '/huong-dan-cham-soc' },
    { name: 'Tìm hiểu giống loài', path: '/tim-hieu-giong-loai' },
    { name: 'Blog', path: '/blog' },
    { name: 'Nhận nuôi', path: '/nhan-nuoi' }
  ];

  const shopLinks = [
    { name: 'Tất cả sản phẩm', path: '/san-pham' },
    { name: 'Hàng mới về', path: '/san-pham?sort=new' },
    { name: 'Bán chạy nhất', path: '/san-pham?sort=best' },
    { name: 'Thẻ quà tặng', path: '/the-qua-tang' }
  ];

  return (
    <footer className="w-full text-white">
      {/* Upper Footer: Main Content */}
      <div className="bg-understory py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 xl:gap-12">
            
            {/* Column 1: Brand Info */}
            <div className="space-y-4 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <PawIconWhite className="w-8 h-8 text-fresh-grown transition-transform group-hover:scale-110" />
                <span className="text-3xl font-bold text-white tracking-tight">
                  PawCare
                </span>
              </Link>
              <p className="text-white/95 text-sm leading-relaxed max-w-xs font-sans">
                Giúp những người nuôi thú cưng tạo ra một cuộc sống tốt đẹp hơn cho người bạn nhỏ mỗi ngày.
              </p>
            </div>

            {/* Column 2: CÔNG TY */}
            <div>
              <h3 className="text-sm font-semibold text-fresh-grown tracking-wider uppercase mb-4">
                CÔNG TY
              </h3>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.path}
                      className="text-white/80 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: HỖ TRỢ */}
            <div>
              <h3 className="text-sm font-semibold text-fresh-grown tracking-wider uppercase mb-4">
                HỖ TRỢ
              </h3>
              <ul className="space-y-2.5">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.path}
                      className="text-white/80 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: TÀI NGUYÊN */}
            <div>
              <h3 className="text-sm font-semibold text-fresh-grown tracking-wider uppercase mb-4">
                TÀI NGUYÊN
              </h3>
              <ul className="space-y-2.5">
                {resourceLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.path}
                      className="text-white/80 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: CỬA HÀNG & KẾT NỐI */}
            <div>
              <h3 className="text-sm font-semibold text-fresh-grown tracking-wider uppercase mb-4">
                CỬA HÀNG
              </h3>
              <ul className="space-y-2.5 mb-6">
                {shopLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.path}
                      className="text-white/80 hover:text-white text-sm transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* CONNECT section */}
              <div>
                <h3 className="text-xs font-semibold text-fresh-grown tracking-widest uppercase mb-3">
                  KẾT NỐI
                </h3>
                <div className="flex items-center gap-3">
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full border border-white/40 hover:border-white hover:bg-white/10 transition-all text-white/90 hover:text-white"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-[18px] h-[18px]" />
                  </a>
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full border border-white/40 hover:border-white hover:bg-white/10 transition-all text-white/90 hover:text-white"
                    aria-label="Facebook"
                  >
                    <FacebookIcon className="w-[18px] h-[18px]" />
                  </a>
                  <a 
                    href="https://zalo.me" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full border border-white/40 hover:border-white hover:bg-white/10 transition-all text-white/90 hover:text-white"
                    aria-label="Zalo"
                  >
                    <MessageIcon className="w-[18px] h-[18px]" />
                  </a>
                  <a 
                    href="https://youtube.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-full border border-white/40 hover:border-white hover:bg-white/10 transition-all text-white/90 hover:text-white"
                    aria-label="Youtube"
                  >
                    <YoutubeIcon className="w-[18px] h-[18px]" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Footer: Copyright */}
      <div className="bg-wood-bark py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/60 text-xs font-sans tracking-wide">
            &copy; 2024 PawCare Pet Shop. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
