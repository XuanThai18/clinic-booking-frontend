import api from '../lib/axios';
import type { DoctorResponse, DoctorRequest, DoctorRegistrationRequest, DoctorSelfUpdateRequest } from '../types/doctor.types';
import type { ScheduleResponse, ScheduleCreateRequest } from '../types/schedule.types';

// 1. Dùng cho trang "Quản lý Bác sĩ" (Admin)
export const getAdminDoctorsApi = () => {
  return api.get<DoctorResponse[]>('/admin/doctors');
};

// 2. Dùng cho trang "Tìm Bác Sĩ" / Trang chủ (Bệnh nhân)
export const getPublicDoctorsApi = () => {
  return api.get<DoctorResponse[]>('/public/doctors');
};

export const getDoctorByIdApi = (id: number) => {
  return api.get<DoctorResponse>(`/public/doctors/${id}`);
};

export const createDoctorApi = (data: DoctorRequest) => {
  return api.post<DoctorResponse>('/admin/doctors', data);
};

// API đăng ký bác sĩ (tạo User + Doctor cùng lúc)
export const registerDoctorApi = (data: DoctorRegistrationRequest) => {
  return api.post<DoctorResponse>('/admin/doctors/register', data);
};

export const updateDoctorApi = (id: number, data: DoctorRequest) => {
  return api.put<DoctorResponse>(`/admin/doctors/${id}`, data);
};

export const deleteDoctorApi = (id: number) => {
  return api.delete<void>(`/admin/doctors/${id}`);
};

// API lấy danh sách bác sĩ theo ID chuyên khoa
export const getDoctorsBySpecialtyApi = (specialtyId: number) => {
  return api.get<DoctorResponse[]>(`/public/specialties/${specialtyId}/doctors`);
};

// API Tạo lịch làm việc
export const createDoctorScheduleApi = (data: ScheduleCreateRequest) => {
  return api.post<ScheduleResponse[]>('/schedules', data);
};

// API Xem lịch làm việc của một bác sĩ theo ngày
// Backend: GET /api/public/doctors/{doctorId}/available-schedules?date=YYYY-MM-DD
// (Hoặc API admin tương tự nếu muốn xem cả lịch đã đặt)
export const getDoctorScheduleApi = (doctorId: number, date: string) => {
    return api.get<ScheduleResponse[]>(`/admin/doctors/${doctorId}/schedules`, {
        params: { date }
    });
};

export const getMyDoctorProfileApi = () => {
    return api.get<DoctorResponse>('/doctors/profile/me');
};

export const getPublicDoctorScheduleApi = (doctorId: number, date: string) => {
    return api.get<ScheduleResponse[]>('/public/schedules', {
        params: { doctorId, date }
    });
};

export const updateMyDoctorProfileApi = (data: DoctorSelfUpdateRequest) => {
    return api.put<DoctorResponse>('/doctor/profile/me', data);
};