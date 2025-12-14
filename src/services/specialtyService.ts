import api from '../lib/axios'; // Import instance axios đã được cấu hình
import type { SpecialtyRequest, SpecialtyResponse } from '../types/specialty.types'; // Import "kiểu"

/**
 * API CÔNG KHAI: Lấy tất cả chuyên khoa
 */
export const getAllSpecialtiesApi = () => {
  // Báo cho axios biết ta mong đợi nhận về một MẢNG SpecialtyResponse
  return api.get<SpecialtyResponse[]>('/public/specialties');
};

/**
 * API CÔNG KHAI: Lấy chi tiết 1 chuyên khoa
 */
export const getSpecialtyByIdApi = (id: number) => {
  return api.get<SpecialtyResponse>(`/public/specialties/${id}`);
};

/**
 * API ADMIN: Tạo mới một chuyên khoa
 * Yêu cầu quyền: ADMIN hoặc SUPER_ADMIN
 */
export const createSpecialtyApi = (data: SpecialtyRequest) => {
  return api.post<SpecialtyResponse>('/admin/specialties', data)
};

export const deleteSpecialtyApi = (id: number) => {
  return api.delete(`/admin/specialties/${id}`);
};

/**
 * API ADMIN: Cập nhật một chuyên khoa
 * Yêu cầu quyền: ADMIN hoặc SUPER_ADMIN
 */
export const updateSpecialtyApi = (id: number, data: SpecialtyRequest) => {
  return api.put<SpecialtyResponse>(`/admin/specialties/${id}`, data);
};