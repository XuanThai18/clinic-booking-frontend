import { useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Import thêm Link
import { loginApi } from '../services/authService';
import type { AuthRequest } from '../types/auth.types';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../store/AuthContext';
// 1. Import file CSS Module CỦA REGISTER (chúng ta dùng chung)
import styles from './Register.module.css'; 

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Thêm state loading
  const captchaRef = useRef<ReCAPTCHA>(null);
  
  const { login } = useAuth(); 
  const navigate = useNavigate(); 
  const location = useLocation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true); // Bật loading

    const captchaToken = captchaRef.current?.getValue();
    if (!captchaToken) {
      setError('Vui lòng xác thực CAPTCHA.');
      setIsLoading(false);
      return;
    }

    const finalData: AuthRequest = { ...formData, captchaResponse: captchaToken };

    try {
      const response = await loginApi(finalData);
      const { accessToken, user } = response.data;
      
      login(accessToken, user); // Lưu vào "kho"
      
      const from = location.state?.from || '/'; 
      navigate(from); // Quay về trang trước đó hoặc trang chủ

    } catch (err) {
      setIsLoading(false); // Tắt loading
      if (axios.isAxiosError(err) && err.response) {
        // Lấy lỗi từ backend (ví dụ: "Email hoặc mật khẩu không hợp lệ.")
        // Hoặc lỗi "Tài khoản đã bị khóa..."
        setError(err.response.data.message || err.response.data); 
      } else {
        setError('Lỗi không mong muốn, vui lòng thử lại.');
      }
      captchaRef.current?.reset();
    }
  };

  // 2. Áp dụng các class CSS từ Register.module.css
  return (
    <div className={styles.registerContainer}> {/* Dùng chung style container */}
      <div className={styles.formCard}> {/* Dùng chung style card */}
        <h2 className={styles.title}>Đăng Nhập</h2> {/* Chỉ thay đổi tiêu đề */}
        
        <form onSubmit={handleSubmit}>
          
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Mật khẩu:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
              autoComplete="current-password"
            />
          </div>
          {/* 👇 THÊM LINK QUÊN MẬT KHẨU Ở ĐÂY 👇 */}
          <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 15}}>
            <Link 
              to="/forgot-password" 
              style={{fontSize: 14, color: '#007bff', textDecoration: 'none'}}
            >
              Quên mật khẩu?
            </Link>
          </div>
          
          <div className={styles.captchaContainer}>
            <ReCAPTCHA
              ref={captchaRef}
              sitekey="6LexWwksAAAAAEZ0bLvSs7CQ1TB1ROeCd_LlWzkG" 
            />
          </div>

          {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className={styles.loginLink}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};