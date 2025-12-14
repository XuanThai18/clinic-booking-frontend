import axios from 'axios';

// 1. Định nghĩa địa chỉ Backend API của em
const API_BASE_URL = 'http://localhost:8080/api';

// 2. Tạo một instance axios mới
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. (RẤT QUAN TRỌNG) Thêm "người gác cổng" (Interceptor) cho request
// Đoạn code này sẽ tự động chạy TRƯỚC MỖI request được gửi đi
axiosInstance.interceptors.request.use(
  (config) => {
    // 4. Lấy token từ đâu đó (ví dụ: localStorage)
    const token = localStorage.getItem('accessToken'); 
    
    // 5. Nếu có token, gắn nó vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Xử lý lỗi nếu có
    return Promise.reject(error);
  }
);

// 6. Xuất (export) instance đã được cấu hình này ra
export default axiosInstance;