export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

// Định nghĩa "biểu mẫu" gửi đi, khớp với RegisterRequest.java
export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string; // Dấu ? nghĩa là tùy chọn
  address?: string;
  gender: Gender;   // Bắt buộc
  birthday: string;
  captchaResponse: string; // Bắt buộc
}

export interface UserResponse {
  id: number;
  clinicId?: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  gender?: Gender;   
  birthday?: string;
  isActive: boolean;
  createdAt: string; // TypeScript sẽ xử lý LocalDateTime thành string
  roles: string[];
  extraPermissions?: string[];
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password?: string; // Chỉ bắt buộc khi tạo mới
  phoneNumber?: string;
  address?: string;
  gender?: string;
  birthday?: string;
  isActive?: boolean;
  clinicId?: number;
  roles: string[]; // Danh sách tên role: ["ROLE_ADMIN", "ROLE_DOCTOR"]
  extraPermissions?: string[];
}

// Thêm type cho Response phân trang
export interface UserResponsePage {
    content: UserResponse[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}

export interface AuthRequest {
  email: string;
  password: string;
  captchaResponse: string;
}

// Định nghĩa các lỗi có thể trả về từ backend (Validation)
export interface ValidationErrorResponse {
  [key: string]: string; // Ví dụ: { email: "Email không đúng định dạng" }
}
