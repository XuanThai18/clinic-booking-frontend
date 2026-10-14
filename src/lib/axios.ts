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

// 1. Request Interceptor: Luôn gắn Access Token vào header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Response Interceptor: Xử lý khi Token hết hạn (Lỗi 401)
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi là 401 (Unauthorized) và chưa từng thử retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Đánh dấu đã thử retry để tránh vòng lặp vô tận

            try {
                // Lấy refresh token từ storage
                const refreshToken = localStorage.getItem('refreshToken');
                
                if (!refreshToken) {
                     // Không có refresh token thì bắt đăng nhập lại luôn
                     throw new Error("No refresh token");
                }

                // Gọi API Refresh Token
                const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
                    refreshToken: refreshToken
                });

                if (res.status === 200) {
                    const { accessToken } = res.data;
                    
                    // 1. Lưu token mới vào LocalStorage
                    localStorage.setItem('accessToken', accessToken);

                    // 2. Gắn token mới vào header của request bị lỗi lúc nãy
                    originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                    // 3. Gọi lại request cũ (Retry)
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Nếu refresh cũng lỗi (hết hạn nốt) -> Logout luôn
                console.log("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// 6. Xuất (export) instance đã được cấu hình này ra
export default axiosInstance;