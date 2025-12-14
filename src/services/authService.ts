import api from '../lib/axios'; // Import instance axios đã cấu hình
import type { RegisterRequest, AuthRequest, AuthResponse } from '../types/auth.types';

/**
 * Gọi API đăng ký
 * @param data Dữ liệu từ form đăng ký
 */
export const registerApi = (data: RegisterRequest) => {
  // api.post sẽ tự động dùng baseURL (http://localhost:8080/api)
  // và gửi dữ liệu dưới dạng JSON
  return api.post<string>('/auth/register', data); // Mong đợi nhận về một chuỗi message
}

export const loginApi = (data: AuthRequest) => {
  return api.post<AuthResponse>('/auth/login', data); // Mong đợi nhận về AuthResponse
};

// Gửi email yêu cầu
export const forgotPasswordApi = (email: string) => {
    // Dùng params hoặc body tùy backend
    return api.post('/auth/forgot-password', null, { params: { email } });
};

// Gửi mật khẩu mới kèm token
export const resetPasswordApi = (token: string, newPassword: string) => {
    return api.post('/auth/reset-password', { token, newPassword });
};