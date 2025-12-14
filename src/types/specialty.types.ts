// Đây là "DTO" phía frontend, khớp với SpecialtyResponse.java
export interface SpecialtyResponse {
  id: number; // Trong Java là Long, trong TypeScript là number
  name: string;
  description?: string; // Dấu ? nghĩa là trường này có thể null (tùy chọn)
  imageUrls?: string[];
}

// Em cũng có thể tạo luôn type cho Request
export interface SpecialtyRequest {
  name: string;
  description?: string;
  imageUrls?: string[];
}