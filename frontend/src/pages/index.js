import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ROUTES } from '@/config/routes';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.CUSTOMER.LANDING);
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <p className="text-gray-500">Đang chuyển hướng...</p>
    </div>
  );
}
