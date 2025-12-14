// Định nghĩa các trạng thái khớp với Backend (Enum)
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'PENDING_PAYMENT' | 'REFUND_PENDING';

// DTO hiển thị (Response)
export interface AppointmentResponse {
  id: number;
  createdAt: string;
  status: AppointmentStatus;
  reason?: string;

  // Thông tin Bệnh nhân
  patientId: number;
  patientName: string;
  patientPhone?: string;

  // Thông tin Bác sĩ
  doctorId: number;
  doctorName: string;
  specialtyName?: string; // <--- THÊM DÒNG NÀY (Tên chuyên khoa)
  
  // Thông tin Lịch
  clinicName: string;
  appointmentDate: string; 
  appointmentTimeSlot: string;

  // Kết quả khám (Chỉ có khi COMPLETED)
  diagnosis?: string;     // <--- THÊM DÒNG NÀY (Chẩn đoán)
  prescription?: string;  // <--- THÊM DÒNG NÀY (Đơn thuốc/Ghi chú)
}

export interface BookingRequest {
    doctorId: number;
    scheduleId: number; // ID của khung giờ (Schedule)
    reason: string;
}