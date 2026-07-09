/**
 * ROUTES – Trung tâm quản lý tất cả đường dẫn (path) của ứng dụng.
 * Dùng các hằng số này thay vì hard-code chuỗi string rải rác trong code.
 *
 * Cách dùng:
 *   import { ROUTES } from '@/config/routes';
 *   router.push(ROUTES.CUSTOMER.LANDING);
 */

export const ROUTES = {
  // ── Trang gốc ──────────────────────────────────────────────────────────────
  ROOT: '/',

  // ── Auth ────────────────────────────────────────────────────────────────────
  LOGIN: '/login',
  REGISTER: '/register',

  // ── Khách hàng (Customer) ───────────────────────────────────────────────────
  CUSTOMER: {
    ROOT: '/customer',           // redirect → LANDING
    LANDING: '/customer/landing',
    ACCOUNT: '/customer/account',

    SHOP: {
      ROOT: '/customer/shop',
      DETAIL: (id) => `/customer/shop/${id}`,   // dynamic: /customer/shop/[id]
      CART: '/customer/shop/cart',
      CHECKOUT: '/customer/shop/checkout',
    },
  },

  // ── Nhân viên (Staff) ───────────────────────────────────────────────────────
  STAFF: {
    ROOT: '/staff',
    USERS: '/staff/users',
    BOOKING: '/staff/booking',

    EMERGENCY: '/staff/emergency',
    GROOMER: '/staff/groomer',
    INVENTORY: '/staff/inventory',
    SHOP: '/staff/shop',
    SITTER: '/staff/sitter',
  },
};

/**
 * DEFAULT_REDIRECT – Trang mặc định sau khi đăng nhập theo role.
 */
export const DEFAULT_REDIRECT = {
  customer: ROUTES.CUSTOMER.LANDING,
  staff: ROUTES.STAFF.BOOKING,
  admin: ROUTES.STAFF.USERS,
};
