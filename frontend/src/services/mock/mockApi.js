/**
 * ==========================================
 * ⚠️ FILE GIẢ LẬP DỮ LIỆU (MOCK DATA) ⚠️
 * Tác dụng: Cung cấp dữ liệu cứng để test giao diện.
 * KHÔNG DÙNG FILE NÀY KHI ĐÃ CÓ KẾT NỐI SUPABASE.
 * ==========================================
 */

import { SERVICES } from './mockServices';
import { BOOKINGS as MOCK_BOOKINGS } from './mockBookings';
import { PRODUCTS } from './mockProducts';

// Giả lập Database state in memory
let dbBookings = [...MOCK_BOOKINGS];
let dbProducts = [...PRODUCTS];

export const fetchProducts = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  let result = [...dbProducts];
  if (filters.category && filters.category !== 'Tất cả') {
    result = result.filter(p => p.category === filters.category);
  }
  if (filters.pet_type && filters.pet_type !== 'Tất cả') {
    result = result.filter(p => p.pet_type.includes(filters.pet_type));
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term));
  }
  return result;
};

// Helper để format tiền
export const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm lấy danh sách dịch vụ
export const fetchServices = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return SERVICES;
};

// Hàm lấy danh sách booking kèm thông tin dịch vụ (JOIN)
// API: GET /api/v1/staff/bookings
export const fetchBookings = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let result = dbBookings.map(booking => {
    // Tìm dịch vụ chính
    const mainService = SERVICES.find(s => s.id === booking.service_id) || {};
    // Tìm các dịch vụ phát sinh
    const addons = (booking.addons || []).map(id => SERVICES.find(s => s.id === id)).filter(Boolean);
    
    // Tính tổng tiền = Dịch vụ chính + Phát sinh
    // Sửa: Lấy booking.total_amount làm gốc (do lúc đặt phòng/lịch đã tính số đêm/giá cố định).
    // Chỉ cộng thêm addon vào base price nếu cần thiết (hoặc coi như total_amount đã bao gồm).
    // Ở đây ta giữ booking.total_amount là giá trị chính xác nhất.
    const addonTotal = addons.reduce((sum, s) => sum + (s.price || 0), 0);
    // Nếu booking.total_amount đã có, ưu tiên sử dụng. Nếu không, tính từ service
    const finalTotalAmount = booking.total_amount || ((mainService.price || 0) + addonTotal);

    return {
      ...booking,
      service_category: mainService.category || booking.service_type || 'Khác',
      service_name: mainService.name || 'Không xác định',
      addons_detail: addons, // Chi tiết dịch vụ phát sinh
      total_amount: finalTotalAmount
    };
  });

  // Apply filters
  if (filters.status && filters.status !== 'ALL') {
    result = result.filter(b => b.status === filters.status);
  }
  if (filters.search_keyword) {
    const kw = filters.search_keyword.toLowerCase();
    result = result.filter(b => 
      b.customer_name?.toLowerCase().includes(kw) ||
      b.customer_phone?.includes(kw) ||
      b.pet_name?.toLowerCase().includes(kw) ||
      b.booking_id?.toLowerCase().includes(kw)
    );
  }

  return result;
};

// API: POST /api/v1/staff/bookings/{booking_id}/check-in
export const checkInBooking = async (booking_id, checkInData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  dbBookings = dbBookings.map(b => b.booking_id === booking_id ? {
    ...b,
    ...checkInData, // Gồm weight, clinical_status, reception_notes, before_photos, addons
    status: 'PROCESSING'
  } : b);
  return true;
};

// API: PUT /api/v1/staff/bookings/{booking_id}/service-log
export const updateServiceLog = async (booking_id, logData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  dbBookings = dbBookings.map(b => b.booking_id === booking_id ? {
    ...b,
    ...logData, // after_weight, pet_behavior, hotel_diary, after_photos
    status: 'COMPLETED_SERVICE'
  } : b);
  return true;
};

