import { useState, useEffect } from 'react';

// Khớp với login.jsx: sau khi authenticateCustomer() thành công với role Customer,
// app lưu localStorage.setItem('customer_user', JSON.stringify(res.user)).
// res.user chính là row của bảng `customer` (customer_id, first_name, last_name, phone, email...).
const STORAGE_KEY = 'customer_user';

/**
 * Hook đọc trạng thái đăng nhập của KHÁCH HÀNG (không phải staff — staff dùng key
 * 'staff_user' riêng và không đi qua luồng đặt lịch này).
 *
 * Dùng để phân biệt Luồng 1 (đã đăng nhập) với Luồng 2/3 (chưa đăng nhập) trong
 * các bước đặt lịch Grooming/Hotel.
 *
 * Trả về:
 * - user: object customer đã lưu trong localStorage lúc login, hoặc null nếu chưa đăng nhập.
 * - loading: true trong lúc đang đọc localStorage lần đầu (tránh flash sai luồng khi SSR/hydrate).
 */
export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readFromStorage();

    // Đồng bộ nếu khách đăng nhập/đăng xuất ở tab khác.
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) readFromStorage();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);

    function readFromStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) {
        console.error('[useAuth] localStorage parse lỗi', e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
  }, []);

  return { user, loading };
}