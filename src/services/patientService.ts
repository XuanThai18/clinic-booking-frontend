import api from '../lib/axios';
import type { UserResponse } from '../types/auth.types';
import type { AppointmentResponse } from '../types/appointment.types';

// 1. Lấy lịch sử khám của chính mình
export const getMyHistoryApi = () => {
  return api.get<AppointmentResponse[]>('/appointments/my-history');
};

// 2. Hủy lịch hẹn (Dành cho bệnh nhân)
export const cancelMyAppointmentApi = (id: number) => {
    return api.put<void>(`/appointments/${id}/cancel`); 
};

export const getMyProfileApi = () => {
    return api.get<UserResponse>('/users/profile/me');
};

// 3. Cập nhật hồ sơ bệnh nhân
export const updateMyProfileApi = (data: Partial<UserResponse>) => {
  return api.put<UserResponse>('/users/profile/me', data);
};