// API: POST /api/v1/staff/bookings/{booking_id}/checkout
export const checkoutBooking = async (booking_id, checkoutData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  dbBookings = dbBookings.map(b => b.booking_id === booking_id ? {
    ...b,
    ...checkoutData, // late_fee, additional_fee, additional_notes, voucher_code, payment_method
    status: 'DONE'
  } : b);
  return true;
};

// API: POST /api/v1/staff/bookings/{booking_id}/report-incident
export const reportIncident = async (booking_id, incidentData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  dbBookings = dbBookings.map(b => b.booking_id === booking_id ? {
    ...b,
    incident: incidentData, // incident_type, description, actions_taken, action_notes
    has_incident: true,
    incident_status: incidentData.status || 'NEW', // NEW, HANDLING, RESOLVED
    incident_reported_at: new Date().toISOString()
  } : b);
  return true;
};

// API: GET /api/v1/staff/incidents
export const fetchIncidents = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const incidents = dbBookings
    .filter(b => b.has_incident)
    .map((b, index) => ({
      id: `INC-${String(index + 100).padStart(4, '0')}`,
      booking_id: b.booking_id,
      pet_name: b.pet_name,
      pet_type: b.pet_type,
      customer_name: b.customer_name,
      customer_phone: b.customer_phone,
      incident_type: b.incident?.incident_type || 'OTHER',
      severity: 'HIGH', // Default or calculate based on type
      status: b.incident_status || 'NEW',
      reported_at: b.incident_reported_at || new Date().toISOString(),
      description: b.incident?.description || '',
      action_notes: b.incident?.action_notes || '',
      actions_taken: b.incident?.actions_taken || {},
      reported_by: 'Staff',
      handler_notes: b.incident_handler_notes || ''
    }));
  return incidents;
};

// API: PUT /api/v1/staff/incidents/{incident_id}/status
export const updateIncidentStatus = async (booking_id, status, handler_notes = '') => {
  await new Promise(resolve => setTimeout(resolve, 300));
  dbBookings = dbBookings.map(b => {
    if (b.booking_id === booking_id) {
      let updatedStatus = b.status;
      if (b.incident?.incident_type === 'REFUND' && status === 'RESOLVED') {
        updatedStatus = 'CANCELLED';
      }
      return {
        ...b,
        status: updatedStatus,
        incident_status: status,
        incident_handler_notes: handler_notes || b.incident_handler_notes
      };
    }
    return b;
  });
  return true;
};

// API: POST /api/v1/staff/bookings/{booking_id}/diaries
export const addDiaryEntry = async (booking_id, diaryData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  dbBookings = dbBookings.map(b => {
    if (b.booking_id === booking_id) {
      const updatedDiaries = [...(b.diaries || []), diaryData];
      return { ...b, diaries: updatedDiaries };
    }
    return b;
  });
  return true;
};

// API: POST /api/v1/staff/bookings/{booking_id}/complete
export const completeGrooming = async (booking_id, groomerData) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  dbBookings = dbBookings.map(b => {
    if (b.booking_id === booking_id) {
      return { 
        ...b, 
        status: 'COMPLETED_SERVICE',
        groomer_notes: groomerData.service_notes,
        health_record: groomerData.health_record
      };
    }
    return b;
  });
  return true;
};

export const updateBookingStatus = async (booking_id, status) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  dbBookings = dbBookings.map(b => b.booking_id === booking_id ? { ...b, status } : b);
  return true;
};

// API: POST /api/v1/staff/bookings
export const createBooking = async (bookingData) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const newBooking = {
    booking_id: `${bookingData.service_category === 'Hotel' || bookingData.service_type === 'Hotel' ? 'HT' : 'GS'}-${String(dbBookings.length + 1).padStart(5, '0')}`,
    ...bookingData,
    status: 'CONFIRMED',
    total_amount: bookingData.total_amount || 0,
    deposit_amount: bookingData.deposit_amount || 0,
    addons: bookingData.addons || []
  };
  dbBookings = [newBooking, ...dbBookings];
  return newBooking;
};
