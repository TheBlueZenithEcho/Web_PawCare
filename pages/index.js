import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Tạm thời chuyển hướng trang chủ (/) sang trang Lễ tân (/staff)
    router.push('/staff');
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">Đang chuyển hướng đến Trạm Điều Phối...</p>
    </div>
  );
}
