/**
 * ==========================================
 * ⚠️ FILE GIẢ LẬP DỮ LIỆU (MOCK DATA) ⚠️
 * Tác dụng: Cung cấp dữ liệu cứng để test giao diện.
 * KHÔNG DÙNG FILE NÀY KHI ĐÃ CÓ KẾT NỐI SUPABASE.
 * ==========================================
 */

// Giả lập Database state in memory cho các tính năng chưa có Supabase
let dbBookings = [];

// Helper để format tiền
export const formatVND = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
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
