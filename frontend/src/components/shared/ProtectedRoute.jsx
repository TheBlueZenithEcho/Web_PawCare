import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';

/**
 * ProtectedRoute – wraps pages that require authentication.
 * If user is not logged in, redirects to /login?redirect=<currentPath>
 */
export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [user, authLoading, router]);

  // Still checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1B693C] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  // Not authenticated – will redirect in useEffect
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7faf7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#1B693C] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return children;
}
