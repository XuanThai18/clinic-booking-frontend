import type { Gender } from './auth.types';
import type { ClinicResponse } from './clinic.types';
import type { SpecialtyResponse } from './specialty.types';

// DTO nhận về từ Backend (để hiển thị)
export interface DoctorResponse {
  doctorId: number;
  userId: number;
  fullName: string;
  email: string;
  description?: string;     // Có thể null
  academicDegree?: string;  // Có thể null
  price: number;            // BigDecimal -> number
  phoneNumber?: string;
  address?: string;
  gender: Gender;   // Bắt buộc
  birthday: string;
  
  // --- PHẦN ẢNH (Cập nhật) ---
  image?: string;           // Avatar (1 ảnh)
  otherImages?: string[];   // Ảnh bằng cấp/chứng chỉ (Nhiều ảnh)
  // --------------------------

  specialty: SpecialtyResponse; // Object lồng nhau
  clinic: ClinicResponse;       // Object lồng nhau
}

export interface DoctorRegistrationRequest {
  // Phần User
  fullName: string;
  email: string;
  password?: string; // Bắt buộc khi tạo mới
  phoneNumber?: string;
  address?: string;
  gender?: string;
  birthday?: string;
  
  // Phần Doctor
  specialtyId: number;
  clinicId: number;
  description?: string;
  academicDegree?: string;
  price: number;
  image?: string;
  otherImages?: string[];
}

// DTO gửi lên Backend (để Tạo/Sửa)
export interface DoctorRequest {
  userId: number;
  specialtyId: number;
  clinicId: number;
  fullName?: string;    
  phoneNumber?: string; 
  address?: string;     
  description?: string;
  academicDegree?: string;
  price: number;
  gender?: string;
  birthday?: string;

  // --- PHẦN ẢNH (Cập nhật) ---
  image?: string;           // Gửi lên 1 URL
  otherImages?: string[];   // Gửi lên mảng các URL
  // --------------------------
}

export interface DoctorSelfUpdateRequest {
  description?: string;
  academicDegree?: string;
  image?: string;
  otherImages?: string[];
}