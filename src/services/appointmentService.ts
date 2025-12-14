import api from '../lib/axios';
import type { AppointmentResponse, AppointmentStatus, BookingRequest } from '../types/appointment.types';

// Lấy toàn bộ danh sách lịch hẹn
export const getAllAppointmentsApi = () => {
  return api.get<AppointmentResponse[]>('/admin/appointments');
};

// Cập nhật trạng thái lịch hẹn (Duyệt / Hủy / Hoàn thành)
// Backend cần có API: PUT /api/admin/appointments/{id}/status?status=...
export const updateAppointmentStatusApi = (id: number, status: AppointmentStatus) => {
  return api.put<void>(`/admin/appointments/${id}/status`, null, {
    params: { status }
  });
};

// Xóa lịch hẹn (nếu cần)
export const deleteAppointmentApi = (id: number) => {
  return api.delete<void>(`/admin/appointments/${id}`);
};

// API lấy lịch hẹn của chính bác sĩ đang đăng nhập
export const getDoctorAppointmentsApi = () => {
  return api.get<AppointmentResponse[]>('/doctor/appointments');
};

export const completeAppointmentApi = (id: number, data: { diagnosis: string; prescription: string }) => {
  return api.put<void>(`/doctor/appointments/${id}/complete`, data);
};

// API Đặt lịch (Dành cho bệnh nhân)
export const bookAppointmentApi = (data: BookingRequest) => {
    return api.post('/appointments/book', data);
};

// API Tạo URL thanh toán VNPay
// Frontend gọi hàm này sau khi bookAppointmentApi thành công
export const createPaymentUrlApi = (appointmentId: number) => {
    return api.get<{ url: string }>('/payment/create-payment', {
        params: { 
            appointmentId
        }
    });
};