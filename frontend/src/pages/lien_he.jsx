import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ContactRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/gioi_thieu#contact');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">Đang chuyển hướng đến trang liên hệ...</p>
    </div>
  );
}
