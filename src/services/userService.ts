import api from '../lib/axios';
import type { UserResponse, CreateUserRequest, UserResponsePage } from '../types/auth.types';

// Hàm gọi API phân trang
export const getAllUsersApi = (
    page: number = 0, 
    size: number = 10, 
    keyword: string = '', 
    role: string = ''
) => {
    // Truyền tham số qua query string
    return api.get<UserResponsePage>('/admin/users', {
        params: {
            page,
            size,
            keyword,
            role
        }
    });
};

export const getUserByIdApi = (id: number) => {
  return api.get<UserResponse>(`/admin/users/${id}`); // Cần viết API này bên backend nếu chưa có
};

export const createUserApi = (data: CreateUserRequest) => {
  return api.post<UserResponse>('/admin/users', data);
};

export const updateUserApi = (id: number, data: CreateUserRequest) => {
  return api.put<UserResponse>(`/admin/users/${id}`, data); // Cần viết API này bên backend
};

export const deleteUserApi = (id: number) => {
  return api.delete<void>(`/admin/users/${id}`); // Cần viết API này bên backend
};;

export const getAllPermissionsApi = () => {
  return api.get<string[]>('/admin/permissions');
};